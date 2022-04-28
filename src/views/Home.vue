<template>
    <div class="about">
        <v-header/>
        <div class="content-box" :class="{ 'content-collapse': collapse }">
            <div class="content">
                <router-view v-slot="{ Component }">
                    <transition name="move" mode="out-in">
                        <keep-alive :include="tagsList">
                            <component :is="Component"/>
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </div>
    </div>
</template>
<script>
    import vHeader from "../components/Header.vue";

    export default {
        data(){
        },
        components: {
            vHeader,
        },
    };
</script>
