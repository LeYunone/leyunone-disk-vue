import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart
const SIMPLE_UPLOAD_THRESHOLD = 5 * 1024 * 1024; // Files <= 5MB use simple upload

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

        // 2. Upload file directly to OSS
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
     * Multipart upload: Split into chunks, upload each with presigned URL, then complete
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

        // 2. Split file into chunks and upload each
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const partNumbers = [];
        const partETags = [];

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const partNumber = i + 1;

            // Get presigned URL for this chunk
            const presignRes = await axios.post("/disk/api/oss/multipart/presign", {
                fileKey: fileKey,
                uploadId: uploadId,
                partNumber: partNumber,
                contentType: contentType
            });

            if (!presignRes.data.success) {
                throw new Error("Failed to get part presigned URL");
            }

            const presignedUrl = presignRes.data.result;

            // Upload chunk to OSS
            const uploadRes = await putToOss(presignedUrl, chunk, contentType);

            // Get ETag from response
            const eTag = uploadRes.etag;
            if (eTag) {
                partNumbers.push(partNumber);
                partETags.push(eTag.replace(/"/g, ""));
            }

            // Report progress
            if (onProgress) {
                const percent = Math.round(((i + 1) / totalChunks) * 100);
                onProgress(percent);
            }
        }

        // 3. Complete multipart upload
        await axios.post("/disk/api/oss/multipart/complete", {
            fileKey: fileKey,
            uploadId: uploadId,
            partNumbers: partNumbers,
            partETags: partETags
        });

        // 4. Register file in backend database
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
