import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart
const SIMPLE_UPLOAD_THRESHOLD = 5 * 1024 * 1024; // Files <= 5MB use simple upload

/**
 * OSS Direct Upload Utility
 * Handles presigned URL uploads and multipart uploads directly to OSS
 */
const OssUpload = {
    /**
     * Upload a file directly to OSS using presigned URL
     * Automatically chooses simple or multipart upload based on file size
     *
     * @param {File} file - The file to upload
     * @param {Object} params - Upload parameters
     * @param {string} params.md5 - File MD5 hash
     * @param {number} params.folderId - Target folder ID
     * @param {string} params.fileName - File name
     * @param {string} params.fileType - File extension
     * @param {Function} params.onProgress - Progress callback (0-100)
     * @returns {Promise<void>}
     */
    async upload(file, params) {
        const { md5, folderId, fileName, fileType, onProgress } = params;

        if (file.size <= SIMPLE_UPLOAD_THRESHOLD) {
            await this.simpleUpload(file, { md5, folderId, fileName, fileType, onProgress });
        } else {
            await this.multipartUpload(file, { md5, folderId, fileName, fileType, onProgress });
        }
    },

    /**
     * Simple upload: Get presigned PUT URL, upload directly
     */
    async simpleUpload(file, params) {
        const { md5, folderId, fileName, fileType, onProgress } = params;

        // 1. Get presigned URL from backend
        const presignRes = await axios.post("/disk/api/oss/presign", {
            folderId: folderId,
            fileName: fileName,
            md5: md5,
            fileSize: file.size,
            fileType: fileType
        });

        if (!presignRes.data.success) {
            throw new Error(presignRes.data.message || "Failed to get presigned URL");
        }

        const { presignedUrl, fileKey } = presignRes.data.result;

        // 2. Upload file directly to OSS using presigned URL
        await axios.put(presignedUrl, file, {
            headers: { "Content-Type": "application/octet-stream" },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    onProgress(percent);
                }
            }
        });

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
        const { md5, folderId, fileName, fileType, onProgress } = params;

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
                partNumber: partNumber
            });

            if (!presignRes.data.success) {
                throw new Error("Failed to get part presigned URL");
            }

            const presignedUrl = presignRes.data.result;

            // Upload chunk to OSS
            const uploadRes = await axios.put(presignedUrl, chunk, {
                headers: { "Content-Type": "application/octet-stream" }
            });

            // Get ETag from response headers
            const eTag = uploadRes.headers.etag;
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
