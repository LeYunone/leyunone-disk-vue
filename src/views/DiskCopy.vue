<template>
    <div class="main-top">
        <TopUploader :fileFolderId="fileFolderId" />
    </div>
    <div class="table-main">
        <router-view></router-view>
    </div>
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
</template>
<script>

    import TopUploader from "./TopUploader.vue";
    import axios from "axios";
    import {ElMessage} from "element-plus";
    export default {
        components: {
            TopUploader,
        },
        data() {
            return {
                fileFolderId:"",
                pageData: {
                    index: 1,
                    size: 10,
                    total: 0
                },
            }
        },
        mounted: function () {
            this.loadParams();
            this.diskInfo();
        },
        methods: {
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
