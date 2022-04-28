<template>
</template>
<script>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";
import { ref, reactive } from "vue";
export default {
    data() {
        return {
            search: false,
            direction: 'rtl',
            title:"",
            query:{
                pageIndex: 1,
                pageSize: 6,
            },
            dataList:[],
            pageTotal:"0",
            searchSize:"500px",
        };
    },
    methods: {
    } ,
};
</script>
