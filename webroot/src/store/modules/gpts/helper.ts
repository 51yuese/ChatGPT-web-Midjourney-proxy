import {ss} from '@/utils/storage'

const LOCAL_NAME = 'gptsStorage'

export function defaultState(): Gpts.ChatState {
	return {
		siderCollapsed: false,
		showGptsStore: false,
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
		collectApps: []
	}
}

export function getLocalState(): Gpts.ChatState {
	const localState = ss.get(LOCAL_NAME)
	return {...defaultState(), ...localState}
}

export function setLocalState({active}: Gpts.ChatState) {
	ss.set(LOCAL_NAME, {...ss.get(LOCAL_NAME), active})
}
