<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs :tab-position="'left'" v-model="activeStep" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量(kg)" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="cateChange"
                :clearable="true"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(box, index) in item.attr_vals"
                  :key="index"
                  :label="box"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="imgUploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewVisible" width="40%">
      <img :src="imgPreviewUrl" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'add',
  data() {
    return {
      // 激活的步骤
      activeStep: '0',
      // 添加商品表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类
        goods_cat: [],
        // 上传图片路径
        pics: [],
        // 商品描述
        goods_introduce: '',
        // 参数列表
        attrs: []
      },
      // 添加商品验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品所属分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传地址
      imgUploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片预览地址
      imgPreviewUrl: '',
      // 图片上传headers请求头
      headerObj: {
        Authorization: sessionStorage.getItem('token')
      },
      // 图片预览对话框的显示与隐藏
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表数据
    async getCateList() {
      const { data: res } = await request({ url: 'categories' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选择的分类发生改变
    cateChange() {
      // 只能选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 离开当前标签页前的钩子, 参数（去往的标签页name，离开的标签页name）
    beforeTabLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
      switch (activeName) {
        case '1':
          this.getPramsList('many')
          break
        case '2':
          this.getPramsList('only')
      }
    },
    // 获取静态/动态分类参数
    async getPramsList(sel) {
      const msg = sel === 'many' ? '动态参数' : '静态属性'
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes`,
        params: {
          sel
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(`获取商品${msg}失败`)
      }
      if (sel === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      // console.log(this.onlyTableData)
    },
    // 图片预览处理
    handlePreview(file) {
      // console.log(file)
      this.imgPreviewUrl = file.response.data.url
      this.previewVisible = true
    },
    // 图片移除处理
    handleRemove(file) {
      // 查找图片存储信息
      const fileInfo = file.response.data.tmp_path
      // 移除
      this.addForm.pics = this.addForm.pics.filter(item => {
        return item.pic !== fileInfo
      })
      console.log(this.addForm)
    },
    // 图片上传成功处理
    handleSuccess(response) {
      // 拼接为对象形式
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 添加
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单数据')
        }
        // 深拷贝
        const form = JSON.parse(JSON.stringify(this.addForm))
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals === [] ? '' : item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起添加商品请求
        const { data: res } = await request({
          url: 'goods',
          method: 'post',
          data: form
        })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
