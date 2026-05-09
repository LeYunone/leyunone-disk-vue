<template>
    <div id="global-uploader">
        <div class="upload-toolbar">
            <div class="toolbar-actions">
                <el-dropdown trigger="click">
                    <el-button type="primary" round>
                        <el-icon><Upload /></el-icon>
                        <span>上传文件</span>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="triggerFileInput(false)">上传文件</el-dropdown-item>
                            <el-dropdown-item @click="triggerFileInput(true)">上传文件夹</el-dropdown-item>
                            <el-dropdown-item @click="uploadImgDrawer = true">发布图片</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <input
                    ref="fileInput"
                    type="file"
                    style="display: none"
                    :webkitdirectory="isFolderUpload"
                    @change="handleFileSelect"
                />
                <el-button round @click="folderDrawer = true">
                    <el-icon><FolderAdd /></el-icon>
                    <span>新建文件夹</span>
                </el-button>
                <el-input
                    placeholder="找找看有什么文件喵~"
                    size="default"
                    v-model="nameCondition"
                    class="search-input"
                    clearable
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
            </div>
        </div>

        <!-- Upload Progress Panel -->
        <transition name="slide-down">
            <div v-if="uploadTasks.length > 0" class="upload-panel">
                <div class="panel-corner-star" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.09 8.26L20.18 8.63L15.54 12.64L17.12 19.37L12 15.77L6.88 19.37L8.46 12.64L3.82 8.63L9.91 8.26L12 2Z" fill="#ff6b9d"/>
                    </svg>
                </div>
                <div class="panel-header">
                    <span class="panel-title">上传列表 ({{uploadTasks.length}})</span>
                    <el-button text size="small" @click="clearCompleted">清空已完成</el-button>
                </div>
                <div class="upload-list">
                    <div v-for="task in uploadTasks" :key="task.id" class="upload-item">
                        <div class="upload-item-info">
                            <span class="upload-item-name">{{task.fileName}}</span>
                            <span class="upload-item-status" :class="task.status">
                                <template v-if="task.status === 'uploading'">{{task.progress}}%</template>
                                <template v-else-if="task.status === 'success'">完成 ✨</template>
                                <template v-else-if="task.status === 'error'">失败 💦</template>
                                <template v-else>等待中...</template>
                            </span>
                        </div>
                        <el-progress
                            :percentage="task.progress"
                            :status="task.status === 'error' ? 'exception' : task.status === 'success' ? 'success' : ''"
                            :stroke-width="6"
                            :show-text="false"
                        />
                    </div>
                </div>
            </div>
        </transition>
    </div>

    <!-- Image Upload Drawer -->
    <el-dialog
        width="600px"
        title="发布图片"
        v-model="uploadImgDrawer"
        :before-close="uploadImgDrawerClose"
        class="fresh-dialog"
        :fullscreen="isMobile"
        round>
        <div class="block">
            <span class="input-line">
                <span class="demonstration">文件夹：</span>
                <el-cascader
                    placeholder="选择文件夹"
                    :options="folderTree"
                    @change="imgSelectParentFolder"
                    :props="{ checkStrictly: true }"
                    filterable
                    clearable
                />
            </span>
            <span class="input-line">
                <span class="demonstration">日期前缀：</span>
                <el-switch v-model="easyUploadForm.hasDate" />
            </span>
        </div>
        <div style="padding: 20px">
            <el-upload action="/disk/api/file/upload"
                       :data="easyUploadForm"
                       :drag="true"
                       :on-success="imgUploadSuccess"
                       list-type="picture-card"
                       :auto-upload="true">
                <el-icon class="upload-icon"><Plus /></el-icon>
            </el-upload>
        </div>
        <div v-if="uploadImgUrl" class="upload-img-url">图片路径：{{uploadImgUrl}}</div>
    </el-dialog>

    <!-- New Folder Dialog -->
    <el-dialog
        title="新建目录"
        v-model="folderDrawer"
        width="420px"
        :before-close="folderDrawerClose"
        :fullscreen="isMobile"
        class="fresh-dialog">
        <el-form label-width="80px" label-position="top">
            <el-form-item label="目录名称">
                <el-input v-model="newFolderName" placeholder="请输入目录名" clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="folderDrawer = false">取消</el-button>
            <el-button type="primary" @click="createFolder">确定</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import SparkMD5 from 'spark-md5'
    import bus from "../js/bus"
    import OssUpload from "../js/oss-upload"

    export default {
        data() {
            return {
                isMobile: window.innerWidth <= 768,
                folderTree: [],
                nameCondition: "",
                uploadTasks: [],
                taskIdCounter: 0,
                isFolderUpload: false,
                folderDrawer: false,
                uploadImgDrawer: false,
                uploadImgUrl: "",
                easyUploadForm: {
                    hasDate: true,
                    easyUpload: true,
                    parentId: "",
                    fileType: 1
                },
                newFolderName: "",
            }
        },
        mounted: function () {
            this._resizeHandler = () => { this.isMobile = window.innerWidth <= 768; };
            window.addEventListener('resize', this._resizeHandler);
            this.getFolderTree();
        },
        beforeUnmount() {
            window.removeEventListener('resize', this._resizeHandler);
        },
        methods: {
            handleBusDiskInfo() {
                bus.emit("diskInfo");
            },

            triggerFileInput(isFolder) {
                this.isFolderUpload = isFolder;
                this.$nextTick(() => {
                    this.$refs.fileInput.click();
                });
            },

            handleFileSelect(event) {
                const files = event.target.files;
                if (!files || files.length === 0) return;

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.size === 0) continue;
                    this.processFile(file);
                }
                // Reset input so same file can be re-selected
                event.target.value = '';
            },

            processFile(file) {
                const task = {
                    id: ++this.taskIdCounter,
                    fileName: file.name,
                    progress: 0,
                    status: 'pending', // pending, uploading, success, error
                    file: file
                };
                this.uploadTasks.push(task);

                // Calculate MD5 then upload
                this.calculateMD5(file).then(md5 => {
                    // Check dedup first
                    return axios.post("/disk/api/pre/requestUploadFile", {
                        uniqueIdentifier: md5,
                        folderId: this.loadParams(),
                        fileName: file.name
                    }).then(res => {
                        const data = res.data;
                        if (!data.success) {
                            task.status = 'error';
                            ElMessage.error(data.message);
                            return;
                        }
                        const responseType = data.result.responseType;
                        if (responseType === 0) {
                            // File already exists (dedup / 秒传)
                            task.progress = 100;
                            task.status = 'success';
                            ElMessage.success("文件已存在，秒传成功");
                            this.handleBusDiskInfo();
                            return;
                        }
                        // New file - upload via presigned URL
                        task.status = 'uploading';
                        const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
                        return OssUpload.upload(file, {
                            md5: md5,
                            folderId: this.loadParams(),
                            fileName: file.name,
                            fileType: extension,
                            onProgress: (percent) => {
                                task.progress = percent;
                            }
                        }).then(() => {
                            task.status = 'success';
                            task.progress = 100;
                            ElMessage.success(`${file.name} 上传完成`);
                            this.handleBusDiskInfo();
                        });
                    });
                }).catch(err => {
                    task.status = 'error';
                    console.error('Upload error:', err);
                    ElMessage.error(`${file.name} 上传失败`);
                });
            },

            clearCompleted() {
                this.uploadTasks = this.uploadTasks.filter(t => t.status !== 'success' && t.status !== 'error');
            },

            folderDrawerClose() {
                this.folderDrawer = false;
                this.newFolderName = "";
            },

            createFolder() {
                if (this.newFolderName.trim() === "") {
                    ElMessage.error("目录名为空");
                    return;
                }
                axios.post("/disk/api/file/newFolder", {
                    newFolderName: this.newFolderName,
                    parentId: this.loadParams()
                }).then(res => {
                    if (res.data.success) {
                        this.handleBusDiskInfo();
                        this.folderDrawer = false;
                        this.newFolderName = "";
                    } else {
                        ElMessage.error(res.data.message);
                    }
                });
            },

            loadParams() {
                var fileFolderId = this.$route.query.fileFolderId;
                if (fileFolderId != null) {
                    var temp = this.$route.query.fileFolderId.split('%');
                    fileFolderId = temp[temp.length - 1];
                } else {
                    fileFolderId = -1;
                }
                return fileFolderId;
            },

            imgSelectParentFolder(value) {
                this.easyUploadForm.parentId = value ? value.pop() : -1;
            },

            imgUploadSuccess(response) {
                if (response.success) {
                    ElMessage.success("上传完成");
                    this.uploadImgUrl = response.result;
                    this.copyToClipboard(response.result);
                    this.handleBusDiskInfo();
                } else {
                    ElMessage.error(response.message);
                }
            },

            getFolderTree() {
                axios.get("/disk/api/system/folderTree").then(res => {
                    if (res.data.success) {
                        this.folderTree = res.data.result;
                    }
                });
            },

            copyToClipboard(text) {
                navigator.clipboard.writeText(text)
                    .then(() => ElMessage.success("路径已拷贝"))
                    .catch(() => ElMessage.error("复制失败"));
            },

            uploadImgDrawerClose() {
                this.uploadImgDrawer = false;
                this.uploadImgUrl = "";
            },

            calculateMD5(file) {
                return new Promise((resolve, reject) => {
                    const fileReader = new FileReader();
                    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                    let currentChunk = 0;
                    const chunkSize = 5 * 1024 * 1000;
                    const spark = new SparkMD5.ArrayBuffer();
                    // Only compute first chunk for performance
                    const chunkNumberMD5 = 1;

                    loadNext();
                    fileReader.onload = e => {
                        spark.append(e.target.result);
                        if (currentChunk < chunkNumberMD5) {
                            loadNext();
                        } else {
                            const md5 = spark.end();
                            console.log(`MD5: ${md5} file: ${file.name}`);
                            resolve(md5);
                        }
                    };
                    fileReader.onerror = () => {
                        reject();
                        ElMessage.error(`文件${file.name}读取出错`);
                    };

                    function loadNext() {
                        const start = currentChunk * chunkSize;
                        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                        currentChunk++;
                    }
                });
            },
        }
    }
