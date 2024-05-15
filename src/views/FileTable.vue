<template>
    <div>
        <el-breadcrumb style="margin-top:30px " separator="/">
            <el-breadcrumb-item>
                <a @click="goRouter(-1)">首页</a>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in navFolders">
                <a @click="goRouter(item.folderId)">{{item.folderName}}</a>
            </el-breadcrumb-item>
        </el-breadcrumb>

        <el-table
                @selection-change="selectionLineChangeHandle"
                v-loading="loadTable"
                :data="fileList"
                fit="false"
                max-height="540px"
                ref="qweqwe"
                size="medium"
                style="margin: 20px;width: 100%">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column
                    width="80">
                <template #default="scope">
                    <a v-if="scope.row.folder" @click="goRouter(scope.row.folderId)">
                        <el-icon>
                            <Folder/>
                        </el-icon>
                    </a>
                    <i v-if="scope.row.fileType===0">
                        <el-icon>
                            <List/>
                        </el-icon>
                    </i>
                    <i v-if="scope.row.fileType===1">
                        <el-icon>
                            <Picture/>
                        </el-icon>
                    </i>
                    <i v-if="scope.row.fileType===2">
                        <el-icon>
                            <Headset/>
                        </el-icon>
                    </i>
                    <i v-if="scope.row.fileType===3">
                        <el-icon>
                            <VideoCamera/>
                        </el-icon>
                    </i>
                    <i v-if="scope.row.fileType===4">
                        <el-icon>
                            <DocumentCopy/>
                        </el-icon>
                    </i>
                    <i v-if="scope.row.fileType===5">
                        <el-icon>
                            <Tickets/>
                        </el-icon>
                    </i>
                </template>
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="文件名"
                    show-overflow-tooltip="true"
                    width="400">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-button v-if="scope.row.folder" @click="goRouter(scope.row.folderId)" type="text"
                                   size="small">
                            {{scope.row.folderName}}
                        </el-button>
                        <el-button v-if="!scope.row.folder" @click="downFile(scope.row)" type="text" size="small">
                            {{scope.row.fileName}}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                    prop="updateDt"
                    label="更新时间"
                    width="165">
            </el-table-column>
            <el-table-column
                    prop="fileSize"
                    label="文件大小"
                    width="135">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    key="slot"
                    width="300">
                <template #default='scope'>
                    <el-button v-if="scope.row.fileType===1" type="primary" @click="copyToClipboard(scope.row.filePath)"
                               text size="small">复制路径
                    </el-button>
                    <el-button v-if="!scope.row.folder" @click="openFileDrawer(scope.row)" type="primary" text
                               size="small">详情
                    </el-button>
                    <el-button v-if="!scope.row.folder" @click="downFile(scope.row)" type="primary" text size="small">下载
                    </el-button>
                    <el-button v-if="scope.row.folderId!==-1" @click="deleteFile(scope.row)" type="danger" text
                               style="color: red" size="small">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="table-font">
            <span class="table-font-operation"><el-button @click="deleteFiles">删除所选</el-button></span>
            <span class="table-font-operation" style="float: right">
                <el-pagination
                        v-model:current-page="pageData.index"
                        v-model:page-size="pageData.size"
                        :page-sizes="[10,20, 50, 100, 500]"
                        :disabled="disabled"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="pageData.total"
                        @size-change="diskInfo"
                        @current-change="diskInfo"
                />
            </span>
        </div>
    </div>

    <el-dialog
            v-model="fileDrawer"
            :before-close="fileDrawerClose">
        <el-image style="width: 400px; height: 400px;margin-left: 260px;" :preview-src-list="[fileInfo.filePath]"
                  :src="fileInfo.filePath" fit="contain"/>
        <el-descriptions title="文件信息" style="padding: 10px">
            <el-descriptions-item label="文件名">{{fileInfo.fileName}}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{fileInfo.fileSize}}</el-descriptions-item>
            <el-descriptions-item label="类型">{{fileInfo.fileType}}</el-descriptions-item>
            <el-descriptions-item label="路径">{{fileInfo.filePath}}</el-descriptions-item>
        </el-descriptions>
    </el-dialog>
