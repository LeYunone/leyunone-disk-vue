import {createRouter, createWebHashHistory} from "vue-router";
import Home from "../views/Home.vue";

const routes = [
    {
        path: '/',
        redirect: '/disk'
    }, {
        path: "/disk",
        name: "disk",
        redirect: "/disk/fileTable",
        meta: {
            title: '主站首页'
        },
        component: () => import ("../views/Disk.vue"),
        children: [
            {
                path:"fileTable",
                component: () => import ("../views/FileTable.vue"),
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});
export default router;
