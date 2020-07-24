<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo_m.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏收起展开按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconfonts[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { request } from '../network/request'
export default {
  name: 'home',
  data () {
    return {
      menuList: [],
      iconfonts: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      // 清除token
      // sessionStorage.clear()
      sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    // 获取所有菜单
    getMenuList() {
      request({
        url: 'menus',
        methods: 'get'
      }).then(res => {
        // console.log(res)
        if (res.data.meta.status === 200) {
          this.menuList = res.data.data
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  background-color: #373d41;
  font-size: 20px;
  color: #fff;

  > div {
    display: flex;
    align-items: center;

    img {
      width: 50px;
      height: 50px;
    }

    span {
      padding-left: 5px;
    }
  }
}
.el-aside {
  background-color: #333744;

  .toggle-button {
    height: 20px;
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 20px;
    letter-spacing: .2em;
    cursor: pointer;
  }

  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
</style>
