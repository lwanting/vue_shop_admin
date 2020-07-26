<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon closable></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页区域 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数展示表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(index, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性展示表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
             <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(index, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加属性/参数对话框 -->
      <el-dialog
        :title="'添加' + dialogTitle"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClose"
      >
        <!-- 表单 -->
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑属性/参数对话框 -->
      <el-dialog
        :title="'编辑' + dialogTitle"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClose"
      >
        <!-- 表单 -->
        <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'params',
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 级联选择器中选择的id集合
      selectedKeys: [],
      // 级联选择器配置选项
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 激活的标签页
      activeTab: 'many',
      // 所选择的分类id
      cateId: 0,
      // 当前编辑的属性id
      editId: 0,
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 添加对话框的显示于隐藏
      addDialogVisible: false,
      // 编辑对话框的显示于隐藏
      editDialogVisible: false,
      // 添加参数
      addForm: {
        attr_name: ''
      },
      // 编辑参数
      editForm: {
        attr_name: ''
      },
      addRules: {
        attr_name: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类数据
    async getCateList() {
      const { data: res } = await request({ url: 'categories' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选择分类变化
    cateChange() {
      this.getParamsData()
    },
    // 标签页处理函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取分类参数
    async getParamsData() {
      // 只能选择三级分类，且不展示非三级分类的参数信息
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.cateId = this.selectedKeys[2]
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes`,
        params: {
          sel: this.activeTab
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      // 处理参数的值
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 文本输入框的显示与隐藏
        item.inputVisible = false
        // 文本输入框中的值
        item.inputValue = ''
      })
      if (this.activeTab === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      // console.log(res)
      // console.log(this.manyTableData)
    },
    // 监听 添加对话框 关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听 添加对话框确认按钮, 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes`,
          method: 'post',
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeTab
          }
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      this.editId = id
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes/${id}`,
        params: {
          attr_sel: this.activeTab
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }
      // console.log(res.data.attr_name)
      this.editForm.attr_name = res.data.attr_name
      this.editDialogVisible = true
    },
    // 监听 编辑对话框 关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 监听 编辑对话框确认按钮, 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes/${this.editId}`,
          method: 'put',
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeTab
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 根据id删除参数
    removeParam(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          const { data: info } = await request({
            url: `categories/${this.cateId}/attributes/${id}`,
            method: 'delete'
          })
          if (info.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.$message.success('删除成功')
          this.getParamsData()
        })
        .catch(() => {
          this.$message('已取消删除')
        })
    },
    // 标签切换为文本框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获得焦点
      // $nextTick方法的作用：当页面上的元素重新被渲染后，才会调用回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInputRef.$refs.input.focus()
      })
    },
    // 标签文本框中按下enter和失去焦点 处理函数
    async handleInputConfirm(row) {
      // 没有输入数据，重置文本框
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 添加参数
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发送请求
      this.saveAttrValue(row)
    },
    // 将对 attr_vals 的操作存储到数据库中
    async saveAttrValue(row) {
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'put',
        data: {
          attr_name: row.attr_name,
          attr_sel: this.activeTab,
          attr_vals: row.attr_vals.join(' ')
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 移除参数
    handleTagClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValue(row)
    }
  },
  computed: {
    // 决定添加参数与添加属性按钮是否禁用
    idBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 对话框标题
    dialogTitle() {
      if (this.activeTab === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 150px;
}
</style>
