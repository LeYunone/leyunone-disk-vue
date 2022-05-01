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
    <div class="top-menu">
        <span class="function-menu">
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
                            <uploader-btn>上传文件</uploader-btn>
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
        </span>
        <span class="function-menu">
            <button @click="newFolder">
                <i class="el-icon-folder-add"></i>
                <span>新建文件夹</span>
            </button>
        </span>
    </div>
    <div style="clear:both"></div>
    <el-breadcrumb style="margin-top:30px " separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click="goBack">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>活动管理</el-breadcrumb-item>
        <el-breadcrumb-item>活动管理</el-breadcrumb-item>
        <el-breadcrumb-item>活动列表</el-breadcrumb-item>
        <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
    <el-table
            :data="myFile"
            fit="false"
            max-height="540px"
            size="mini"
            style="font-size:9px;margin: 20px;width: 100%">
        <el-table-column
                type="selection"
                width="55">
        </el-table-column>
        <el-table-column
                fixed
                prop="name"
                label="文件名"
                show-overflow-tooltip="true"
                width="1200px">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <a @click="openFolder(scope.row.name,scope.row.id)">
                        <i v-if="scope.row.fileType==null">[文件夹]</i>
                    </a>
                    <i v-if="scope.row.fileType==0">
                        [文件夹]
                        <el-input
                                v-model="this.name"
                                class="w-50 m-2"
                                size="small"
                                placeholder=""/>
                        <a class="aLink" @click="addFolder">
                            <i style="font-size: 17px;color:#21a5dc" class="el-icon-check">
                            </i>
                        </a>
                        <a class="aLink">
                            <i style="font-size: 17px;color:#21a5dc" class="el-icon-close">
                            </i>
                        </a>
                    </i>
                    <i v-if="scope.row.fileType==1">[图片]</i>
                    <i v-if="scope.row.fileType==2">[音乐]</i>
                    <i v-if="scope.row.fileType==3">[视频]</i>
                    <i v-if="scope.row.fileType==4">[文档]</i>
                    <i v-if="scope.row.fileType==5">[其他文件]</i>
                    <span style="margin-left: 10px">{{ scope.row.name }}</span>
                </div>
            </template>
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
    import Cookies from 'js-cookie';

    export default {
        data() {
            let self = this
            return {
                name: "",
                checkAddFloder: true,
                uploadPanel: false,
                options: {
                    target: '/disk/file/uploadFile',
                    chunkSize: 1024 * 1024 * 5,  //3MB
                    fileParameterName: 'file', //上传文件时文件的参数名，默认file
                    singleFile: true, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function (file, res, status) {
                        if (self.folderId != null) {
                            return {
                                "userId": Cookies.get('userId'),
                                "fileType": file.getType(),
                                "identifier": file.uniqueIdentifier,
                                "fileFolderId": self.folderId
                            }
                        } else {
                            return {
                                "userId": Cookies.get('userId'),
                                "identifier": file.uniqueIdentifier,
                                "fileType": file.getType(),
                            }
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
                upLoadValiValue: -1,
                fileKey: "",
                folderId: "",
            }
        },
        mounted: function () {
            this.checkLogin();
        },
        methods: {
            loadParams() {
                var folderId = this.$route.query.fileFolderId;
                if (folderId != null) {
                    var temp = this.$route.query.fileFolderId.split('%');
                    folderId = temp[temp.length - 1];
                } else {
                    folderId = null;
                }
                this.folderId = folderId;
            },
            goBack() {
                this.$router.go(-1)
            },
            openFolder(name, id) {
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
                ElMessage.success("上传成功");
                this.diskInfo();
            },
            //上传文件前
            filesAdded(file, event) {
                this.uploadPanel = true;
                //上传前校验该文件是否上传
                let formData = new FormData();
                formData.append('file', file.file);
                formData.append("userId", Cookies.get('userId'))
                if (this.folderId != null) {
                    formData.append("fileFolderId", this.folderId)
                }
                axios({
                    url: "/disk/file/requestSaveFile",
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
                            file.uniqueIdentifier = data.data.identifier;
                            //继续上传
                            console.log(file)
                            file.resume();
                        } else {
                            file.cancel();
                        }
                    } else {
                        //上传失败
                        ElMessage.error("UpLoadFile Error");
                        file.cancel();
                        return false;
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
            addFolder() {
                if (this.name == "") {
                    ElMessage.error("文件(夹)名称不能为空，请输入文件名称")
                    return false;
                }
                axios({
                    url: "/disk/file/newFolder",
                    method: "POST",
                    data: {
                        userId: Cookies.get('userId'),
                        filename: this.name,
                        fileFolderId: this.folderId,
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.status) {
                        ElMessage.success("创建文件夹成功");
                        this.checkAddFloder = true;
                        this.diskInfo();
                    } else {
                        ElMessage.error(data.message);
                        this.name = "";
                    }
                })
            },
            diskInfo() {
                this.loadParams();

                axios({
                    url: "/disk/file/selectFile",
                    method: "GET",
                    params: {
                        userId: Cookies.get('userId'),
                        fileFolderId: this.folderId
                    }
                }).then((res) => {
                    var data = res.data;
                    if (data.status) {
                        this.myFile = data.data.fileinfos;
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
                        url: "/disk/file/deleteFile",
                        method: "GET",
                        params: {
                            fileId: row.id
                        }
                    }).then(res => {
                        var data = res.data;
                        if (data.status) {
                            this.myFile.splice(index, 1);
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
                    url: "/disk/file/downFile",
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
            newFolder() {
                if (this.checkAddFloder) {
                    this.myFile.unshift({"fileType": 0});
                }
                this.checkAddFloder = false;
            },
        }
    }
</script>
<style>
    .function-menu {
        float: left;
    }

    .top-menu {

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

    .aLink:hover {
        background-color: #E5F1FD;
    }
</style>
