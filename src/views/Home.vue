<template>
  <div>
    首页
    <br />
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  methods: {
    logout() {
      // 清除token
      // sessionStorage.clear()
      sessionStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
