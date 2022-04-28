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
    <uploader :options="options"
              :file-status-text="statusText"
              @file-added="filesAdded"
              @file-success="onFileSuccess"
              class="uploader-example">
        <uploader-unsupport></uploader-unsupport>
        <el-dropdown>
            <el-button type="primary">
                上传
                <el-icon class="el-icon--right">
                    <arrow-down/>
                </el-icon>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>
                        <uploader-btn >上传文件</uploader-btn>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <uploader-btn :directory="true">上传文件夹</uploader-btn>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>


        <uploader-list v-show="uploadPanel">
        </uploader-list>
    </uploader>
    <el-tabs v-model="default_fileList" @tab-click="tableClick">
        <el-table v-if="myFile.length>0"
                  :data="myFile"
                  fit="false"
                  max-height="540px"
                  size="mini"
                  style="font-size:9px;margin: 20px;width: 100%">
            <el-table-column
                    fixed
                    prop="name"
                    label="文件名"
                    show-overflow-tooltip="true"
                    width="1300px">
            </el-table-column>
            <el-table-column
                    prop="createDt"
                    label="上传时间"
                    width="100px">
            </el-table-column>
            <el-table-column
                    prop="saveDt"
                    label="保存时间"
                    width="100">
            </el-table-column>
            <el-table-column
                    prop="fileSizeText"
                    label="文件大小"
                    width="150px">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    key="slot"
                    width="200px">
                <template #default='scope'>
                    <el-button @click="downFile(scope.row)" type="text" size="small">下载</el-button>
                    <el-button @click="deleteFile(scope.$index,scope.row)" type="text"
                               style="color: red" size="small">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-tabs>
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
                            <el-button @click="login_user = false">取 消</el-button>
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
                uploadPanel: false,
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
                login_user: false,
                pageData: {
                    index: 1,
                    size: 10
                },
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
                this.uploadPanel = true;
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
                            userId: Cookies.get('userId'),
                            type: this.orderType
                        }
                    }).then((res) => {
                        var data = res.data;
                        if (data.status) {
                            this.myFile = data.data.fileinfos.records;
                            this.query.pageTotal = data.data.fileinfos.total;
                            this.fileTotalSize = data.data.fileTotalStr;
                            this.login_user = false;
                        } else {
                            ElMessage.error(data.message);
                        }
                    })
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
                if (userId == null) {
                    //登录窗口
                    this.login_user = true;
                } else {
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
    .uploader-btn{

    }
</style>
