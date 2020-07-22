import axios from 'axios'

// 封裝axios
export function request(config) {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/'
  })
  // 拦截器 在请求头中增加token
  instance.interceptors.request.use(config => {
    config.headers.Authorization = sessionStorage.getItem('token')
    return config
  })
  return instance(config)
}
