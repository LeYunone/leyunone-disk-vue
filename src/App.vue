<template>
    <div class="app-container">
        <header class="app-header">
            <div class="cat-ear cat-ear-left"></div>
            <div class="cat-ear cat-ear-right"></div>
            <div class="header-content">
                <div class="logo">
                    <span class="logo-icon" aria-hidden="true">
                        <!-- Cat face logo -->
                        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
                            <polygon points="15,40 25,10 42,40" fill="#5B8C6E" opacity="0.85"/>
                            <polygon points="85,40 75,10 58,40" fill="#5B8C6E" opacity="0.85"/>
                            <polygon points="20,36 27,18 38,36" fill="#8AB4A0" opacity="0.4"/>
                            <polygon points="80,36 73,18 62,36" fill="#8AB4A0" opacity="0.4"/>
                            <circle cx="50" cy="55" r="35" fill="#5B8C6E" opacity="0.15"/>
                            <ellipse cx="38" cy="50" rx="5" ry="6" fill="#5B8C6E" opacity="0.8"/>
                            <ellipse cx="62" cy="50" rx="5" ry="6" fill="#5B8C6E" opacity="0.8"/>
                            <ellipse cx="40" cy="48" rx="2" ry="2" fill="#fff" opacity="0.9"/>
                            <ellipse cx="64" cy="48" rx="2" ry="2" fill="#fff" opacity="0.9"/>
                            <path d="M44 60 Q50 66 56 60" stroke="#5B8C6E" stroke-width="2" fill="none" stroke-linecap="round"/>
                            <ellipse cx="32" cy="57" rx="6" ry="3.5" fill="#C4956A" opacity="0.25"/>
                            <ellipse cx="68" cy="57" rx="6" ry="3.5" fill="#C4956A" opacity="0.25"/>
                        </svg>
                    </span>
                    <span class="logo-text">乐云一</span>
                </div>
                <TopUploader/>
            </div>
            <!-- Header Banner Slot -->
            <div v-if="slots.banner" class="slot-banner">
                <img :src="slots.banner" class="slot-banner-img" alt="banner" />
            </div>
            <!-- Header peeking cat -->
            <div class="header-cat" aria-hidden="true">
                <svg width="40" height="32" viewBox="0 0 80 64">
                    <polygon points="10,35 18,5 30,35" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                    <polygon points="70,35 62,5 50,35" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                    <polygon points="13,32 19,12 27,32" fill="rgba(91,140,110,0.12)"/>
                    <polygon points="67,32 61,12 53,32" fill="rgba(91,140,110,0.12)"/>
                    <ellipse cx="40" cy="44" rx="30" ry="18" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                    <ellipse cx="30" cy="40" rx="4" ry="4.5" fill="#5B8C6E"/>
                    <ellipse cx="50" cy="40" rx="4" ry="4.5" fill="#5B8C6E"/>
                    <ellipse cx="31" cy="39" rx="1.5" ry="1.5" fill="#fff"/>
                    <ellipse cx="51" cy="39" rx="1.5" ry="1.5" fill="#fff"/>
                    <path d="M36 48 Q40 52 44 48" stroke="#5B8C6E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <ellipse cx="24" cy="45" rx="4" ry="2.5" fill="rgba(196,149,106,0.2)"/>
                    <ellipse cx="56" cy="45" rx="4" ry="2.5" fill="rgba(196,149,106,0.2)"/>
                </svg>
            </div>
        </header>

        <main class="app-main">
            <router-view :key="$route.fullPath"/>
        </main>

        <footer class="app-footer">
            <div class="footer-content">
                <StickerSlot :size="40" color="#5B8C6E"/>
                <span class="footer-text">Made with care — 乐云一 Disk 喵~</span>
                <StickerSlot :size="40" color="#8AB4A0"/>
            </div>
        </footer>

        <!-- Left Side Slot -->
        <div v-if="slots.leftSide" class="slot-side slot-left">
            <img :src="slots.leftSide" class="slot-side-img" alt="decoration" />
        </div>

        <!-- Right Side Slot -->
        <div v-if="slots.rightSide" class="slot-side slot-right">
            <img :src="slots.rightSide" class="slot-side-img" alt="decoration" />
        </div>

        <!-- Fixed bottom-right sleeping cat -->
        <div class="sleeping-cat" aria-hidden="true">
            <svg width="60" height="40" viewBox="0 0 120 80">
                <!-- Curled up body -->
                <ellipse cx="60" cy="50" rx="40" ry="22" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <!-- Head resting on body -->
                <circle cx="30" cy="40" r="18" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <!-- Ears -->
                <polygon points="18,28 22,14 28,28" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <polygon points="32,24 36,12 40,26" fill="#eef5ee" stroke="#5B8C6E" stroke-width="1.5"/>
                <polygon points="20,26 23,17 26,26" fill="rgba(91,140,110,0.12)"/>
                <polygon points="34,23 36,15 38,24" fill="rgba(91,140,110,0.12)"/>
                <!-- Closed eyes (sleeping) -->
                <path d="M22 38 Q25 41 28 38" stroke="#5B8C6E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <path d="M32 36 Q35 39 38 36" stroke="#5B8C6E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <!-- Nose -->
                <ellipse cx="30" cy="43" rx="2" ry="1.5" fill="#5B8C6E" opacity="0.4"/>
                <!-- Tail -->
                <path d="M95 45 Q110 30 100 20 Q95 15 90 22" stroke="#5B8C6E" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                <!-- Zzz -->
                <text x="42" y="22" font-size="10" fill="#5B8C6E" opacity="0.35" font-family="Inter, sans-serif">z</text>
                <text x="50" y="16" font-size="8" fill="#5B8C6E" opacity="0.25" font-family="Inter, sans-serif">z</text>
                <text x="56" y="12" font-size="6" fill="#5B8C6E" opacity="0.18" font-family="Inter, sans-serif">z</text>
            </svg>
        </div>
    </div>
