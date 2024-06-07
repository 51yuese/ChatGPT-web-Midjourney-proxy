import { useEventBus } from '@vueuse/core'

const modalRefreshBus = useEventBus('modal-refresh')

export { modalRefreshBus }

