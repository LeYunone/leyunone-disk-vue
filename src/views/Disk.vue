<template>
    【云盘】
    <!--    <el-date-picker :disabled-date="publishDateAfter"-->
    <!--                    type="date" placeholder="保存时间" v-model="upLoadParam.saveTime"-->
    <!--                    value-format="YYYY-MM-DD"-->
    <!--                    style="margin-left:10px; width: 24%;"></el-date-picker>-->
    <!--    <el-tooltip class="item" effect="dark" content="选择保存时间：-->
    <!--                            到某年某日自动过期;未选择默认：永久保存" placement="bottom">-->
    <!--        <i style="font-size:24px" class="el-icon-bell">-->
    <!--        </i>-->
    <!--    </el-tooltip>-->
    <div class="main-top">
        <span class="function-menu">
            <uploader :options="options"
                      :file-status-text="statusText"
                      :autoStart="false"
                      @file-added="filesAdded"
                      @file-success="onFileSuccess"
                      class="uploader-example">
            <uploader-unsupport></uploader-unsupport>
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

            <uploader-list v-show="uploadPanel">
            </uploader-list>
        </uploader>
        </span>
        <span class="function-menu">
            <el-button class="button-common" @click="folderDrawer = true">
                <i class="el-icon-folder-add"></i>
                <span>新建文件夹</span>
            </el-button>
        </span>
    </div>
    <div style="clear:both"></div>
    <div class="table-main">
        <el-breadcrumb style="margin-top:30px " separator-class="el-icon-arrow-right">
            <el-breadcrumb-item @click="goBack">返回上一级</el-breadcrumb-item>
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            <el-breadcrumb-item>活动列表</el-breadcrumb-item>
            <el-breadcrumb-item>活动详情</el-breadcrumb-item>
        </el-breadcrumb>
        <el-table
                :data="fileList"
                fit="false"
                max-height="540px"
                size="medium"
                style="margin: 20px;width: 100%">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column
                    width="80">
                <template #default="scope">
                    <a v-if="scope.row.folder" class="el-icon-folder" @click="openFolder(scope.row.folderId)"></a>
                    <i v-if="scope.row.fileType===1" class="el-icon-picture"></i>
                    <i v-if="scope.row.fileType===2" class="el-icon-headset"></i>
                    <i v-if="scope.row.fileType===3" class="el-icon-video-camera-solid"></i>
                    <i v-if="scope.row.fileType===4" class="el-icon-document-copy"></i>
                    <i v-if="scope.row.fileType===5" class="el-icon-tickets"></i>
                </template>
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="文件名"
                    show-overflow-tooltip="true"
                    width="500">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-button v-if="scope.row.folder" @click="openFolder(scope.row.folderId)" type="text"
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
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="fileSize"
                    label="文件大小"
                    width="150">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    key="slot"
                    width="120">
                <template #default='scope'>
                    <el-button v-if="scope.row.fileType===1" v-clipboard:copy="scope.row.filePath"
                               v-clipboard:success="copySuccess(scope.row)" type="text" size="small">复制url
                    </el-button>
                    <el-button v-if="!scope.row.folder" @click="openFileDrawer(scope.row)" type="text" size="small">详情
                    </el-button>
                    <el-button v-if="!scope.row.folder" @click="downFile(scope.row)" type="text" size="small">下载
                    </el-button>
                    <el-button @click="deleteFile(scope.row)" type="text"
                               style="color: red" size="small">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
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
            title="文件详情"
            v-model="fileDrawer"
            :before-close="fileDrawerClose">
        <el-descriptions title="文件信息">
            <el-image
                    style="width: 100px; height: 100px"
                    v-src="fileInfo.filePath"
                    :preview-src-list="fileInfo.filePath"
                    fit="contain"></el-image>
            <el-descriptions-item label="文件名">{{fileInfo.fileName}}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{fileInfo.fileSize}}</el-descriptions-item>
            <el-descriptions-item label="类型">{{fileInfo.fileType}}</el-descriptions-item>
        </el-descriptions>
    </el-dialog>

    <el-dialog
            title="发布图片"
            v-model="uploadImgDrawer"
            :before-close="uploadImgDrawerClose">
        <div class="block">
            <span class="demonstration">文件夹：</span>
            <el-cascader
                    placeholder="搜索"
                    :options="folderTree"
                    @change="imgSelectParentFolder"
                    :props="{ checkStrictly: true }"
                    filterable></el-cascader>
        </div>
        <div class="block">
            <span class="demonstration">日期前缀 yyyy-MM-dd：</span>
            <el-switch
                    v-model="easyUploadForm.hasDate"
                    active-color="#13ce66"
                    inactive-color="#ff4949">
            </el-switch>
        </div>

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
                @click="handlePictureCardPreview(file)">
            <el-icon><zoom-in/></el-icon>
          </span>
        </span>
                </div>
            </template>
        </el-upload>

        <el-dialog v-model="imageShow">
            <img w-full :src="imageShowUrl" alt="Preview Image"/>
        </el-dialog>

        <div slot="tip">图片路径： {{uploadImgUrl}}</div>
    </el-dialog>
    <div ref="copyText" style="display: none;">{{ textToCopy }}</div>

