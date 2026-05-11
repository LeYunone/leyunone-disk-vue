<template>
    <div class="file-table-container">
        <!-- Cat ears peeking over container -->
        <div class="container-cat-ears" aria-hidden="true">
            <div class="container-ear container-ear-left">
                <div class="container-ear-inner"></div>
            </div>
            <div class="container-ear container-ear-right">
                <div class="container-ear-inner"></div>
            </div>
        </div>

        <!-- Breadcrumb Navigation -->
        <el-breadcrumb separator="/" class="nav-breadcrumb">
            <el-breadcrumb-item>
                <a @click="goRouter(-1)" class="breadcrumb-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px;margin-right:2px">
                        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke="#5B8C6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                <!-- Cat head -->
                <circle cx="100" cy="90" r="50" fill="#eef5ee" stroke="#5B8C6E" stroke-width="2"/>
                <!-- Cat ears -->
                <polygon points="60,50 70,20 85,50" fill="#eef5ee" stroke="#5B8C6E" stroke-width="2"/>
                <polygon points="140,50 130,20 115,50" fill="#eef5ee" stroke="#5B8C6E" stroke-width="2"/>
                <polygon points="65,45 72,28 82,45" fill="rgba(91,140,110,0.15)"/>
                <polygon points="135,45 128,28 118,45" fill="rgba(91,140,110,0.15)"/>
                <!-- Eyes -->
                <ellipse cx="82" cy="85" rx="8" ry="10" fill="#5B8C6E"/>
                <ellipse cx="118" cy="85" rx="8" ry="10" fill="#5B8C6E"/>
                <ellipse cx="85" cy="82" rx="3" ry="3" fill="#fff"/>
                <ellipse cx="121" cy="82" rx="3" ry="3" fill="#fff"/>
                <!-- Mouth -->
                <path d="M92 102 Q100 110 108 102" stroke="#5B8C6E" fill="none" stroke-width="2" stroke-linecap="round"/>
                <!-- Blush -->
                <ellipse cx="70" cy="98" rx="8" ry="5" fill="rgba(196,149,106,0.2)"/>
                <ellipse cx="130" cy="98" rx="8" ry="5" fill="rgba(196,149,106,0.2)"/>
                <!-- Body -->
                <ellipse cx="100" cy="165" rx="35" ry="25" fill="#f0f5ee" stroke="#5B8C6E" stroke-width="2"/>
                <!-- Paws -->
                <ellipse cx="75" cy="170" rx="10" ry="6" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <ellipse cx="125" cy="170" rx="10" ry="6" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <!-- Leaf decoration -->
                <path d="M35 40 L37 34 L39 40 L45 42 L39 44 L37 50 L35 44 L29 42Z" fill="#8AB4A0" opacity="0.5"/>
                <path d="M165 35 L166 30 L167 35 L172 36 L167 37 L166 42 L165 37 L160 36Z" fill="#5B8C6E" opacity="0.4"/>
                <path d="M155 70 L156 66 L157 70 L161 71 L157 72 L156 76 L155 72 L151 71Z" fill="#C4956A" opacity="0.35"/>
            </svg>
            <p class="empty-text">这里空空的，快上传点什么吧~</p>
        </div>

        <!-- File Table -->
        <div class="table-scroll-wrapper">
        <el-table
            v-if="fileList.length > 0 || loadTable"
            @selection-change="selectionLineChangeHandle"
            v-loading="loadTable"
            :data="fileList"
            fit
            :max-height="isMobile ? '70vh' : 560"
            ref="fileTableRef"
            size="default"
            class="file-table">
            <el-table-column type="selection" :width="isMobile ? 36 : 50" />
            <el-table-column :width="isMobile ? 40 : 50">
                <template #default="scope">
                    <el-image
                        v-if="!scope.row.folder && scope.row.fileType===1 && scope.row.filePath"
                        :src="scope.row.filePath"
                        :preview-src-list="imagePreviewList"
                        :initial-index="getImagePreviewIndex(scope.row)"
                        fit="cover"
                        class="file-thumbnail"
                        preview-teleported
                        lazy
                    >
                        <template #error>
                            <div class="file-icon icon-image">
                                <el-icon :size="isMobile ? 16 : 18"><Picture /></el-icon>
                            </div>
                        </template>
                    </el-image>
                    <div v-else class="file-icon" :class="getIconClass(scope.row)">
                        <el-icon :size="isMobile ? 16 : 18">
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
                :min-width="isMobile ? 120 : 320">
                <template #default="scope">
                    <span v-if="scope.row.folder" @click="goRouter(scope.row.folderId)" class="folder-link">
                        {{scope.row.folderName}}
                    </span>
                    <span v-else-if="scope.row.fileType===1" @click="downFile(scope.row)" class="file-link image-file-link">
                        {{scope.row.fileName}}
                    </span>
                    <span v-else @click="downFile(scope.row)" class="file-link">
                        {{scope.row.fileName}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column v-if="!isMobile" prop="updateDt" label="更新时间" width="165" />
            <el-table-column v-if="!isMobile" prop="fileSize" label="大小" width="120" />
            <el-table-column fixed="right" label="操作" :width="isMobile ? 110 : 240">
                <template #default="scope">
                    <el-button v-if="!isMobile && scope.row.fileType===1" type="primary" link size="small"
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
        </div>

        <!-- Footer: Delete selected + Pagination -->
        <div class="table-footer">
            <el-button size="small" @click="deleteFiles" :disabled="tableSelectRow.length === 0">
                删除所选 ({{tableSelectRow.length}})
            </el-button>
            <el-pagination
                v-model:current-page="pageData.index"
                v-model:page-size="pageData.size"
                :page-sizes="[10, 20, 50, 100, 500]"
                :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                :total="pageData.total"
                @size-change="diskInfo"
                @current-change="diskInfo"
                small
            />
        </div>

        <!-- Corner Cat Paw -->
        <div class="corner-sticker" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 100 100">
                <ellipse cx="50" cy="62" rx="24" ry="22" fill="#5B8C6E" opacity="0.12"/>
                <circle cx="32" cy="38" r="12" fill="#5B8C6E" opacity="0.1"/>
                <circle cx="50" cy="30" r="12" fill="#5B8C6E" opacity="0.1"/>
                <circle cx="68" cy="38" r="12" fill="#5B8C6E" opacity="0.1"/>
            </svg>
        </div>
    </div>

    <!-- File Detail Dialog -->
    <el-dialog v-model="fileDrawer" :before-close="fileDrawerClose" width="560px" :fullscreen="isMobile" class="fresh-dialog cat-dialog">
        <template #header>
            <div class="dialog-cat-header">
                <svg width="24" height="24" viewBox="0 0 100 100" style="vertical-align: middle; margin-right: 6px;">
                    <polygon points="15,45 25,15 40,45" fill="#5B8C6E" opacity="0.7"/>
                    <polygon points="85,45 75,15 60,45" fill="#5B8C6E" opacity="0.7"/>
                    <circle cx="50" cy="55" r="28" fill="#5B8C6E" opacity="0.12"/>
                    <ellipse cx="40" cy="52" rx="3.5" ry="4" fill="#5B8C6E" opacity="0.7"/>
                    <ellipse cx="60" cy="52" rx="3.5" ry="4" fill="#5B8C6E" opacity="0.7"/>
                    <path d="M45 60 Q50 64 55 60" stroke="#5B8C6E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </svg>
                <span>文件信息</span>
            </div>
        </template>
        <el-image
            v-if="fileInfo.fileType===1"
            style="width: 100%; max-height: 400px; border-radius: 10px;"
            :preview-src-list="[fileInfo.filePath]"
            :src="fileInfo.filePath"
            fit="contain"
        />
        <div>
            <v-md-preview v-if="fileInfo.fileType===4" :text="fileInfo.fileContentText" />
        </div>
        <el-descriptions :column="2" border style="margin-top: 16px">
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
        data() {
            return {
                isMobile: window.innerWidth <= 768,
                fileList: [],
                fileFolderId: "",
                nameCondition: "",
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
        computed: {
            imagePreviewList() {
                return this.fileList
                    .filter(f => !f.folder && f.fileType === 1 && f.filePath)
                    .map(f => f.filePath);
            }
        },
        mounted: function () {
            this._resizeHandler = () => { this.isMobile = window.innerWidth <= 768; };
            window.addEventListener('resize', this._resizeHandler);
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
            bus.on("search", (keyword) => {
                this.nameCondition = keyword;
                this.pageData.index = 1;
                this.diskInfo();
            });
        },
        beforeUnmount() {
            window.removeEventListener('resize', this._resizeHandler);
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

            getImagePreviewIndex(row) {
                const images = this.fileList.filter(f => !f.folder && f.fileType === 1 && f.filePath);
                return images.findIndex(f => f.filePath === row.filePath);
            },

            diskInfo() {
                axios({
                    url: "/disk/api/file/getFiles",
                    method: "GET",
                    params: {
                        fileFolderId: this.fileFolderId,
                        index: this.pageData.index,
                        size: this.pageData.size,
                        nameCondition: this.nameCondition,
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
                // Restore saved page for this folder
                const savedPage = sessionStorage.getItem('disk_page_' + this.fileFolderId);
                if (savedPage) {
                    this.pageData.index = parseInt(savedPage);
                } else {
                    this.pageData.index = 1;
                }
            },

            goRouter(id) {
                // Save current page before navigating away
                sessionStorage.setItem('disk_page_' + this.fileFolderId, this.pageData.index);
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
        background: rgba(255, 254, 250, 0.92);
        backdrop-filter: blur(8px);
        border-radius: 12px;
        padding: 20px;
        padding-top: 28px;
        box-shadow: 0 2px 12px rgba(91, 140, 110, 0.06);
        border: 1px solid rgba(91, 140, 110, 0.08);
        position: relative;
        margin-top: 14px;
    }

    /* Container cat ears */
    .container-cat-ears {
        position: absolute;
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 80px;
        pointer-events: none;
    }

    .container-ear {
        width: 0;
        height: 0;
        border-left: 18px solid transparent;
        border-right: 18px solid transparent;
        border-bottom: 24px solid rgba(255, 254, 250, 0.95);
        position: relative;
        filter: drop-shadow(0 -1px 2px rgba(91, 140, 110, 0.1));
    }

    .container-ear-inner {
        position: absolute;
        top: 8px;
        left: -9px;
        width: 0;
        height: 0;
        border-left: 9px solid transparent;
        border-right: 9px solid transparent;
        border-bottom: 13px solid rgba(91, 140, 110, 0.12);
    }

    /* Dialog cat header */
    .dialog-cat-header {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: #3a4a3c;
    }

    .nav-breadcrumb {
        margin-bottom: 16px;
        padding: 8px 0;
    }

    .breadcrumb-link {
        cursor: pointer;
        transition: color 0.2s;
        color: #5c6e5e;
    }

    .breadcrumb-link:hover {
        color: #5B8C6E;
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 40px 20px;
    }

    .empty-character {
        animation: gentleBounce 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 12px rgba(91, 140, 110, 0.12));
    }

    @keyframes gentleBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }

    .empty-text {
        margin-top: 16px;
        font-size: 14px;
        color: #8a9b8a;
        letter-spacing: 0.3px;
    }

    /* Corner cat paw */
    .corner-sticker {
        position: absolute;
        bottom: 16px;
        right: 16px;
        opacity: 0.6;
        pointer-events: none;
    }

    /* File type icon colors */
    .file-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        transition: transform 0.2s ease;
    }

    .file-icon:hover {
        transform: scale(1.1);
    }

    .icon-folder { color: #5B8C6E; background: rgba(91, 140, 110, 0.1); }
    .icon-image { color: #C4956A; background: rgba(196, 149, 106, 0.1); }
    .icon-audio { color: #8AB4A0; background: rgba(138, 180, 160, 0.1); }
    .icon-video { color: #7BA3B0; background: rgba(123, 163, 176, 0.1); }
    .icon-doc { color: #A08C74; background: rgba(160, 140, 116, 0.1); }
    .icon-other { color: #8a9b8a; background: rgba(138, 155, 138, 0.08); }

    /* Image thumbnail in file list */
    .file-thumbnail {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        cursor: pointer;
        border: 1.5px solid rgba(196, 149, 106, 0.2);
        transition: transform 0.2s ease, box-shadow 0.2s;
        flex-shrink: 0;
    }

    .file-thumbnail:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 8px rgba(196, 149, 106, 0.2);
    }

    .image-file-link::after {
        content: 'Preview';
        margin-left: 6px;
        font-size: 10px;
        padding: 1px 5px;
        background: rgba(196, 149, 106, 0.1);
        color: #C4956A;
        border-radius: 4px;
        vertical-align: middle;
    }

    .folder-link {
        cursor: pointer;
        color: #3a4a3c;
        font-weight: 500;
        transition: color 0.2s;
    }

    .folder-link:hover {
        color: #5B8C6E;
    }

    .file-link {
        cursor: pointer;
        color: #5c6e5e;
        transition: color 0.2s;
    }

    .file-link:hover {
        color: #C4956A;
    }

    .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 12px;
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .file-table-container {
            border-radius: 10px;
            padding: 10px;
            overflow: visible;
        }

        .nav-breadcrumb {
            margin-bottom: 10px;
            padding: 4px 0;
        }

        .empty-state {
            padding: 20px 8px;
        }

        .empty-character {
            width: 120px;
            height: 120px;
        }

        .corner-sticker {
            display: none;
        }

        .table-scroll-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 0 -10px;
            padding: 0 10px;
        }

        .table-footer {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
            margin-top: 12px;
        }

        .table-footer :deep(.el-pagination) {
            justify-content: center;
        }

        .file-icon {
            width: 30px;
            height: 30px;
        }

        .file-thumbnail {
            width: 30px;
            height: 30px;
            border-radius: 5px;
        }

        .folder-link, .file-link {
            font-size: 13px;
        }
    }

    @media (max-width: 480px) {
        .file-table-container {
            border-radius: 8px;
            padding: 6px;
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
