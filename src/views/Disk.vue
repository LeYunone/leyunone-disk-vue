<template>
    <div class="main-top">
        <h3 style="text-align: center;">一个云盘</h3>
        <div class="main-top-operation">
            <uploader
                      ref="uploader"
                      :options="options"
                      :file-status-text="statusText"
                      :autoStart="false"
                      @file-added="filesAdded"
                      @file-success="onFileSuccess"
                      class="uploader-example">
                <uploader-unsupport></uploader-unsupport>
                <span class="function-menu">
                <el-dropdown>
                    <el-button class="button-common" type="primary">
                        上传
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                                <uploader-btn>上传文件</uploader-btn>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <uploader-btn :directory="true">上传文件夹</uploader-btn>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <button @click="uploadImgDrawer = true">发布图片</button>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                </span>
                <span class="function-menu">
                    <el-button class="button-common" @click="folderDrawer = true">
                        <i class="el-icon-folder-add"></i>
                        <span>新建文件夹</span>
                    </el-button>
                </span>
                <uploader-list v-show="uploadPanel"/>
            </uploader>
        </div>
    </div>

    <div style="clear:both"></div>
    <div class="table-main">
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
                    <el-button v-if="scope.row.folderId!==-1" @click="deleteFile(scope.row)" type="danger" text style="color: red" size="small">删除
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

    <el-dialog title="新建目录" v-model="folderDrawer" width="80%"
               :before-close="folderDrawerClose">
        <header class="header-font">
            <h4>新建目录</h4>
        </header>
        <div style="margin-top: 10px">
            <el-form status-icon label-width="100px">
                <el-form-item label="目录名">
                    <el-input v-model="newFolderName"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <footer class="footer-css">
            <el-button class="button-common" type="primary" @click="createFolder">确定</el-button>
            <el-button class="button-common" @click="folderDrawer = false">取消</el-button>
        </footer>
    </el-dialog>

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

    <el-dialog
            width="700px"
            title="发布图片"
            drag
            v-model="uploadImgDrawer"
            :before-close="uploadImgDrawerClose">
        <div class="block">
            <span class="input-line">
                <span class="demonstration">文件夹：</span>
                <el-cascader
                        placeholder="搜索"
                        :options="folderTree"
                        @change="imgSelectParentFolder"
                        :props="{ checkStrictly: true }"
                        filterable></el-cascader>
            </span>
            <span class="input-line">
                <span class="demonstration">创建日期前缀 年-月-日：</span>
                <el-switch
                        v-model="easyUploadForm.hasDate"
                        active-color="#13ce66"
                        inactive-color="#ff4949">
                </el-switch>
            </span>
        </div>
        <div style="padding: 25px">
            <el-upload action="/disk/api/file/upload"
                       :data="easyUploadForm"
                       :drag="true"
                       :on-success="imgUploadSuccess"
                       list-type="picture-card"
                       :auto-upload="true">
                <el-icon>
                    <Plus/>
                </el-icon>
                <template #file="{ file }">
                    <div><img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
                        <span class="el-upload-list__item-actions">
                      <span class="el-upload-list__item-preview"
                            @click="showImageHandler(file.url)">
                        <el-icon><zoom-in/></el-icon>
                      </span>
                    </span>
                    </div>
                </template>
            </el-upload>

            <el-dialog v-model="imageShow">
                <img w-full :src="imageShowUrl" alt="Preview Image"/>
            </el-dialog>
        </div>

        <div>图片路径： {{uploadImgUrl}}</div>
    </el-dialog>

