import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const SIMPLE_UPLOAD_THRESHOLD = 20 * 1024 * 1024; // Files <= 20MB use simple upload
const CONCURRENT_CHUNKS = 3; // Upload 3 chunks concurrently

/**
 * Raw PUT to OSS using XMLHttpRequest.
 * Sets Content-Type header to match the presigned URL signature.
 * Also supports upload progress tracking.
 */
function putToOss(url, data, contentType, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        // Set Content-Type to match the presigned URL signature
        if (contentType) {
            xhr.setRequestHeader("Content-Type", contentType);
        }

        if (onProgress) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                    status: xhr.status,
                    etag: xhr.getResponseHeader("ETag")
                });
            } else {
                reject(new Error("OSS PUT failed: " + xhr.status));
            }
        };

        xhr.onerror = () => reject(new Error("OSS PUT network error"));
        xhr.send(data);
    });
}

/**
 * OSS Direct Upload Utility
 * Handles presigned URL uploads and multipart uploads directly to OSS
 */
const OssUpload = {
    async upload(file, params) {
        const { md5, folderId, fileName, fileType, onProgress } = params;
        const contentType = file.type || 'application/octet-stream';

        if (file.size <= SIMPLE_UPLOAD_THRESHOLD) {
            await this.simpleUpload(file, { md5, folderId, fileName, fileType, contentType, onProgress });
        } else {
            await this.multipartUpload(file, { md5, folderId, fileName, fileType, contentType, onProgress });
        }
    },

    /**
     * Simple upload: Get presigned PUT URL, upload directly
     */
    async simpleUpload(file, params) {
        const { md5, folderId, fileName, fileType, contentType, onProgress } = params;

        // 1. Get presigned URL from backend
        const presignRes = await axios.post("/disk/api/oss/presign", {
            folderId: folderId,
            fileName: fileName,
            md5: md5,
            fileSize: file.size,
            fileType: fileType,
            contentType: contentType
        });

        if (!presignRes.data.success) {
            throw new Error(presignRes.data.message || "Failed to get presigned URL");
        }

        const { presignedUrl, fileKey } = presignRes.data.result;

        // 2. Upload file directly to OSS with real-time progress
        await putToOss(presignedUrl, file, contentType, onProgress);

        // 3. Register file in backend database
        await axios.post("/disk/api/oss/register", {
            folderId: folderId,
            fileName: fileName,
            md5: md5,
            fileSize: file.size,
            fileType: fileType,
            fileKey: fileKey
        });

        if (onProgress) onProgress(100);
    },

    /**
     * Multipart upload with concurrent chunk transfer and byte-level progress
     */
    async multipartUpload(file, params) {
        const { md5, folderId, fileName, fileType, contentType, onProgress } = params;

        // 1. Initiate multipart upload
        const initRes = await axios.post("/disk/api/oss/multipart/init", {
            folderId: folderId,
            fileName: fileName,
            md5: md5,
            fileSize: file.size,
            fileType: fileType
        });

        if (!initRes.data.success) {
            throw new Error(initRes.data.message || "Failed to init multipart upload");
        }

        const { uploadId, fileKey } = initRes.data.result;

        // 2. Split file into chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadedBytes = { value: 0 };
        const parts = new Array(totalChunks); // { partNumber, eTag }

        // Byte-level progress callback for each chunk
        const onChunkProgress = (chunkIndex, chunkLoaded, chunkTotal) => {
            // Recalculate total progress: (sum of all completed chunks + current chunk progress) / total file size
            let completedBytes = 0;
            for (let i = 0; i < totalChunks; i++) {
                if (parts[i]) {
                    // This chunk is fully uploaded
                    const size = Math.min((i + 1) * CHUNK_SIZE, file.size) - i * CHUNK_SIZE;
                    completedBytes += size;
                } else if (i === chunkIndex) {
                    completedBytes += chunkLoaded;
                }
            }
            if (onProgress) {
                onProgress(Math.min(Math.round((completedBytes / file.size) * 100), 99));
            }
        };

        // 3. Upload chunks with concurrency control
        const uploadChunk = async (chunkIndex) => {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const partNumber = chunkIndex + 1;

            // Get presigned URL for this chunk
            const presignRes = await axios.post("/disk/api/oss/multipart/presign", {
                fileKey: fileKey,
                uploadId: uploadId,
                partNumber: partNumber,
                contentType: contentType
            });

            if (!presignRes.data.success) {
                throw new Error("Failed to get part presigned URL for chunk " + partNumber);
            }

            const presignedUrl = presignRes.data.result;

            // Upload chunk with byte-level progress
            const uploadRes = await putToOss(presignedUrl, chunk, contentType, (pct) => {
                onChunkProgress(chunkIndex, Math.round((pct / 100) * chunk.size), chunk.size);
            });

            // Store result
            const eTag = uploadRes.etag;
            if (!eTag) {
                throw new Error("No ETag returned for chunk " + partNumber);
            }
            parts[chunkIndex] = {
                partNumber: partNumber,
                eTag: eTag.replace(/"/g, "")
            };
        };

        // Concurrent upload with pool
        let nextChunkIndex = 0;
        const runWorker = async () => {
            while (nextChunkIndex < totalChunks) {
                const idx = nextChunkIndex++;
                await uploadChunk(idx);
            }
        };

        const workers = [];
        const concurrency = Math.min(CONCURRENT_CHUNKS, totalChunks);
        for (let w = 0; w < concurrency; w++) {
            workers.push(runWorker());
        }
        await Promise.all(workers);

        // 4. Complete multipart upload
        const partNumbers = parts.map(p => p.partNumber);
        const partETags = parts.map(p => p.eTag);

        await axios.post("/disk/api/oss/multipart/complete", {
            fileKey: fileKey,
            uploadId: uploadId,
            partNumbers: partNumbers,
            partETags: partETags
        });

        // 5. Register file in backend database
        await axios.post("/disk/api/oss/register", {
            folderId: folderId,
            fileName: fileName,
            md5: md5,
            fileSize: file.size,
            fileType: fileType,
            fileKey: fileKey,
            uploadId: uploadId
        });

        if (onProgress) onProgress(100);
    }
};

export default OssUpload;
