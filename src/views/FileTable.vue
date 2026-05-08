<template>
    <div class="file-table-container">
        <!-- Wave Top Decoration -->
        <div class="wave-decoration" aria-hidden="true">
            <svg viewBox="0 0 1200 40" preserveAspectRatio="none" width="100%" height="40">
                <path d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20 V40 H0Z" fill="rgba(255,107,157,0.06)"/>
                <path d="M0 25 Q150 10 300 25 T600 25 T900 25 T1200 25 V40 H0Z" fill="rgba(196,77,255,0.04)"/>
            </svg>
        </div>

        <!-- Breadcrumb Navigation -->
        <el-breadcrumb separator="/" class="nav-breadcrumb">
            <el-breadcrumb-item>
                <a @click="goRouter(-1)" class="breadcrumb-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px;margin-right:2px">
                        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke="#c44dff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    首页
                </a>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in navFolders" :key="item.folderId">
                <a @click="goRouter(item.folderId)" class="breadcrumb-link">{{item.folderName}}</a>
            </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- Empty State -->
        <div v-if="!loadTable && fileList.length === 0" class="empty-state">
            <svg width="160" height="160" viewBox="0 0 200 200" class="empty-character">
                <!-- Cute anime-style character -->
                <circle cx="100" cy="90" r="50" fill="#f8e8ff" stroke="#c44dff" stroke-width="2"/>
                <!-- Cat ears -->
                <polygon points="60,50 70,20 85,50" fill="#f8e8ff" stroke="#c44dff" stroke-width="2"/>
                <polygon points="140,50 130,20 115,50" fill="#f8e8ff" stroke="#c44dff" stroke-width="2"/>
                <polygon points="65,45 72,28 82,45" fill="rgba(255,107,157,0.3)"/>
                <polygon points="135,45 128,28 118,45" fill="rgba(255,107,157,0.3)"/>
                <!-- Eyes -->
                <ellipse cx="82" cy="85" rx="8" ry="10" fill="#c44dff"/>
                <ellipse cx="118" cy="85" rx="8" ry="10" fill="#c44dff"/>
                <ellipse cx="85" cy="82" rx="3" ry="3" fill="#fff"/>
                <ellipse cx="121" cy="82" rx="3" ry="3" fill="#fff"/>
                <!-- Mouth -->
                <path d="M92 102 Q100 110 108 102" stroke="#c44dff" fill="none" stroke-width="2" stroke-linecap="round"/>
                <!-- Blush -->
                <ellipse cx="70" cy="98" rx="8" ry="5" fill="rgba(255,107,157,0.25)"/>
                <ellipse cx="130" cy="98" rx="8" ry="5" fill="rgba(255,107,157,0.25)"/>
                <!-- Body -->
                <ellipse cx="100" cy="165" rx="35" ry="25" fill="#fef0f5" stroke="#c44dff" stroke-width="2"/>
                <!-- Sparkles around -->
                <path d="M35 40 L37 34 L39 40 L45 42 L39 44 L37 50 L35 44 L29 42Z" fill="#ffd700" opacity="0.6"/>
                <path d="M165 35 L166 30 L167 35 L172 36 L167 37 L166 42 L165 37 L160 36Z" fill="#ff6b9d" opacity="0.5"/>
                <path d="M155 70 L156 66 L157 70 L161 71 L157 72 L156 76 L155 72 L151 71Z" fill="#c44dff" opacity="0.4"/>
            </svg>
            <p class="empty-text">这里空空的~快上传点什么吧！</p>
        </div>

        <!-- File Table -->
        <el-table
            v-if="fileList.length > 0 || loadTable"
            @selection-change="selectionLineChangeHandle"
            v-loading="loadTable"
            :data="fileList"
            fit
            max-height="560px"
            ref="fileTableRef"
            size="default"
            class="file-table">
            <el-table-column type="selection" width="50" />
            <el-table-column width="50">
                <template #default="scope">
                    <div class="file-icon" :class="getIconClass(scope.row)">
                        <el-icon :size="18">
                            <Folder v-if="scope.row.folder" />
                            <Picture v-else-if="scope.row.fileType===1" />
                            <Headset v-else-if="scope.row.fileType===2" />
                            <VideoCamera v-else-if="scope.row.fileType===3" />
                            <DocumentCopy v-else-if="scope.row.fileType===4" />
                            <Tickets v-else />
                        </el-icon>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="name"
                label="文件名"
                show-overflow-tooltip
                min-width="320">
                <template #default="scope">
                    <span v-if="scope.row.folder" @click="goRouter(scope.row.folderId)" class="folder-link">
                        {{scope.row.folderName}}
                    </span>
                    <span v-else @click="downFile(scope.row)" class="file-link">
                        {{scope.row.fileName}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="updateDt" label="更新时间" width="165" />
            <el-table-column prop="fileSize" label="大小" width="120" />
            <el-table-column fixed="right" label="操作" width="240">
                <template #default="scope">
                    <el-button v-if="scope.row.fileType===1" type="primary" link size="small"
                        @click="copyToClipboard(scope.row.filePath)">复制路径</el-button>
                    <el-button v-if="!scope.row.folder" type="primary" link size="small"
                        @click="openFileDrawer(scope.row.fileId)">详情</el-button>
                    <el-button v-if="!scope.row.folder" type="primary" link size="small"
                        @click="downFile(scope.row)">下载</el-button>
                    <el-button v-if="scope.row.folderId!==-1" type="danger" link size="small"
                        @click="deleteFile(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- Footer: Delete selected + Pagination -->
        <div class="table-footer">
            <el-button size="small" @click="deleteFiles" :disabled="tableSelectRow.length === 0">
                删除所选 ({{tableSelectRow.length}})
            </el-button>
            <el-pagination
                v-model:current-page="pageData.index"
                v-model:page-size="pageData.size"
                :page-sizes="[10, 20, 50, 100, 500]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pageData.total"
                @size-change="diskInfo"
                @current-change="diskInfo"
                small
            />
        </div>

        <!-- Corner Sticker Slot -->
        <div class="corner-sticker" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 100 100">
                <ellipse cx="50" cy="62" rx="24" ry="22" fill="#c44dff" opacity="0.15"/>
                <circle cx="32" cy="38" r="12" fill="#c44dff" opacity="0.12"/>
                <circle cx="50" cy="30" r="12" fill="#c44dff" opacity="0.12"/>
                <circle cx="68" cy="38" r="12" fill="#c44dff" opacity="0.12"/>
            </svg>
        </div>
    </div>

    <!-- File Detail Dialog -->
    <el-dialog v-model="fileDrawer" :before-close="fileDrawerClose" width="560px" :fullscreen="isMobile" class="fresh-dialog">
        <el-image
            v-if="fileInfo.fileType===1"
            style="width: 100%; max-height: 400px; border-radius: 16px;"
            :preview-src-list="[fileInfo.filePath]"
            :src="fileInfo.filePath"
            fit="contain"
        />
        <div>
            <v-md-preview v-if="fileInfo.fileType===4" :text="fileInfo.fileContentText" />
        </div>
        <el-descriptions title="文件信息" :column="2" border style="margin-top: 16px">
            <el-descriptions-item label="文件名">{{fileInfo.fileName}}</el-descriptions-item>
            <el-descriptions-item label="大小">{{fileInfo.fileSize}}</el-descriptions-item>
            <el-descriptions-item label="类型">{{fileInfo.fileTypeText}}</el-descriptions-item>
            <el-descriptions-item label="路径" :span="2">{{fileInfo.filePath}}</el-descriptions-item>
        </el-descriptions>
    </el-dialog>
</template>

<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import bus from "../js/bus"

    export default {
        computed: {
            isMobile() {
                return window.innerWidth <= 768;
            }
        },
        data() {
            return {
                fileList: [],
                fileFolderId: "",
                fileDrawer: false,
                fileInfo: {
                    filePath: "",
                    fileName: "",
                    fileType: "",
                    fileSize: "",
                    fileTypeText: "",
                    fileContentText: ""
                },
                pageData: {
                    index: 1,
                    size: 10,
                    total: 0
                },
                navFolders: [],
                loadTable: true,
                tableSelectRow: [],
            }
        },
        mounted: function () {
            this.loadParams();
            this.diskInfo();
            axios({
                url: "/disk/api/system/currentFolder",
                params: { folderId: this.fileFolderId }
            }).then(res => {
                if (res.data.success) {
                    this.navFolders = res.data.result;
                }
            });
            bus.on("diskInfo", () => {
                this.diskInfo();
            });
        },
        methods: {
            getIconClass(row) {
                if (row.folder) return 'icon-folder';
                const typeMap = {
                    1: 'icon-image',
                    2: 'icon-audio',
                    3: 'icon-video',
                    4: 'icon-doc',
                };
                return typeMap[row.fileType] || 'icon-other';
            },

            diskInfo() {
                axios({
                    url: "/disk/api/file/getFiles",
                    method: "GET",
                    params: {
                        fileFolderId: this.fileFolderId,
                        index: this.pageData.index,
                        size: this.pageData.size,
                        nameCondition: "",
                        fileType: ""
                    }
                }).then(res => {
                    this.loadTable = false;
                    if (res.data.success) {
                        const result = res.data.result;
                        this.fileList = result.infos.records;
                        this.pageData.total = result.infos.total;
                    } else {
                        ElMessage.error(res.data.message);
                    }
                });
            },

            selectionLineChangeHandle(row) {
                this.tableSelectRow = row;
            },

            copyToClipboard(text) {
                navigator.clipboard.writeText(text)
                    .then(() => ElMessage.success("路径已拷贝"))
                    .catch(() => ElMessage.error("复制失败"));
            },

            loadParams() {
                var fileFolderId = this.$route.query.fileFolderId;
                if (fileFolderId != null) {
                    var temp = this.$route.query.fileFolderId.split('%');
                    fileFolderId = temp[temp.length - 1];
                } else {
                    fileFolderId = -1;
                }
                this.fileFolderId = fileFolderId;
            },

            goRouter(id) {
                let paths = this.$route.query.fileFolderId;
                if (id === -1) {
                    this.$router.push({path: '/disk'});
                } else {
                    if (paths == null) {
                        paths = id;
                    } else {
                        paths = paths + '%' + id;
                    }
                    this.$router.push({path: '/disk/fileTable', query: {fileFolderId: paths}});
                }
            },

            deleteFile(row, batch) {
                if (!batch) {
                    row = [row];
                }
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    axios.post("/disk/api/file/delete", row).then(res => {
                        if (res.data.success) {
                            ElMessage.success("删除成功");
                            this.diskInfo();
                        } else {
                            ElMessage.error(res.data.message);
                        }
                    });
                }).catch(() => {});
            },

            downFile(row) {
                var diskEnv = row.diskEnv;
                if (diskEnv === 'oss') {
                    this.downFileHttp(row);
                }
                if (diskEnv === 'local') {
                    this.downFileStream(row);
                }
            },

            downFileHttp(row) {
                axios.post("/disk/api/file/downloadHttp", { folderId: row.folderId }).then(res => {
                    if (res.data.success) {
                        const result = res.data.result;
                        const a = document.createElement('a');
                        a.href = result.filePath;
                        a.download = result.fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else {
                        ElMessage.error(res.data.message);
                    }
                });
            },

            downFileStream(row) {
                axios({
                    url: "/disk/api/file/downloadStream",
                    method: "POST",
                    data: { folderId: row.folderId },
                    responseType: 'blob'
                }).then(res => {
                    const filename = res.headers["content-disposition"];
                    const blob = new Blob([res.data]);
                    const downloadElement = document.createElement("a");
                    const href = window.URL.createObjectURL(blob);
                    downloadElement.href = href;
                    downloadElement.download = decodeURIComponent(filename.split("filename=")[1]);
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                    document.body.removeChild(downloadElement);
                    window.URL.revokeObjectURL(href);
                });
            },

            openFileDrawer(fileId) {
                axios({
                    url: "/disk/api/file/detail",
                    method: "GET",
                    params: { fileId }
                }).then(res => {
                    if (res.data.success) {
                        this.fileInfo = res.data.result;
                        this.fileDrawer = true;
                    } else {
                        ElMessage.error(res.data.message);
                    }
                });
            },

            fileDrawerClose() {
                this.fileDrawer = false;
                this.fileInfo = this.$options.data().fileInfo;
            },

            deleteFiles() {
                this.deleteFile(this.tableSelectRow, true);
            }
        }
    }
