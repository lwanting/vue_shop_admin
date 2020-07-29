<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="echarts" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 引入echarts
import echarts from 'echarts'
import { request } from '../../network/request'
export default {
  name: 'report',
  data () {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  // 页面上的元素渲染完后执行的钩子
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.querySelector('#echarts'))
    // 指定图表的配置项和数据
    const { data: res } = await request({ url: 'reports/type/1' })
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }
    const result = Object.assign(this.options, res.data)
    result.xAxis[0].boundaryGap = false
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>

<style lang="less" scoped>
</style>