</template>

<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import bus from "../js/bus"


    export default {
        setup(){

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
                    fileSize: ""
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
                params: {
                    "folderId": this.fileFolderId,
                }
            }).then((res) => {
                var data = res.data;
                if (data.success) {
                    this.navFolders = data.result;
                }
            })
            bus.on("diskInfo",(val)=>{
                this.diskInfo();
            })
        },
        methods: {
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
                }).then((res) => {
                    var data = res.data;
                    this.loadTable = false;
                    if (data.success) {
                        //文件
                        var result = data.result;
                        this.fileList = result.infos.records;
                        this.pageData.total = result.infos.total;
                    } else {
                        ElMessage.error(data.message);
                    }
                })
            },
            selectionLineChangeHandle(row) {
                this.tableSelectRow = row;
            },
            copyToClipboard(text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        ElMessage.success(`路径已拷贝 Ctrl + c`);
                    })
                    .catch(err => {
                        ElMessage.error(`复制失败: ${error} ！`);
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
                this.fileFolderId = fileFolderId;
            },
            goRouter(id) {
                let paths = this.$route.query.fileFolderId;
                if (id === -1) {
                    this.$route.params.f
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
                    axios({
                        url: "/disk/api/file/delete",
                        method: "POST",
                        data: row
                    }).then(res => {
                        var data = res.data;
                        if (data.success) {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                            this.diskInfo();
                        } else {
                            ElMessage.error(data.message);
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            downFileStream(row) {
                axios({
                    url: "/disk/api/file/downloadFile",
                    method: "POST",
                    data: {
                        fileId: row.fileId,
                    },
                    responseType: 'blob'
                }).then((res) => {
                    const filename = res.headers["content-disposition"];
                    const blob = new Blob([res.data]);
                    var downloadElement = document.createElement("a");
                    var href = window.URL.createObjectURL(blob);
                    downloadElement.href = href;
                    downloadElement.download = decodeURIComponent(filename.split("filename=")[1]);
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                    document.body.removeChild(downloadElement);
                    window.URL.revokeObjectURL(href);
                    this.diskInfo();
                })
            },
            downFile(row) {
                this.downFileHttp(row)
            },
            downFileHttp(row) {
                axios({
                    url: "/disk/api/file/download",
                    method: "POST",
                    data: {
                        folderId: row.folderId,
                    },
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        var result = data.result;
                        const a = document.createElement('a')
                        //_blank表示在新窗口打开链接
                        // link.target = '_blank'
                        a.href = result.filePath
                        a.download = result.fileName;
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a) // 下载完成移除元素
                        this.diskInfo();
                    } else {
                        //上传失败
                        ElMessage.error(data.message);
                    }
                })
            },

            openFileDrawer(row) {
                this.fileInfo = row;
                this.fileDrawer = true;
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
<style>
    .function-menu {
    }

    .aLink {
        display: inline-flex;
        border: none;
        width: 3rem;
        height: 3rem;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        line-height: 1;
        transition-property: all;
        transition-duration: .3s;
        transition-delay: 0s;
    }

    .header-font {
        -webkit-box-flex: 1;
        color: #333;
        -ms-flex: 1;
        flex: 1;
        font-size: 16px;
        font-weight: 400;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-bottom: 1px solid #ebebeb;
        height: 60px;
        padding: 0 64px 0 24px;

        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: flex;
    }

    .footer-css {
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        border-top: 1px solid #ebebeb;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        /* flex-wrap: wrap; */
        padding: 16px 24px;
        text-align: left;
    }

    .button-common {
        margin-left: 10px;
    }

    .table-main {
        width: 60%;
        height: 100%;
        margin: 0 auto;
    }

    .main-top {
        margin: 0 auto;
    }

    .main-top-operation {
        width: 60%;
        height: 100%;
        margin: 0 auto;
    }

    .table-font {
        position: sticky;
    }

    .table-font-operation {
        display: inline-block;
        padding-left: 10px;
    }

    .input-line {
        margin-left: 10px;
    }

    .aLink:hover {
        background-color: #E5F1FD;
    }
</style>
