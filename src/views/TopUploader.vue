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
                    placeholder="喵~搜索文件..."
                    size="default"
                    v-model="nameCondition"
                    class="search-input"
                    clearable
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
                <!-- Cat paw decoration -->
                <svg class="toolbar-paw" width="22" height="22" viewBox="0 0 100 100" aria-hidden="true">
                    <ellipse cx="50" cy="62" rx="22" ry="18" fill="#5B8C6E" opacity="0.12"/>
                    <circle cx="34" cy="40" r="10" fill="#5B8C6E" opacity="0.1"/>
                    <circle cx="50" cy="34" r="10" fill="#5B8C6E" opacity="0.1"/>
                    <circle cx="66" cy="40" r="10" fill="#5B8C6E" opacity="0.1"/>
                </svg>
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
                                <template v-else-if="task.status === 'success'">完成</template>
                                <template v-else-if="task.status === 'error'">失败</template>
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
        append-to-body
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
        append-to-body
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
        watch: {
            nameCondition(val) {
                clearTimeout(this._searchTimer);
                this._searchTimer = setTimeout(() => {
                    bus.emit("search", val || "");
                }, 300);
            }
        },
        mounted: function () {
            this._resizeHandler = () => { this.isMobile = window.innerWidth <= 768; };
            window.addEventListener('resize', this._resizeHandler);
            this.getFolderTree();
        },
        beforeUnmount() {
            window.removeEventListener('resize', this._resizeHandler);
            clearTimeout(this._searchTimer);
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
                // 获取 Vue proxy 代理后的引用，后续修改才能触发响应式更新
                const idx = this.uploadTasks.length - 1;
                const reactiveTask = this.uploadTasks[idx];

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
                            reactiveTask.status = 'error';
                            ElMessage.error(data.message);
                            return;
                        }
                        const responseType = data.result.responseType;
                        if (responseType === 0) {
                            // File already exists (dedup / 秒传)
                            reactiveTask.progress = 100;
                            reactiveTask.status = 'success';
                            ElMessage.success("文件已存在，秒传成功喵~");
                            this.handleBusDiskInfo();
                            return;
                        }
                        // New file - upload via presigned URL
                        reactiveTask.status = 'uploading';
                        const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
                        return OssUpload.upload(file, {
                            md5: md5,
                            folderId: this.loadParams(),
                            fileName: file.name,
                            fileType: extension,
                            onProgress: (percent) => {
                                reactiveTask.progress = percent;
                            }
                        }).then(() => {
                            reactiveTask.status = 'success';
                            reactiveTask.progress = 100;
                            ElMessage.success(`${file.name} 上传完成喵~`);
                            this.handleBusDiskInfo();
                        });
                    });
                }).catch(err => {
                    reactiveTask.status = 'error';
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

    .toolbar-paw {
        flex-shrink: 0;
        animation: pawWave 3s ease-in-out infinite;
        opacity: 0.6;
    }

    @keyframes pawWave {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-8deg) scale(1.05); }
        75% { transform: rotate(8deg) scale(1.05); }
    }

    .search-input {
        width: 240px;
    }

    .search-input :deep(.el-input__wrapper) {
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(91, 140, 110, 0.12);
    }

    /* Upload Progress Panel */
    .upload-panel {
        background: rgba(255, 254, 250, 0.94);
        backdrop-filter: blur(8px);
        border-radius: 10px;
        border: 1px dashed rgba(91, 140, 110, 0.15);
        box-shadow: 0 2px 12px rgba(91, 140, 110, 0.06);
        padding: 12px 16px;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
    }

    .panel-corner-star {
        display: none;
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
        color: #5c6e5e;
    }

    .upload-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .upload-item {
        padding: 8px 0;
        border-bottom: 1px solid rgba(91, 140, 110, 0.06);
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
        color: #3a4a3c;
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
        color: #5B8C6E;
    }

    .upload-item-status.success {
        color: #8AB4A0;
    }

    .upload-item-status.error {
        color: #c0392b;
    }

    .upload-item-status.pending {
        color: #A08C74;
    }

    .upload-icon {
        font-size: 28px;
        color: #5B8C6E;
    }

    .upload-img-url {
        padding: 10px 0;
        color: #8a9b8a;
        font-size: 13px;
    }

    .input-line {
        margin-left: 10px;
    }

    /* Slide-down transition */
    .slide-down-enter-active,
    .slide-down-leave-active {
        transition: all 0.3s ease;
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
        border-radius: 12px;
    }

    :deep(.fresh-dialog .el-dialog__header) {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(91, 140, 110, 0.08);
        background: rgba(91, 140, 110, 0.03);
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
            border-radius: 8px;
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
