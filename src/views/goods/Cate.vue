<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 内容展示区域 -->
      <zk-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text="#"
        :border="true"
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isOk="scope">
          <i class="el-icon-success" v-show="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" v-show="scope.row.cat_deleted" style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateInfo(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </zk-table>
      <!-- 底部分页区域 -->
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
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" :rules="rules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            :clearable="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="40%">
      <!-- 内容 -->
      <el-form :model="editForm" :rules="editRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="editCateName">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'cate',
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 父级分类数据列表
      parentCateList: [],
      // 请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类总数
      total: 0,
      // 表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 定义当前列为模板列
          type: 'template',
          // 模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 定义当前列为模板列
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 定义当前列为模板列
          type: 'template',
          // 模板名称
          template: 'opt'
        }
      ],
      // 添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 添加分类数据
      addCateForm: {
        cat_name: '',
        // 分类父id
        cat_pid: 0,
        // 分类层级，默认为一级分类
        cat_level: 0
      },
      // 修改分类名称
      editForm: {
        cat_name: ''
      },
      rules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 级联选择器中选择的父级id集合
      selectedKeys: [],
      // 级联选择器的配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 父子选项不相互关联,可以选择非叶子选项
        checkStrictly: true
      },
      // 存储正在编辑的分类id
      currentEditId: 0
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await request({
        url: 'categories',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 监听 添加分类 按钮, 展示添加分类对话框
    showAddCateDialog() {
      // 获取父级分类
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await request({
        url: 'categories',
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    // 监听 选择父级分类 改变
    parentCateChange() {
      console.log(this.selectedKeys)
      const length = this.selectedKeys.length
      if (length === 0) {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      } else {
        this.addCateForm.cat_pid = this.selectedKeys[length - 1]
        this.addCateForm.cat_level = length
      }
    },
    // 监听 添加分类对话框确定按钮, 添加分类
    addCate() {
      // 预校验
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: 'categories',
          method: 'post',
          data: this.addCateForm
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听 添加分类对话框关闭, 重置表单数据
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 监听 编辑按钮, 展示编辑分类对话框
    async showEditCateDialog(id) {
      // 存储正在编辑的分类id
      this.currentEditId = id
      const { data: res } = await request({ url: `categories/${id}` })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.editForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    // 监听 添加分类对话框确认按钮
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: `categories/${this.currentEditId}`,
          method: 'put',
          data: this.editForm
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 监听 删除分类按钮
    removeCateInfo(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async res => {
          const { data: info } = await request({
            url: `categories/${id}`,
            method: 'delete'
          })
          if (info.meta.status !== 200) {
            return this.$message.error('删除分类失败')
          }
          this.$message.success('删除分类成功')
          this.getCateList()
        })
        .catch(() => {
          this.$message.error('已取消删除')
        })
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
