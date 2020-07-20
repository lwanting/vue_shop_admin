<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avator_box">
        <img src="../assets/logo.png" alt="登录头像" />
      </div>
      <!-- 登录区域 -->
      <el-form
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="0"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// 引入封裝的axios
import { request } from '../network/request'
export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(valid => {
        // console.log(valid)
        if (!valid) return
        // 发送请求
        request({
          url: 'login',
          method: 'post',
          params: this.loginForm
        })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status === 200) {
              // console.log('登录成功')
              this.$message.success('登录成功')
              sessionStorage.setItem('token', res.data.data.token)
              this.$router.push('/home')
            } else {
              // console.log('登录失败')
              this.$message.error('登录失败')
            }
          })
          .catch(err => {
            console.log(err)
          })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
}
.avator_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;

  img {
    width: 100%;
    height: 100%;
    background-color: #eee;
    border-radius: 50%;
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  .btns {
    float: right;
  }
}
</style>
