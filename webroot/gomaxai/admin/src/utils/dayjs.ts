import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export default dayjs

export const formatTime = (time: string | number | Date | dayjs.Dayjs | null | undefined) => dayjs(time).format("YYYY-MM-DD HH:mm:ss")