</template>

<script>
    import TopUploader from "./views/TopUploader.vue";
    import StickerSlot from "./components/StickerSlot.vue";

    export default {
        components: {
            TopUploader,
            StickerSlot,
        },
        data() {
            return {
                // ========================================
                // 动态图片插槽配置
                // 填入图片/GIF 的 URL 即可显示，留空则不显示
                // ========================================
                slots: {
                    // 导航栏下方横幅 (建议尺寸: 960x100 ~ 960x150)
                    banner: "",

                    // 左侧装饰 (建议宽度: 80~120px, 高度自适应)
                    leftSide: "",

                    // 右侧装饰 (建议宽度: 80~120px, 高度自适应)
                    rightSide: "",
                },
            }
        },
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(160deg, #f7f4ef 0%, #eef3ec 50%, #e8efe8 100%);
        min-height: 100vh;
        color: #3a4a3c;
        -webkit-font-smoothing: antialiased;
    }

    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow-x: hidden;
    }

    /* === Header === */
    .app-header {
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(12px);
        background: rgba(255, 254, 250, 0.92);
        border-bottom: 1px solid rgba(91, 140, 110, 0.1);
        padding-top: 18px;
    }

    .cat-ear {
        position: absolute;
        top: -14px;
        width: 0;
        height: 0;
        border-left: 16px solid transparent;
        border-right: 16px solid transparent;
        border-bottom: 20px solid rgba(255, 254, 250, 0.95);
        z-index: 101;
    }

    .cat-ear::after {
        content: '';
        position: absolute;
        top: 6px;
        left: -8px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 12px solid rgba(91, 140, 110, 0.15);
    }

    .cat-ear-left {
        left: 24px;
    }

    .cat-ear-right {
        left: 72px;
    }

    .header-content {
        max-width: 960px;
        margin: 0 auto;
        padding: 12px 24px;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 8px;
        position: relative;
    }

    /* Header peeking cat */
    .header-cat {
        position: absolute;
        right: 100px;
        bottom: -22px;
        z-index: 102;
        animation: catPeek 4s ease-in-out infinite;
        transition: transform 0.3s;
    }

    .header-cat:hover {
        transform: translateY(4px) scale(1.1);
    }

    @keyframes catPeek {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(3px); }
    }

    /* Fixed sleeping cat bottom-right */
    .sleeping-cat {
        position: fixed;
        bottom: 12px;
        right: 12px;
        z-index: 4;
        pointer-events: none;
        animation: catBreath 3s ease-in-out infinite;
    }

    @keyframes catBreath {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
    }

    /* === Logo === */
    .logo {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        margin-right: auto;
    }

    .logo-icon {
        display: inline-flex;
        align-items: center;
    }

    .logo-text {
        font-size: 20px;
        font-weight: 600;
        color: #3a4a3c;
        letter-spacing: 0.5px;
    }

    /* === Main === */
    .app-main {
        flex: 1;
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
        padding: 16px 24px 40px;
        position: relative;
        z-index: 1;
    }

    /* === Footer === */
    .app-footer {
        background: rgba(255, 254, 250, 0.7);
        backdrop-filter: blur(8px);
        border-top: 1px solid rgba(91, 140, 110, 0.08);
        padding: 16px 24px;
        text-align: center;
        position: relative;
        z-index: 1;
    }

    .footer-content {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }

    .footer-text {
        font-size: 13px;
        color: #8a9b8a;
        letter-spacing: 0.3px;
    }

    /* ========================================
       Dynamic Image Slots
       ======================================== */

    /* Header Banner Slot */
    .slot-banner {
        max-width: 960px;
        margin: 0 auto;
        padding: 0 24px 8px;
    }

    .slot-banner-img {
        width: 100%;
        max-height: 140px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
    }

    /* Left / Right Side Slots */
    .slot-side {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        z-index: 5;
        pointer-events: none;
    }

    .slot-left {
        left: 8px;
    }

    .slot-right {
        right: 8px;
    }

    .slot-side-img {
        max-width: 110px;
        max-height: 260px;
        object-fit: contain;
        opacity: 0.7;
        border-radius: 10px;
    }

    /* === Global Element Plus Overrides === */
    .el-button {
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s ease;
    }

    .el-button:hover {
        transform: translateY(-1px);
    }

    .el-button--primary {
        background: #5B8C6E;
        border: none;
        box-shadow: 0 2px 8px rgba(91, 140, 110, 0.2);
    }

    .el-button--primary:hover {
        background: #4d7a5f;
        box-shadow: 0 4px 12px rgba(91, 140, 110, 0.3);
    }

    .el-card {
        border-radius: 12px;
        border: 1px solid rgba(91, 140, 110, 0.1);
        box-shadow: 0 2px 12px rgba(91, 140, 110, 0.06);
    }

    .el-dialog {
        border-radius: 12px;
        overflow: hidden;
    }

    .el-table {
        border-radius: 10px;
        overflow: hidden;
    }

    .el-table th.el-table__cell {
        background: #f0f5ee;
        color: #5c6e5e;
        font-weight: 500;
        font-size: 13px;
        border-bottom: 1px solid rgba(91, 140, 110, 0.1);
    }

    .el-table td.el-table__cell {
        border-bottom: 1px solid rgba(91, 140, 110, 0.06);
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
        background: rgba(91, 140, 110, 0.04);
    }

    .el-input__wrapper {
        border-radius: 8px;
        transition: box-shadow 0.2s;
    }

    .el-input__wrapper:focus-within {
        box-shadow: 0 0 0 2px rgba(91, 140, 110, 0.15);
    }

    .el-breadcrumb {
        font-size: 13px;
    }

    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
        font-weight: 400;
        color: #5c6e5e;
        transition: color 0.2s;
    }

    .el-breadcrumb__inner a:hover,
    .el-breadcrumb__inner.is-link:hover {
        color: #5B8C6E;
    }

    .el-pagination .el-pager li {
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
    }

    .el-pagination .el-pager li.is-active {
        background: #5B8C6E;
        color: #fff;
    }

    .el-progress-bar__outer {
        border-radius: 8px;
        background: rgba(91, 140, 110, 0.08);
    }

    .el-progress-bar__inner {
        border-radius: 8px;
        background: #5B8C6E;
    }

    .el-message-box {
        border-radius: 12px;
    }

    .el-dialog__header {
        background: rgba(91, 140, 110, 0.04);
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .app-header {
            padding-top: 0;
        }

        .cat-ear {
            display: none;
        }

        .header-cat {
            display: none;
        }

        .sleeping-cat {
            display: none;
        }

        .header-content {
            padding: 10px 12px;
        }

        .logo-text {
            font-size: 17px;
        }

        .app-main {
            padding: 10px 10px 32px;
        }

        .app-footer {
            padding: 12px 12px;
        }

        .footer-content {
            gap: 6px;
        }

        .footer-text {
            font-size: 11px;
        }

        /* Slots mobile */
        .slot-banner {
            padding: 0 10px 6px;
        }

        .slot-banner-img {
            max-height: 80px;
        }

        .slot-side {
            display: none;
        }

        /* Global dialog mobile */
        .el-dialog {
            width: 94vw !important;
            margin: 4vh auto !important;
            border-radius: 10px !important;
        }

        .el-dialog__header {
            padding: 12px 16px !important;
        }

        .el-dialog__body {
            padding: 14px !important;
        }

        /* Global table mobile */
        .el-table th.el-table__cell,
        .el-table td.el-table__cell {
            font-size: 12px;
            padding: 6px 0;
        }

        /* Message box */
        .el-message-box {
            width: 88vw !important;
        }

        /* Overlay */
        .el-overlay {
            overflow-y: auto;
        }
    }

    @media (max-width: 480px) {
        .app-main {
            padding: 6px 6px 24px;
        }

        .header-content {
            padding: 8px 8px;
        }

        .footer-content {
            flex-wrap: wrap;
        }

        .slot-banner {
            padding: 0 6px 4px;
        }

        .slot-banner-img {
            max-height: 60px;
            border-radius: 6px;
        }

        .el-dialog {
            width: 96vw !important;
            margin: 2vh auto !important;
        }
    }

    /* Side slots only visible when screen is wide enough */
    @media (max-width: 1200px) {
        .slot-side-img {
            max-width: 70px;
            max-height: 180px;
        }
        .slot-left {
            left: 4px;
        }
        .slot-right {
            right: 4px;
        }
    }
</style>
