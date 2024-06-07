import {ElMessage} from 'element-plus'
import useRouteStore from './route'
import useMenuStore from './menu'
import apiUser from '@/api/modules/user'
import apiAccess from '@/api/modules/access'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {

    const routeStore = useRouteStore()
    const menuStore = useMenuStore()

    const userRole = ref("")
    const username = ref(localStorage.username ?? '')
    const token = ref(localStorage.token ?? '')
    const failure_time = ref(localStorage.failure_time ?? '')

    const permissions = ref<string[]>([])
    const isLogin = computed(() => {
      return token.value
    })

    // 登录
    async function login(data: {
      username: string
      password: string
    }) {
      // 通过 mock 进行登录
      const res = await apiUser.login(data)
      // localStorage.setItem('username', res.data.username)
      localStorage.setItem('token', res.data)
      // localStorage.setItem('failure_time', res.data.failure_time)
      // username.value = res.data.username
      token.value = res.data
      await getInfo()
      // failure_time.value = res.data.failure_time
    }
    // 登出
    async function logout() {
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      localStorage.removeItem('failure_time')
      username.value = ''
      token.value = ''
      failure_time.value = ''
      routeStore.removeRoutes()
      menuStore.setActived(0)
    }

    async function getInfo() {
      const res = await apiUser.getInfo()
      const { userInfo } = res.data
      localStorage.setItem('username', userInfo.username)
      const { role } = userInfo
      username.value = userInfo.username
      userRole.value = role;
      if (!['admin', 'super', 'manager'].includes(role)) {
        ElMessage.error('您没有权限访问该系统!!!')
        await logout()
      }
    }

    // 获取我的权限
    async function getPermissions() {
      // 通过 mock 获取权限
      const res = await apiUser.permission()

      const { userInfo } = res.data

        const { username: name, id, role } = userInfo
        localStorage.setItem('username', name)
        username.value = name
        userRole.value = role;
        if (!['super', 'admin'].includes(role)) {
            permissions.value = await apiAccess.getAccess({id: id}).then(res => res.data.accessLabel)
        }

        return permissions.value
    }
    // 修改密码
    async function editPassword(data: {
      password: string
      newpassword: string
    }) {
      await apiUser.updatePassword(data)
    }

    return {
      userRole,
      username,
      token,
      permissions,
      isLogin,
      login,
      logout,
      getInfo,
      getPermissions,
      editPassword,
    }
  },
)

export default useUserStore
