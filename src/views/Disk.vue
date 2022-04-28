<template>
    【云盘】

    <uploader :options="options"
              :file-status-text="statusText"
              @file-added="filesAdded"
              @file-success="onFileSuccess"
              class="uploader-example">
        <uploader-unsupport></uploader-unsupport>
        <uploader-drop>
            <uploader-btn>上传文件</uploader-btn>
            <uploader-btn :directory="true">上传文件夹</uploader-btn>
        </uploader-drop>
        <uploader-list></uploader-list>
    </uploader>

    <el-date-picker :disabled-date="publishDateAfter"
                    type="date" placeholder="保存时间" v-model="upLoadParam.saveTime"
                    value-format="YYYY-MM-DD"
                    style="margin-left:10px; width: 24%;"></el-date-picker>
    <el-tooltip class="item" effect="dark" content="选择保存时间：
                            到某年某日自动过期;未选择默认：永久保存" placement="bottom">
        <i style="font-size:24px" class="el-icon-bell">
        </i>
    </el-tooltip>
    <el-tabs v-model="default_fileList" @tab-click="tableClick">
        <el-tab-pane label="全部文件" name="0"></el-tab-pane>
        <el-tab-pane label="图片" name="1"></el-tab-pane>
        <el-tab-pane label="音频" name="2"></el-tab-pane>
        <el-tab-pane label="视频" name="3"></el-tab-pane>
        <el-tab-pane label="文档" name="4"></el-tab-pane>
        <el-tab-pane label="其他" name="5"></el-tab-pane>
        <el-empty v-if="myFile == undefined || myFile.length <= 0"
                  description="文件列表为空，请上传文件"></el-empty>
        <el-table v-else
                  :data="myFile"
                  border
                  fit="false"
                  max-height="540px"
                  style="margin-left: 10px;width: 650px">
            <el-table-column
                    fixed
                    prop="name"
                    label="文件名"
                    width="180px">
            </el-table-column>
            <el-table-column
                    prop="fileTypeText"
                    label="文件类型"
                    width="100">
            </el-table-column>
            <el-table-column
                    prop="createDt"
                    label="上传时间"
                    width="100">
            </el-table-column>
            <el-table-column
                    prop="saveDt"
                    label="保存时间"
                    width="100">
            </el-table-column>
            <el-table-column
                    prop="fileSize"
                    label="文件大小(KB)"
                    width="140">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    key="slot"
                    width="100">
                <template #default='scope'>
                    <el-button @click="downFile(scope.row)" type="text" size="small">下载</el-button>
                    <el-button @click="deleteFile(scope.$index,scope.row)" type="text"
                               style="color: red" size="small">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-tabs>
    <div class="page-card">
        <el-pagination background layout="prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="query.pageTotal"
                       @current-change="handlePageChange"></el-pagination>
    </div>
    <el-dialog title="登陆" v-model="login_user" width="30%">
        <el-form label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="form.userName"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input type="password" v-model="form.passWord"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="diskDrawer = false">取 消</el-button>
                            <el-button type="primary" @click="login">确 定</el-button>
                        </span>
        </template>
    </el-dialog>
