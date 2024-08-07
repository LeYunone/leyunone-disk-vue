<template>
    <div id="global-uploader">
        <div class="main-top-operation">
            <uploader
                    ref="uploader"
                    :options="options"
                    :file-status-text="statusText"
                    :autoStart="false"
                    @file-added="filesAdded"
                    @file-removed="fileRemoved"
                    @file-progress="onFileProgress"
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
                <span class="function-menu">
                    <el-input placeholder="请输入文件或文件夹前缀匹配" size="small" v-model="nameCondition" class="input-with-select">
                        <template #append>
                            <el-button>
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </span>
                <div style="margin-top: 14px">
                    <uploader-list v-show="uploadPanel"/>
                </div>
            </uploader>
        </div>
    </div>

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
</template>

<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import SparkMD5 from 'spark-md5'
    import bus from "../js/bus"

    export default {
        data() {
            let self = this;
            return {
                folderTree: [],
                nameCondition:"",
                uploadPanel: false,
                options: {
                    target: '/disk/api/file/upload',
                    method: "multipart",
                    testMethod: "GET",
                    uploadMethod: "POST",
                    chunkSize: 1024 * 1024 * 3,  //5MB
                    fileParameterName: 'file', //上传文件时文件的参数名，默认file
                    singleFile: false, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function (file, chunk) {
                        console.log(file);
                        console.log(chunk)
                        let param = {
                            "fileType": file.getType(),
                            "uploadId": file.uploadId
                        }
                        param.parentId = self.loadParams()
                        return param;
                    },
                    testChunks: true,     //是否开启服务器分片校验
                    checkChunkUploadedByResponse: function (chunk, message) {
                        let res = JSON.parse(message);
                        if (res.success) {
                            if (res.result.skipUpload) {
                                console.log("skip...")
                                return true;
                            }
                            console.log(chunk);
                            return (res.result.uploadedChunks || []).indexOf(chunk.offset + 1) >= 0;
                        } else {
                            ElMessage.error(res.message);
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
                },
                statusText: {
                    success: "上传成功！",
                    error: "出错了！",
                    uploading: "上传中...",
                    paused: "等待中...",
                    waiting: "等待中..."
                },
                folderDrawer: false,
                easyUploadForm: {
                    hasDate: true,
                    easyUpload: true,
                    parentId: "",
                    fileType: 1
                },
                newFolderName: "",
                uploadImgDrawer: false,
                imageShow: false,
                imageShowUrl: "",
            }
        },
        mounted: function () {
            this.getFolderTree();
            this.loadParams();
        },
        methods: {
            handleBusDiskInfo(){
                bus.emit("diskInfo")
            },
            folderDrawerClose() {
                this.folderDrawer = false;
                this.newFolderName = "";
            },
            createFolder() {
                if(this.newFolderName.trim() === ""){
                    ElMessage.error("目录名为空");
                    return;
                }
                axios({
                    url: "/disk/api/file/newFolder",
                    method: "POST",
                    data: {
                        "newFolderName": this.newFolderName,
                        "parentId": this.loadParams()
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.success) {
                        this.handleBusDiskInfo();
                        this.folderDrawer = false;
                    } else {
                        //上传失败
                        ElMessage.error(data.message);
                    }
                })
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
            onFileProgress(rootFile, file, chunk) {
            },
            fileRemoved(file) {
                //取消文件
                axios({
                    url:"/disk/api/file/cancelUpload",
                    data:file,
                    method:"POST"
                })
                console.log(file)
            },
            imgSelectParentFolder(value) {
                console.log(value)
                this.easyUploadForm.parentId = value.pop();
            },
            imgUploadSuccess(response, file, fileList) {
                if (response.success) {
                    ElMessage.success("上传完成");
                    this.uploadImgUrl = response.result;
                    this.copyToClipboard(response.result);
                    this.handleBusDiskInfo();
                } else {
                    ElMessage.error(response.message);
                }
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
            //云盘相关
            onFileSuccess: function (rootFile, file, response, chunk) {
                let res = JSON.parse(response);
                if (res.success) {
                    ElMessage.success("上传完成");
                    this.handleBusDiskInfo();
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
                file.parentId = this.loadParams();
                this.calculateMD5(file).then(() => {
                    axios({
                        url: "/disk/api/pre/requestUploadFile",
                        method: "POST",
                        data: {
                            "uniqueIdentifier": file.uniqueIdentifier,
                            "folderId": this.loadParams(),
                            "fileName": file.name
                        }
                    }).then((res) => {
                        var data = res.data;
                        if (data.success) {
                            var responseType = data.result.responseType;
                            if (responseType === 0) {
                                ElMessage.success("重复文件...上传成功");
                                file.cancel();
                                this.handleBusDiskInfo();
                            }
                            if (responseType === 1) {
                                file.uniqueIdentifier = data.result.identifier;
                                file.uploadId = data.result.uploadId
                                //继续上传
                                file.resume();
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
            uploadImgDrawerClose() {
                this.uploadImgDrawer = false;
                this.uploadImgUrl = "";
            },
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