</template>
<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import SparkMD5 from 'spark-md5'

    export default {
        setup (){
            const options = {
                target: '/disk/api/file/upload',
                method: "multipart",
                testMethod: "GET",
                successStatuses: [200],
                uploadMethod: "POST",
                chunkSize: 1024 * 1024 * 3,  //5MB
                fileParameterName: 'file', //上传文件时文件的参数名，默认file
                singleFile: false, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                query: function (file, res, status) {
                    // console.log(Math.floor(progress.value * 100))
                    let param = {
                        "fileType": file.getType(),
                        "uploadId": file.uploadId
                    }
                    if (self.fileFolderId != null) {
                        param.parentId = self.fileFolderId
                    }
                    return param;
                },
                testChunks: true,     //是否开启服务器分片校验
                checkChunkUploadedByResponse: function (chunk, message) {
                    let res = JSON.parse(message);
                    if (!res.success) {
                        console.log(res)
                        return true;
                    }
                },
                parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
                    return parsedTimeRemaining
                        .replace(/\syears?/, '年')
                        .replace(/\days?/, '天')
                        .replace(/\shours?/, '小时')
                        .replace(/\sminutes?/, '分钟')
                        .replace(/\sseconds?/, '秒')
                },
                simultaneousUploads: 5, //并发上传数
            }
            return {
                options
            }
        },
        data() {
            let self = this
            return {
                testFile:{},
                folderTree: [],
                uploadPanel: false,
                // options: {
                //     target: '/disk/api/file/upload',
                //     method: "multipart",
                //     testMethod: "GET",
                //     successStatuses: [200],
                //     uploadMethod: "POST",
                //     chunkSize: 1024 * 1024 * 3,  //5MB
                //     fileParameterName: 'file', //上传文件时文件的参数名，默认file
                //     singleFile: false, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                //     query: function (file, res, status) {
                //         // console.log(Math.floor(progress.value * 100))
                //         let param = {
                //             "fileType": file.getType(),
                //             "uploadId": file.uploadId
                //         }
                //         if (self.fileFolderId != null) {
                //             param.parentId = self.fileFolderId
                //         }
                //         return param;
                //     },
                //     testChunks: true,     //是否开启服务器分片校验
                //     checkChunkUploadedByResponse: function (chunk, message) {
                //         let res = JSON.parse(message);
                //         if (!res.success) {
                //             console.log(res)
                //             return true;
                //         }
                //     },
                //     simultaneousUploads: 5, //并发上传数
                // },
                statusText: {
                    success: "上传成功！",
                    error: "出错了！",
                    uploading: "上传中...",
                    paused: "等待中...",
                    waiting: "等待中..."
                },
                pageData: {
                    index: 1,
                    size: 10,
                    total: 0
                },
                fileList: [],
                fileFolderId: "",
                newFolderName: "",
                folderDrawer: false,
                fileDrawer: false,
                fileInfo: {
                    filePath: "",
                    fileName: "",
                    fileType: "",
                    fileSize: ""
                },
                easyUploadForm: {
                    hasDate: true,
                    easyUpload: true,
                    parentId: "",
                    fileType: 1
                },
                uploadImgDrawer: false,
                imageShow: false,
                imageShowUrl: "",
                navFolders: [],
                loadTable: true,
                tableSelectRow: []
            }
        },
        mounted: function () {
            this.loadParams();
            this.diskInfo();
            this.getFolderTree();
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
        },
        methods: {
            selectionLineChangeHandle(row) {
                this.tableSelectRow = row;
            },
            imgSelectParentFolder(value) {
                this.easyUploadForm.parentId = value.pop();
                console.log(this.easyUploadForm.parentId)
            },
            imgUploadSuccess(response, file, fileList) {
                if (response.success) {
                    ElMessage.success("上传完成");
                    this.uploadImgUrl = response.result;
                    console.log(this.uploadImgUrl)
                    this.diskInfo();
                    this.copyToClipboard(response.result);
                } else {
                    ElMessage.error(response.message);
                }
                console.log(response)
            },
            showImageHandler(url) {
                this.imageShowUrl = url;
                this.imageShow = true;
            },
            getFolderTree() {
                axios({
                    url: "/disk/api/system/folderTree",
                    method: "GET",
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        this.folderTree = data.result;
                    } else {
                    }
                })
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
                    fileFolderId = null;
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
                    this.$router.push({path: '/disk', query: {fileFolderId: paths}});
                }

            },
            //云盘相关
            onFileSuccess: function (rootFile, file, response, chunk) {
                let res = JSON.parse(response);
                if (res.success) {
                    //上传成功 帮助服务端删除临时目录
                    this.diskInfo();
                    ElMessage.success("上传完成");
                } else {
                    ElMessage.error(res.message);
                }
            },
            //上传文件前
            filesAdded(file, event) {
                this.testFile = file;
                this.uploadPanel = true;
                //上传前校验该文件是否上传
                file.pause();
                this.calculateMD5(file).then(() => {
                    axios({
                        url: "/disk/api/pre/requestUploadFile",
                        method: "POST",
                        data: {
                            "uniqueIdentifier": file.uniqueIdentifier,
                            "folderId": this.fileFolderId,
                            "fileName": file.name
                        }
                    }).then((res) => {
                        var data = res.data;
                        if (data.success) {
                            var responseType = data.result.responseType;
                            if (responseType === 1) {
                                file.uniqueIdentifier = data.result.identifier;
                                file.uploadId = data.result.uploadId
                                //继续上传
                                file.resume();
                            }
                            if (responseType === 0) {
                                ElMessage.success("上传成功");
                                file.cancel();
                                this.diskInfo();
                            }
                        } else {
                            //上传失败
                            ElMessage.error(data.message);
                            file.cancel();
                            return false;
                        }
                    })
                }).catch(error => {
                });
            },
            calculateMD5(file) {
                return new Promise((resolve, reject) => {
                    const fileReader = new FileReader()
                    const time = new Date().getTime()
                    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
                    let currentChunk = 0
                    const chunkSize = 5 * 1024 * 1000
                    const chunks = Math.ceil(file.size / chunkSize)
                    const spark = new SparkMD5.ArrayBuffer()
                    //只计算第一片文件md5码
                    const chunkNumberMD5 = 1

                    loadNext()
                    fileReader.onload = e => {
                        spark.append(e.target.result)

                        if (currentChunk < chunkNumberMD5) {
                            loadNext()
                        } else {
                            const md5 = spark.end()
                            file.uniqueIdentifier = md5
                            console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
                        }
                        resolve();
                    }
                    fileReader.onerror = function () {
                        reject();
                        ElMessage.error(`文件${file.name}读取出错，请检查该文件`)
                        file.cancel()
                    }

                    function loadNext() {
                        const start = currentChunk * chunkSize
                        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize

                        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
                        currentChunk++
                    }
                });
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
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        //文件
                        var result = data.result;
                        this.fileList = result.infos.records;
                        this.pageData.total = result.infos.total;
                        this.loadTable = false;
                    } else {
                        ElMessage.error(data.message);
                    }
                })
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
            copySuccess(row) {
                ElMessage.success("复制: " + row.fileName + " 成功,路径为：" + row.filePath);
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
            folderDrawerClose() {
                this.folderDrawer = false;
                this.newFolderName = "";
            },
            uploadImgDrawerClose() {
                this.uploadImgDrawer = false;
                this.uploadImgUrl = "";
            },
            openFileDrawer(row) {
                this.fileInfo = row;
                this.fileDrawer = true;
            },
            fileDrawerClose() {
                this.fileDrawer = false;
                this.fileInfo = this.$options.data().fileInfo;
            },
            createFolder() {
                axios({
                    url: "/disk/api/file/newFolder",
                    method: "POST",
                    data: {
                        "newFolderName": this.newFolderName,
                        "parentId": this.fileFolderId
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        this.diskInfo();
                        this.folderDrawer = false;
                    } else {
                        //上传失败
                        ElMessage.error(data.message);
                    }
                })
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
