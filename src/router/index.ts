import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('@/views/HomeView.vue') },
    { path: '/hall', component: () => import('@/views/HomeView.vue') },
    { path: '/detail/:id', component: () => import('@/views/DetailView.vue') },
    { path: '/publish', component: () => import('@/views/PublishView.vue') },
    { path: '/user', component: () => import('@/views/UserView.vue') },
    { path: '/faq', component: () => import('@/views/FaqView.vue') }
  ]
});

export default router;