</script>

<style scoped>
    .upload-toolbar {
        display: flex;
        align-items: center;
        padding: 12px 0;
    }

    .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .search-input {
        width: 240px;
    }

    .search-input :deep(.el-input__wrapper) {
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.8);
        border: 1.5px solid rgba(196, 77, 255, 0.15);
    }

    /* Upload Progress Panel */
    .upload-panel {
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        border-radius: 16px;
        border: 2px dashed rgba(196, 77, 255, 0.18);
        box-shadow: 0 4px 20px rgba(196, 77, 255, 0.08);
        padding: 12px 16px;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
    }

    .panel-corner-star {
        position: absolute;
        top: 8px;
        left: 8px;
        animation: twinkle 2s ease-in-out infinite;
    }

    @keyframes twinkle {
        0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
        50% { opacity: 0.5; transform: scale(0.7) rotate(20deg); }
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .panel-title {
        font-size: 13px;
        font-weight: 500;
        color: #8c5c8a;
    }

    .upload-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .upload-item {
        padding: 8px 0;
        border-bottom: 1px solid rgba(196, 77, 255, 0.06);
    }

    .upload-item:last-child {
        border-bottom: none;
    }

    .upload-item-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .upload-item-name {
        font-size: 13px;
        color: #4a3548;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 70%;
    }

    .upload-item-status {
        font-size: 12px;
        font-weight: 500;
    }

    .upload-item-status.uploading {
        color: #c44dff;
    }

    .upload-item-status.success {
        color: #ff6b9d;
    }

    .upload-item-status.error {
        color: #e74c8b;
    }

    .upload-item-status.pending {
        color: #b07cc6;
    }

    .upload-icon {
        font-size: 28px;
        color: #c44dff;
    }

    .upload-img-url {
        padding: 10px 0;
        color: #b07cc6;
        font-size: 13px;
    }

    .input-line {
        margin-left: 10px;
    }

    /* Slide-down transition */
    .slide-down-enter-active,
    .slide-down-leave-active {
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-height: 300px;
        overflow: hidden;
    }

    .slide-down-enter-from,
    .slide-down-leave-to {
        max-height: 0;
        opacity: 0;
        padding: 0 16px;
    }

    /* Fresh dialog styling */
    :deep(.fresh-dialog .el-dialog) {
        border-radius: 20px;
    }

    :deep(.fresh-dialog .el-dialog__header) {
        padding: 16px 20px;
        border-bottom: 2px dashed rgba(196, 77, 255, 0.12);
        background: linear-gradient(135deg, rgba(255, 107, 157, 0.06), rgba(196, 77, 255, 0.06));
    }

    :deep(.fresh-dialog .el-dialog__body) {
        padding: 20px;
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .toolbar-actions {
            flex-wrap: wrap;
            gap: 8px;
        }

        .search-input {
            width: 100%;
            order: 10;
        }

        .upload-panel {
            border-radius: 12px;
            padding: 10px 12px;
        }

        .input-line {
            display: block;
            margin-left: 0;
            margin-bottom: 10px;
        }

        .block {
            display: block;
        }

        /* Make cascader and upload full width */
        :deep(.el-cascader) {
            width: 100%;
        }

        :deep(.el-upload) {
            width: 100%;
        }

        :deep(.el-upload-dragger) {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .upload-toolbar {
            padding: 6px 0;
        }

        .toolbar-actions {
            gap: 6px;
        }

        /* Icon-only circular buttons on small screens */
        .toolbar-actions :deep(.el-button.is-round) {
            padding: 8px;
            min-width: 36px;
            width: 36px;
            height: 36px;
        }

        .toolbar-actions :deep(.el-button.is-round span) {
            display: none;
        }

        .toolbar-actions :deep(.el-button.is-round .el-icon) {
            margin: 0;
            font-size: 18px;
        }
    }
</style>
