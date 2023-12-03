import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'

export function defaultState(): Chat.ChatState {
  return {
    active: 0,
    usingContext: true,
    usingNetwork: false,
    groupList: [],
    chatList: [],
    groupKeyWord: '',
		baseConfig: null,
		activeModelName: ""
  }
}

export function getLocalState(): Chat.ChatState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState({ active }: Chat.ChatState) {
  ss.set(LOCAL_NAME, { ...ss.get(LOCAL_NAME), active })
}
