<template>
    <h3 style="text-align: center;">一个云盘</h3>
    <div class="main-top">
        <TopUploader/>
    </div>
    <router-view :key="$route.fullPath"/>
</template>

<script>
    import TopUploader from "./views/TopUploader.vue";

    export default {
        components: {
            TopUploader,
        },
        data() {
            return {
            }
        },
        mounted: function () {
        },
        
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