</template>
<script>
    import axios from "axios";
    import {ElMessage} from "element-plus";
    import Cookies from 'js-cookie'

    export default {
        data() {
            return {
                options: {
                    target: '/disk/file/uploadFile',
                    chunkSize: 1024 * 1024 * 5,  //3MB
                    fileParameterName: 'file', //上传文件时文件的参数名，默认file
                    singleFile: true, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function (file, res, status) {
                        console.log(file)
                        return {
                            "userId": Cookies.get('userId'),
                            "fileType": file.getType(),
                        }
                    },
                    maxChunkRetries: 3,  //最大自动失败重试上传次数
                    testChunks: true,     //是否开启服务器分片校验
                    checkChunkUploadedByResponse: function (chunk, message) {
                        let res = JSON.parse(message);
                        if (!res.status) {
                            return false;
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
                percentage: "",
                show: "",
                uploadUrl: "",
                default_fileList: "0",
                form: {
                    userName: "",
                    passWord: ""
                },
                upLoadParam: {
                    saveTime: "",
                },
                user_disk: false,
                login_user: false,
                diskDrawer: false,
                pageData: {
                    index: 1,
                    size: 10
                },
                articleList: [],
                fileList: [],
                myFile: [],
                fileTotalSize: 0,
                upLoadValiValue: -1,
                fileKey: "",
                orderType: 3,
                query: {
                    pageSize: 10,
                    pageTotal: 0,
                    pageIndex: 1,
                },
            }
        },
        mounted: function () {
            this.checkLogin();
        },
        methods: {
            //云盘相关
            onFileSuccess: function (rootFile, file, response, chunk) {
                ElMessage.success("上传成功");
                console.log(response);
            },
            //上传文件前
            filesAdded(file, event) {
                //上传前校验该文件是否上传
                let formData = new FormData();
                formData.append('file', file.file);
                axios({
                    url: "/leyuna/disk/requestSaveFile",
                    method: "POST",
                    async: false,
                    processData: false, // 使数据不做处理
                    contentType: false,
                    dataType: 'json',
                    data: formData
                }).then((res) => {
                    var data = res.data;
                    if (data.status) {
                        var responseType = data.data.responseType;
                        if (responseType === 1) {
                            this.upLoadValiValue = 1;
                            file.uniqueIdentifier = data.data.identifier;
                            console.log(data.data.identifier);
                        } else {
                            this.upLoadValiValue = 0;
                        }
                        //继续上传
                    } else {
                        //上传失败
                        ElMessage.error("UpLoadFile Error");
                        return false;
                    }
                })
                file.resume();
            },

            tableClick(tab, event) {
                var fileType = tab.props.name;
                this.default_fileList = fileType;
                axios({
                    url: "/leyuna/disk/getDiskInfo",
                    method: "GET",
                    params: {
                        fileType: fileType,
                        type: this.orderType,
                        index: this.query.pageIndex,
                        size: this.query.pageSize
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.status) {
                        this.myFile = data.data.fileinfos.records;
                        this.query.pageTotal = data.data.fileinfos.total;
                    } else {
                        ElMessage.error(data.message);
                    }
                })
            },
            getTime(val) {
                this.val = this.val.format("YYYY-MM-DD");
                alert(val)
                this.upLoadParam.saveTime = val;
            },
            publishDateAfter(time) {
                return time.getTime() <= Date.now();
            },

            diskInfo() {
                this.default_fileList = "0",
                    axios({
                        url: "/leyuna/disk/getDiskInfo",
                        method: "GET",
                        params: {
                            fileType: this.default_fileList,
                            userId :Cookies.get('userId'),
                            type: this.orderType
                        }
                    }).then((res) => {
                        var data = res.data;
                        if (data.status) {
                            this.myFile = data.data.fileinfos.records;
                            this.query.pageTotal = data.data.fileinfos.total;
                            this.fileTotalSize = data.data.fileTotalStr;
                            this.user_disk = true;
                            this.login_user = false;
                        } else {
                            ElMessage.error(data.message);
                        }
                    })
                this.diskDrawer = true;
            },

            deleteFile(index, row) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    axios({
                        url: "/leyuna/disk/deleteFile",
                        method: "GET",
                        params: {
                            fileId: row.id
                        }
                    }).then(res => {
                        var data = res.data;
                        if (data.status) {
                            this.myFile.splice(index, 1);
                            this.fileTotalSize = data.data;
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
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
            downFile(row) {
                axios({
                    url: "/leyuna/disk/downFile",
                    method: "GET",
                    params: {
                        fileId: row.id
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
                })
            },
            checkLogin() {
                let userId = Cookies.get('userId');
                if(userId == null){
                    //登录窗口
                    this.login_user = true;
                }else{
                    //已登录 加载初始信息
                    this.diskInfo();
                }
            },
            login() {
                axios({
                    url: "/leyuna/user/login",
                    method: "POST",
                    data: {
                        "userName": this.form.userName,
                        "passWord": this.form.passWord
                    }
                }).then((res => {
                    var data = res.data;
                    if (data.status) {
                        this.diskInfo();
                        Cookies.set('userId', data.data.loginId);
                    } else {
                        ElMessage.error(data.message);
                        this.form.userName = "";
                        this.form.passWord = "";
                    }
                }))
            },

            handlePageChange(val) {
                this.query.pageIndex = val;
                this.diskInfo();
            },
        }
    }
</script>
<style>
    .uploader-example {
        width: 880px;
        padding: 15px;
        margin: 40px auto 0;
        font-size: 12px;
        box-shadow: 0 0 10px rgba(0, 0, 0, .4);
    }

    .uploader-example .uploader-btn {
        margin-right: 4px;
    }

    .uploader-example .uploader-list {
        max-height: 440px;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>
