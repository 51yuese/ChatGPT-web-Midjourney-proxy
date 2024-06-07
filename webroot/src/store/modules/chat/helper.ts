import {ss} from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'

export function defaultState(): Chat.ChatState {
    return {
        active: 0,
        canUpload: false,
        canAudio: false,
        usingContext: true,
        usingNetwork: false,
        groupList: [],
        chatList: [],
        groupKeyWord: '',
        baseConfig: null,
        activeModelName: "",
        activeChatTab: 'history', // 应用中心
    }
}

export function getLocalState(): Chat.ChatState {
    const localState = ss.get(LOCAL_NAME)
    return {...defaultState(), ...localState}
}

export function setLocalState({active}: Chat.ChatState) {
    ss.set(LOCAL_NAME, {...ss.get(LOCAL_NAME), active})
}
