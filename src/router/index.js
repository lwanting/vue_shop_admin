import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const Welcome = () => import('../views/Welcome.vue')
const Users = () => import('../views/user/Users.vue')
const Rights = () => import('../views/authority/Rights.vue')
const Roles = () => import('../views/authority/Roles.vue')
const Cate = () => import('../views/goods/Cate.vue')
const Params = () => import('../views/goods/Params.vue')
const GoodsList = () => import('../views/goods/GoodsList.vue')
const Add = () => import('../views/goods/Add.vue')

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
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: Add
      }
    ]
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
