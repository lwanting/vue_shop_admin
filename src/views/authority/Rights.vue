<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表区域 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'rights',
  data() {
    return {
      // 权限列表数据
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 请求权限列表数据
    async getRightsList() {
      const { data: res } = await request({
        url: 'rights/list'
      })
      if (res.meta.status === 200) {
        this.rightsList = res.data
        // console.log(this.rightsList)
      } else {
        this.$message.error('获取权限列表失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
