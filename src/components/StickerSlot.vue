<template>
    <div
        class="sticker-slot"
        :class="[position === 'fixed' ? 'sticker-fixed' : 'sticker-inline']"
        :style="containerStyle"
    >
        <img
            v-if="src"
            :src="src"
            class="sticker-img"
            :style="{ width: size + 'px', height: size + 'px' }"
            alt="sticker"
        />
        <svg
            v-else
            :width="size"
            :height="size"
            viewBox="0 0 100 100"
            class="sticker-default"
        >
            <!-- Cat Paw SVG -->
            <ellipse cx="50" cy="62" rx="24" ry="22" :fill="color" opacity="0.9"/>
            <circle cx="32" cy="38" r="12" :fill="color" opacity="0.85"/>
            <circle cx="50" cy="30" r="12" :fill="color" opacity="0.85"/>
            <circle cx="68" cy="38" r="12" :fill="color" opacity="0.85"/>
            <!-- Paw pads -->
            <ellipse cx="40" cy="62" rx="8" ry="7" fill="rgba(255,255,255,0.5)"/>
            <ellipse cx="60" cy="62" rx="8" ry="7" fill="rgba(255,255,255,0.5)"/>
            <ellipse cx="50" cy="74" rx="10" ry="7" fill="rgba(255,255,255,0.5)"/>
            <!-- Sparkle -->
            <path d="M82 18 L84 12 L86 18 L92 20 L86 22 L84 28 L82 22 L76 20 Z" fill="#ffd700" opacity="0.8"/>
            <path d="M20 14 L21 10 L22 14 L26 15 L22 16 L21 20 L20 16 L16 15 Z" fill="#ff6b9d" opacity="0.7"/>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'StickerSlot',
    props: {
        src: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 80
        },
        position: {
            type: String,
            default: 'inline',
            validator: (v) => ['inline', 'fixed'].includes(v)
        },
        color: {
            type: String,
            default: '#c44dff'
        }
    },
    computed: {
        containerStyle() {
            if (this.position === 'fixed') {
                return {
                    width: this.size + 'px',
                    height: this.size + 'px'
                };
            }
            return {
                display: 'inline-block',
                width: this.size + 'px',
                height: this.size + 'px'
            };
        }
    }
}
</script>

<style scoped>
.sticker-slot {
    pointer-events: none;
    z-index: 10;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sticker-slot:hover {
    transform: scale(1.1) rotate(-3deg);
}

.sticker-inline {
    display: inline-block;
    vertical-align: middle;
}

.sticker-fixed {
    position: fixed;
    pointer-events: none;
}

.sticker-img {
    object-fit: contain;
    border-radius: 12px;
}

.sticker-default {
    filter: drop-shadow(0 2px 8px rgba(196, 77, 255, 0.2));
}
</style>