</script>

<style scoped>
    .file-table-container {
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        border-radius: 20px;
        padding: 20px;
        padding-top: 8px;
        box-shadow: 0 4px 24px rgba(196, 77, 255, 0.06);
        border: 1.5px solid rgba(196, 77, 255, 0.08);
        position: relative;
        overflow: hidden;
    }

    .wave-decoration {
        margin: 0 -20px 8px;
        line-height: 0;
    }

    .nav-breadcrumb {
        margin-bottom: 16px;
        padding: 8px 0;
    }

    .breadcrumb-link {
        cursor: pointer;
        transition: color 0.2s;
        color: #8c5c8a;
    }

    .breadcrumb-link:hover {
        color: #c44dff;
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 40px 20px;
    }

    .empty-character {
        animation: gentleBounce 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 12px rgba(196, 77, 255, 0.15));
    }

    @keyframes gentleBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }

    .empty-text {
        margin-top: 16px;
        font-size: 15px;
        color: #b07cc6;
        letter-spacing: 0.5px;
    }

    /* File type icon colors */
    .file-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .file-icon:hover {
        transform: scale(1.15) rotate(-5deg);
    }

    .icon-folder { color: #c44dff; background: rgba(196, 77, 255, 0.1); }
    .icon-image { color: #ff6b9d; background: rgba(255, 107, 157, 0.1); }
    .icon-audio { color: #e06cff; background: rgba(224, 108, 255, 0.1); }
    .icon-video { color: #9b59b6; background: rgba(155, 89, 182, 0.1); }
    .icon-doc { color: #b07cc6; background: rgba(176, 124, 198, 0.1); }
    .icon-other { color: #8c5c8a; background: rgba(140, 92, 138, 0.08); }

    .folder-link {
        cursor: pointer;
        color: #4a3548;
        font-weight: 500;
        transition: color 0.2s;
    }

    .folder-link:hover {
        color: #c44dff;
    }

    .file-link {
        cursor: pointer;
        color: #6b4d6e;
        transition: color 0.2s;
    }

    .file-link:hover {
        color: #ff6b9d;
    }

    .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 12px;
    }

    /* Corner sticker decoration */
    .corner-sticker {
        position: absolute;
        bottom: 16px;
        right: 16px;
        opacity: 0.6;
        pointer-events: none;
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .file-table-container {
            border-radius: 14px;
            padding: 12px;
            padding-top: 4px;
        }

        .wave-decoration {
            margin: 0 -12px 6px;
            height: 24px;
        }

        .wave-decoration svg {
            height: 24px;
        }

        .empty-state {
            padding: 24px 12px;
        }

        .empty-character {
            width: 120px;
            height: 120px;
        }

        .table-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
        }

        .table-footer :deep(.el-pagination) {
            justify-content: center;
            flex-wrap: wrap;
        }

        .corner-sticker {
            display: none;
        }

        :deep(.file-table) {
            min-width: 0;
        }

        :deep(.file-table .el-table__body-wrapper) {
            overflow-x: auto;
        }

        :deep(.file-table .el-table__body) {
            min-width: 600px;
        }
    }

    @media (max-width: 480px) {
        .file-table-container {
            border-radius: 12px;
            padding: 8px;
            padding-top: 4px;
        }

        .empty-character {
            width: 100px;
            height: 100px;
        }

        .empty-text {
            font-size: 13px;
        }
    }
</style>
