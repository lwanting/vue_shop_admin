<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" :stripe="true" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserInfo(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 对话框模块 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 对话框内容区域 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户 对话框模块 -->
    <el-dialog
      title="编辑用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框  -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
      <!-- 分配角色对话框内容 -->
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 分配角色对话框底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'users',
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+\.?\w+@\w+\.\w+$/
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    var checkPhone = (rule, value, callback) => {
      const regPhone = /^(13[0-9]|15[0-9]|17[0-9]|18[0-9])[0-9]{8}$/
      if (regPhone.test(value)) {
        callback()
      } else {
        callback(new Error('请输入合法的手机号码'))
      }
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 新增用户信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 分配角色对话框的显示和隐藏
      setRoleDialogVisible: false,
      // 要修改的用户信息
      editForm: {},
      // 记录当前被分配角色的用户信息
      userInfo: {},
      // 存储全部角色数据
      rolesList: [],
      // 分配的角色Id
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await request({
        url: 'users',
        method: 'get',
        params: this.queryInfo
      })
      // console.log(res)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 用户状态开关 改变
    async userStateChanged(stateInfo) {
      // console.log(stateInfo)
      const { data: res } = await request({
        url: `users/${stateInfo.id}/state/${stateInfo.mg_state}`,
        method: 'put'
      })
      if (res.meta.status === 200) {
        this.$message.success('更新用户状态成功')
      } else {
        this.$message.error('更新用户状态失败')
        stateInfo.mg_state = !stateInfo.mg_state
      }
    },
    // 监听 添加用户对话框 关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 确认添加用户预校验
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 发起添加请求
        const { data: res } = await request({
          url: 'users',
          method: 'post',
          data: this.addForm
        })
        // console.log(res)
        if (res.meta.status === 201) {
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        } else {
          this.$message.error('添加用户失败')
        }
      })
    },
    // 监听 修改用户信息 按钮 ,根据id查找信息
    async showEditDialog(id) {
      const { data: res } = await request({
        url: `users/${id}`
      })
      console.log(res)
      if (res.meta.status === 200) {
        this.editForm = res.data
        this.editDialogVisible = true
      } else {
        this.$message.error('查询用户信息失败')
      }
    },
    // 关闭后清空修改用户信息对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 确认修改用户信息预校验
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await request({
            url: `users/${this.editForm.id}`,
            method: 'put',
            data: this.editForm
          })
          console.log(res)
          if (res.meta.status === 200) {
            this.getUserList()
            this.editDialogVisible = false
            this.$message.success('修改用户信息成功')
          } else {
            this.$message.error('修改用户信息失败')
          }
        }
      })
    },
    // 监听 删除用户信息 按钮 , 根据id删除
    removeUserInfo(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          // console.log(res)
          const { data: info } = await request({
            url: `users/${id + ''}`,
            method: 'delete'
          })
          if (info.meta.status === 200) {
            this.$message.success('删除用户成功')
            this.getUserList()
          } else {
            this.$message.error('删除用户失败')
          }
        })
        .catch(() => {
          // console.log(err)
          this.$message.error('已取消删除')
        })
    },
    // 展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await request({ url: 'roles' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 监听 分配角色对话框 确认按钮
    async saveRoleInfo() {
      const { data: res } = await request({
        url: `users/${this.userInfo.id}/role`,
        method: 'put',
        data: { rid: this.selectRoleId }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听 分配角色对话框 关闭
    setRoleDialogClose() {
      this.userInfo = []
      this.selectRoleId = ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
