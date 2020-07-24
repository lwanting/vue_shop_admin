<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', 'vcenter']"
              v-for="item1 in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeTag(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2===0 ? '':'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeTag(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 嵌套渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeTag(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleInfo(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 对话框内容区域 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 对话框内容区域 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialog" width="30%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'roles',
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 编辑角色对话框的显示和隐藏
      editDialogVisible: false,
      // 分配权限对话框的显示和隐藏
      setRightDialog: false,
      // 新增角色信息
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 要编辑的角色信息
      editForm: {},
      // 表单验证规则
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 权限数据
      rightsList: [],
      // 绑定树形控件属性
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的三级权限id
      defKeys: [],
      // 记录正在分配权限的角色id
      roleID: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 请求角色列表数据
    async getRolesList() {
      const { data: res } = await request({ url: 'roles' })
      if (res.meta.status === 200) {
        this.rolesList = res.data
      } else {
        this.$message.error('获取角色列表失败')
      }
    },
    // 添加角色预校验
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: 'roles',
          method: 'post',
          data: this.addForm
        })
        if (res.meta.status === 201) {
          this.getRolesList()
          this.addDialogVisible = false
          this.$message.success('添加角色成功')
        } else {
          this.$message.error('添加角色失败')
        }
      })
    },
    // 关闭添加角色对话框后清空对话框
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听 编辑角色 按钮，根据id查找
    async showEditDialog(id) {
      const { data: res } = await request({ url: `roles/${id}` })
      // console.log(res)
      if (res.meta.status === 200) {
        this.editForm = res.data
        this.editDialogVisible = true
      } else {
        this.$message.error('查询角色信息失败')
      }
    },
    // 修改角色信息预校验
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: `roles/${this.editForm.roleId}`,
          method: 'put',
          data: this.editForm
        })
        // console.log(res)
        if (res.meta.status === 200) {
          this.getRolesList()
          this.editDialogVisible = false
          this.$message.success('修改角色信息成功')
        } else {
          this.$message.error('修改角色信息失败')
        }
      })
    },
    // 关闭编辑角色对话框后 清空对话框
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 监听 删除角色 按钮, 按id删除
    removeRoleInfo(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          const { data: info } = await request({
            url: `roles/${id}`,
            method: 'delete'
          })
          if (info.meta.status === 200) {
            this.getRolesList()
            this.$message.success('删除角色成功')
          } else {
            this.$message.error('删除用户失败')
          }
        })
        .catch(() => {
          this.$message.error('已取消删除')
        })
    },
    // 关闭标签移除该权限
    removeTag(role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async res => {
        const { data: info } = await request({
          url: `roles/${role.id}/rights/${rightId}`,
          method: 'delete'
        })
        if (info.meta.status === 200) {
          role.children = info.data
        } else {
          this.$message.error('已取消删除')
        }
      })
    },
    // 展示 分配权限 对话框
    async showSetRightDialog(role) {
      this.roleID = role.id
      // 获取权限数据
      const { data: res } = await request({ url: 'rights/tree' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightsList = res.data
      this.getLeafRights(role, this.defKeys)
      // console.log(this.defKeys)
      this.setRightDialog = true
    },
    // 通过递归的方式获取角色的三级权限
    getLeafRights(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafRights(item, arr)
      })
    },
    // 监听 分配权限对话框 关闭 清空存储当前角色三级权限的列表
    setRightDialogClose() {
      this.defKeys = []
    },
    // 监听 分配权限对话框确认按钮 为当前角色分配权限
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await request({
        url: `roles/${this.roleID}/rights`,
        method: 'post',
        data: {
          rids: idStr
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.setRightDialog = false
      this.$message.success('分配权限成功')
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-table__expanded-cell .el-row:nth-child(1) {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
