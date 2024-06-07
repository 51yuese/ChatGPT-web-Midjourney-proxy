import {ss} from '@/utils/storage'

const LOCAL_NAME = 'mijournetyStorage'

export function defaultState()  {
	return {
		openRegionDialog: false,
		varyRegionInfo: {
			varyRegionImgBase64: '',
			varyRegionCustomId: '',
			varyRegionPrompt: '',
			taskId:'',
		},
	}
}

export function getLocalState() {
	const localState = ss.get(LOCAL_NAME)
	return {...defaultState(), ...localState}
}

export function setLocalState({active} ) {
	ss.set(LOCAL_NAME, {...ss.get(LOCAL_NAME), active})
}
