<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="gotoAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 内容展示区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="150px">
          <template v-slot="scope">{{scope.row.add_time | showTime}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoods(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'goodsList',
  data() {
    return {
      // 请求商品数据参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 请求商品列表数据
    async getGoodsList() {
      const { data: res } = await request({
        url: 'goods',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      // console.log(this.goodsList)
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 监听 删除按钮，根据id删除商品
    removeGoods(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async res => {
        const { data: info } = await request({
          url: `goods/${id}`,
          method: 'delete'
        })
        if (info.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getGoodsList()
      })
    },
    // 监听 添加商品按钮， 跳转到添加页面
    gotoAddPage() {
      this.$router.push('goods/add')
    }
  },
  filters: {
    // 过滤器，显示时间
    showTime(originVal) {
      // 转成毫秒
      const dt = new Date(originVal * 1000)
      const year = dt.getFullYear()
      const month = (dt.getMonth() + 1 + '').padStart(2, '0')
      const day = (dt.getDate() + '').padStart(2, '0')
      const h = (dt.getHours() + '').padStart(2, '0')
      const m = (dt.getMinutes() + '').padStart(2, '0')
      const s = (dt.getSeconds() + '').padStart(2, '0')
      return `${year}-${month}-${day} ${h}:${m}:${s}`
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
