<template>
    <div class="disk-container">
        <router-view :key="ccompent"></router-view>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                fileFolderId: "",
                ccompent: ""
            }
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
        }
    }
</script>

<style scoped>
    .disk-container {
        width: 100%;
        position: relative;
    }
</style>
