<template>
    <div class="disk-container">
        <router-view :key="ccompent"></router-view>
        <!-- Left floating decoration -->
        <div class="disk-decoration disk-decoration-left" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.09 8.26L20.18 8.63L15.54 12.64L17.12 19.37L12 15.77L6.88 19.37L8.46 12.64L3.82 8.63L9.91 8.26L12 2Z" fill="rgba(255,107,157,0.25)"/>
            </svg>
        </div>
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

    .disk-decoration {
        position: fixed;
        pointer-events: none;
        z-index: 5;
        animation: floatStar 6s ease-in-out infinite;
    }

    .disk-decoration-left {
        left: 16px;
        top: 50%;
    }

    @keyframes floatStar {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
        50% { transform: translateY(-12px) rotate(15deg); opacity: 1; }
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .disk-decoration {
            display: none;
        }
    }
</style>