</template>
<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import SparkMD5 from 'spark-md5'

    export default {
        data() {
            let self = this
            return {
                folderTree: [],
                uploadPanel: false,
                options: {
                    target: '/disk/api/file/upload',
                    method: "multipart",
                    testMethod: "GET",
                    uploadMethod: "POST",
                    chunkSize: 1024 * 1024 * 5,  //5MB
                    fileParameterName: 'file', //上传文件时文件的参数名，默认file
                    singleFile: false, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function (file, res, status) {
                        let param = {
                            "fileType": file.getType(),
                            "uploadId": file.uploadId
                        }
                        if (self.fileFolderId != null) {
                            param.parentId = self.fileFolderId
                        }
                        return param;
                    },
                    maxChunkRetries: 3,  //最大自动失败重试上传次数
                    testChunks: true,     //是否开启服务器分片校验
                    checkChunkUploadedByResponse: function (chunk, message) {
                        let res = JSON.parse(message);
                        if (!res.success) {
                            console.log(res)
                            return true;
                        }
                    },
                    simultaneousUploads: 3, //并发上传数
                },
                statusText: {
                    success: "上传成功！",
                    error: "出错了！",
                    uploading: "上传中...",
                    paused: "等待中...",
                    waiting: "等待中..."
                },
                pageData: {
                    index: 1,
                    size: 10
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
                    parentId: ""
                },
                uploadImgDrawer: false,
                imageShow: false,
                imageShowUrl: "",
                textToCopy: ""
            }
        },
        mounted: function () {
            this.diskInfo();
            this.getFolderTree();
        },
        methods: {
            imgSelectParentFolder(value) {
                this.easyUploadForm.parentId = value.pop();
                console.log(this.easyUploadForm.parentId)
            },
            imgUploadSuccess(response, file, fileList) {
                console.log(response)
            },
            handlePictureCardPreview(file) {
                this.imageShowUrl = file.url;
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
            copyToClipboard() {
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
            goBack() {
                this.$router.go(-1)
            },
            openFolder(id) {
                let paths = this.$route.query.fileFolderId;
                if (paths == null) {
                    paths = id;
                } else {
                    paths = paths + '%' + id;
                }
                this.$router.push({path: '/disk', query: {fileFolderId: paths}});
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
                this.uploadPanel = true;
                //上传前校验该文件是否上传
                file.pause();
                this.calculateMD5(file).then(() => {
                    axios({
                        url: "/disk/api/pre/requestUploadFile",
                        method: "POST",
                        data: {
                            "uniqueIdentifier": file.uniqueIdentifier,
                            "folderId": this.$route.query.fileFolderId,
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
                            ElMessage.error("UpLoadFile Error");
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
                this.loadParams();

                axios({
                    url: "/disk/api/file/getFiles",
                    method: "GET",
                    params: {
                        fileFolderId: this.fileFolderId,
                        index: 1,
                        size: 50,
                        nameCondition: "",
                        fileType: ""
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        //文件
                        var result = data.result;
                        this.fileList = result.infos.records;
                    } else {
                        ElMessage.error(data.message);
                    }
                })
            },

            deleteFile(row) {
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
            }
        }
    }
</script>
<style>
    .function-menu {
        float: left;
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
    }

    .aLink:hover {
        background-color: #E5F1FD;
    }
</style>
