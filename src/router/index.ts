import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/hall', name: 'hall', component: () => import('@/views/HomeView.vue') },
    { path: '/detail/:id', name: 'detail', component: () => import('@/views/DetailView.vue') },
    { path: '/publish', name: 'publish', component: () => import('@/views/PublishView.vue') },
    { path: '/user', name: 'user', component: () => import('@/views/UserView.vue') },
    { path: '/faq', name: 'faq', component: () => import('@/views/FaqView.vue') }
  ]
});

export default router;