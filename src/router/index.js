import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]
const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  if (to.path !== '/login' && !token) next({ path: '/login' })
  else next()
})

export default router
