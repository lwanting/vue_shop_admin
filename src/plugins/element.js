import Vue from 'vue'
import { Button, Message, Form, FormItem, Input } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 挂载到原型上
Vue.prototype.$message = Message
