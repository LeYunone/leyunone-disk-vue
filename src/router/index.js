import {createRouter, createWebHashHistory} from "vue-router";
import Home from "../views/Home.vue";

const routes = [
    {
        path: '/',
        redirect: '/disk'
    }, {
        path: "/",
        name: "Home",
        component: Home,
        children: [
            {
                path: "/disk",
                name: "disk",
                meta: {
                    title: '主站首页'
                },
                component: () => import ("../views/Disk.vue")
            },
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});
export default router;
