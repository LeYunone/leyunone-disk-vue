<template>
    <div class="app-container">
        <!-- Falling Stars Background -->
        <div class="falling-stars" aria-hidden="true">
            <div v-for="i in 12" :key="'star'+i" class="falling-star" :style="starStyle(i)"></div>
        </div>

        <header class="app-header">
            <div class="cat-ear cat-ear-left"></div>
            <div class="cat-ear cat-ear-right"></div>
            <div class="header-content">
                <div class="logo">
                    <span class="logo-star" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L14.09 8.26L20.18 8.63L15.54 12.64L17.12 19.37L12 15.77L6.88 19.37L8.46 12.64L3.82 8.63L9.91 8.26L12 2Z" fill="url(#starGrad)"/>
                            <defs><linearGradient id="starGrad" x1="3" y1="2" x2="21" y2="20"><stop stop-color="#ff6b9d"/><stop offset="1" stop-color="#c44dff"/></linearGradient></defs>
                        </svg>
                    </span>
                    <span class="logo-text">乐云一</span>
                    <span class="logo-sparkle" aria-hidden="true">✦</span>
                </div>
                <TopUploader/>
                <StickerSlot class="header-sticker" :size="64" color="#ff6b9d"/>
            </div>
        </header>

        <main class="app-main">
            <router-view :key="$route.fullPath"/>
        </main>

        <footer class="app-footer">
            <div class="footer-content">
                <StickerSlot :size="48" color="#ff6b9d"/>
                <span class="footer-text">Made with ♡ — 乐云一 Disk</span>
                <StickerSlot :size="48" color="#c44dff"/>
            </div>
        </footer>

        <!-- Right side fixed decoration -->
        <StickerSlot class="side-decoration" :size="56" position="fixed" color="#c44dff"/>
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
            return {}
        },
        methods: {
            starStyle(i) {
                const left = (i * 8.3) % 100;
                const delay = (i * 0.7) % 5;
                const duration = 6 + (i % 4);
                const size = 8 + (i % 6);
                return {
                    left: left + '%',
                    animationDelay: delay + 's',
                    animationDuration: duration + 's',
                    width: size + 'px',
                    height: size + 'px',
                    opacity: 0.15 + (i % 3) * 0.1
                };
            }
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Zen Maru Gothic', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #fef0f5 0%, #f0e6ff 50%, #e8f4fd 100%);
        min-height: 100vh;
        color: #4a3548;
        -webkit-font-smoothing: antialiased;
    }

    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow-x: hidden;
    }

    /* === Falling Stars === */
    .falling-stars {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }

    .falling-star {
        position: absolute;
        top: -20px;
        border-radius: 50%;
        background: radial-gradient(circle, #ffd700 0%, #ff6b9d 50%, transparent 70%);
        animation: starFall linear infinite;
    }

    @keyframes starFall {
        0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    /* === Header with Cat Ears === */
    .app-header {
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(12px);
        background: rgba(255, 255, 255, 0.88);
        border-bottom: 2px solid rgba(255, 107, 157, 0.15);
        padding-top: 18px;
    }

    .cat-ear {
        position: absolute;
        top: -14px;
        width: 0;
        height: 0;
        border-left: 16px solid transparent;
        border-right: 16px solid transparent;
        border-bottom: 20px solid rgba(255, 255, 255, 0.95);
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
        border-bottom: 12px solid rgba(255, 107, 157, 0.3);
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

    .header-sticker {
        position: absolute;
        right: 16px;
        top: 8px;
    }

    /* === Logo === */
    .logo {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        margin-right: auto;
    }

    .logo-text {
        font-size: 20px;
        font-weight: 700;
        background: linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 0.5px;
    }

    .logo-star {
        display: inline-flex;
        align-items: center;
        animation: twinkle 2s ease-in-out infinite;
    }

    .logo-sparkle {
        font-size: 10px;
        color: #ffd700;
        animation: twinkle 3s ease-in-out infinite 0.5s;
    }

    @keyframes twinkle {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
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
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(8px);
        border-top: 2px solid rgba(196, 77, 255, 0.1);
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
        color: #b07cc6;
        letter-spacing: 0.3px;
    }

    /* === Side Decoration === */
    .side-decoration {
        right: 24px;
        bottom: 120px;
    }

    /* === Global Element Plus Overrides === */
    .el-button {
        border-radius: 20px;
        font-family: 'Zen Maru Gothic', sans-serif;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .el-button:hover {
        transform: translateY(-1px);
    }

    .el-button--primary {
        background: linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%);
        border: none;
        box-shadow: 0 4px 15px rgba(196, 77, 255, 0.25);
    }

    .el-button--primary:hover {
        background: linear-gradient(135deg, #ff85b1 0%, #d470ff 100%);
        box-shadow: 0 6px 20px rgba(196, 77, 255, 0.35);
    }

    .el-card {
        border-radius: 20px;
        border: 2px dashed rgba(196, 77, 255, 0.15);
        box-shadow: 0 4px 20px rgba(196, 77, 255, 0.06);
    }

    .el-dialog {
        border-radius: 20px;
        overflow: hidden;
    }

    .el-table {
        border-radius: 16px;
        overflow: hidden;
    }

    .el-table th.el-table__cell {
        background: #fef0f5;
        color: #8c5c8a;
        font-weight: 500;
        font-size: 13px;
        border-bottom: 2px solid rgba(255, 107, 157, 0.1);
    }

    .el-table td.el-table__cell {
        border-bottom: 1px solid rgba(196, 77, 255, 0.06);
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
        background: rgba(255, 107, 157, 0.06);
    }

    .el-input__wrapper {
        border-radius: 20px;
        transition: box-shadow 0.3s;
    }

    .el-input__wrapper:focus-within {
        box-shadow: 0 0 0 3px rgba(196, 77, 255, 0.15);
    }

    .el-breadcrumb {
        font-size: 13px;
    }

    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
        font-weight: 400;
        color: #8c5c8a;
        transition: color 0.2s;
    }

    .el-breadcrumb__inner a:hover,
    .el-breadcrumb__inner.is-link:hover {
        color: #c44dff;
    }

    .el-pagination .el-pager li {
        border-radius: 12px;
        font-family: 'Zen Maru Gothic', sans-serif;
    }

    .el-pagination .el-pager li.is-active {
        background: linear-gradient(135deg, #ff6b9d, #c44dff);
        color: #fff;
    }

    .el-progress-bar__outer {
        border-radius: 10px;
        background: rgba(196, 77, 255, 0.08);
    }

    .el-progress-bar__inner {
        border-radius: 10px;
        background: linear-gradient(135deg, #ff6b9d, #c44dff);
    }

    .el-message-box {
        border-radius: 20px;
    }

    .el-dialog__header {
        background: linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(196, 77, 255, 0.08));
    }

    /* === Mobile Responsive === */
    @media (max-width: 768px) {
        .falling-stars {
            display: none;
        }

        .app-header {
            padding-top: 0;
        }

        .cat-ear {
            display: none;
        }

        .header-content {
            padding: 10px 12px;
        }

        .header-sticker {
            display: none;
        }

        .logo-text {
            font-size: 17px;
        }

        .app-main {
            padding: 10px 10px 32px;
        }

        .side-decoration {
            display: none;
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

        /* Global dialog mobile */
        .el-dialog {
            width: 94vw !important;
            margin: 4vh auto !important;
            border-radius: 14px !important;
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

        .el-dialog {
            width: 96vw !important;
            margin: 2vh auto !important;
        }
    }
</style>
