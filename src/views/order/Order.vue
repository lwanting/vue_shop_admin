<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格展示订单列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" lebel="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag type="success" v-show="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-show="scope.row.pay_status === '0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showAddrDialog"></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addrDialogVisible" width="40%" @close="addrDialogClose">
      <!-- 表单信息 -->
      <el-form :model="addrForm" :rules="addrFormRules" ref="addrFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="addr">
          <!-- 级联选择器 -->
          <el-cascader v-model="addrForm.addr" :options="cityData" :props="cascaderProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddr">
          <el-input v-model="addrForm.detailAddr"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="40%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
import cityData from './citydata'
export default {
  name: 'order',
  data() {
    return {
      // 请求订单列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表数据
      orderList: [],
      // 订单总数
      total: 0,
      // 修改地址对话框的显示与隐藏
      addrDialogVisible: false,
      // 物流进度对话框的显示与隐藏
      progressDialogVisible: false,
      // 修改地址
      addrForm: {
        addr: [],
        detailAddr: ''
      },
      cityData,
      // 验证规则
      addrFormRules: {
        addr: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        detailAddr: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      // 物流进度信息
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList() {
      const { data: res } = await request({
        url: 'orders',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 监听 每页条数 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听 当前页数 改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 展示修改地址对话框
    showAddrDialog() {
      this.addrDialogVisible = true
    },
    // 监听 修改地址对话框 关闭, 清空表单
    addrDialogClose() {
      this.$refs.addrFormRef.resetFields()
    },
    // 展示物流进度对话框
    async showProgressDialog() {
      const { data: res } = await request({ url: '/kuaidi/1106975712662' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
