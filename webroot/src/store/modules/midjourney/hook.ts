import create from "zustand-vue";

export interface IMjStore {

    ins: MidJourney | null
    mapping: Record<MjMessage['id'], MjMessage>

    varyRegionInfo: {
        varyRegionImgBase64: string
        varyRegionCustomId: string
        varyRegionPrompt: string
    }
    remixSubmitInfo: {
        id: string
        custom_id: string
        components: MjOriginMessage['components']
    }
    openVaryRegion: boolean
    openRemixModal: boolean
    init: (opt: MidJourneyOptions) => Promise<void>
    updateMapping: (
        updater: (mapping: Record<MjMessage['id'], MjMessage>) => void
    ) => void
    setOpenVaryRegion: (openVaryRegion: boolean) => void
    setOpenRemixModal: (openRemixModal: boolean) => void
    handleMsg: (
        type: MjMsgType,
        msg: MjMessage,
        cb?: (type: MjMsgType) => void
    ) => void
}

export const useMjStore = create<IMjStore>((set, get) => ({
    ins: null,
    mapping: {},
    varyRegionInfo: {
        varyRegionImgBase64: '',
        varyRegionCustomId: '',
        varyRegionPrompt: '',
    },
    remixSubmitInfo: {
        id: '',
        custom_id: '',
        components: [],
    },
    openVaryRegion: false,
    openRemixModal: false,

    async init(opts) {
        return new MidJourney(opts).init().then(ins => set(() => ({ ins })))
    },
    setOpenVaryRegion(openVaryRegion) {
        set({ openVaryRegion })
    },
    setOpenRemixModal(openRemixModal) {
        set({ openRemixModal })
    },
    updateMapping(updater) {
        const mapping = get().mapping
        updater(mapping)
        set({ mapping })
    },


    handleMsg(type: string, msg: {
        nonce: any;
        id: string | number;
        parentId: string;
        originId: string;
        progress: number;
        varyRegionImgBase64: string;
        custom_id: string;
        varyRegionPrompt: string;
        components: string | any[]
    }, cb: (arg0: any) => void) {

        console.log('receive callback',msg);

        // console.log(
        //   `msgType: ${type}, eventId: ${msg.nonce}, msgId: ${msg.id}, parentId: ${msg.parentId}, originId: ${msg.originId}, progress: ${msg.progress}`,
        // )

        if (type === 'REQUEST_SUCCESS' || type === 'REQUEST_FAILED') {
            cb?.(type)
        }

        else if (type === 'MESSAGE_DELETE') {
            get().updateMapping((mapping) => {
                delete mapping[msg.id]
            })
        }
        else if (
            type === 'INTERACTION_IFRAME_MODAL_CREATE'
            && msg.varyRegionImgBase64
            && msg.custom_id
            && msg.varyRegionPrompt
        ) {
            set({
                openVaryRegion: true,
                varyRegionInfo: {
                    varyRegionCustomId: msg.custom_id,
                    varyRegionImgBase64: msg.varyRegionImgBase64,
                    varyRegionPrompt: msg.varyRegionPrompt,
                },
            })
        }
        else if (
            // INTERACTION_MODAL_CREATE
            type === 'INTERACTION_MODAL_CREATE'
            && msg.custom_id
            && msg.components?.length
        ) {


            console.log("INTERACTION_MODAL_CREATE 999999999");

            set({
                openRemixModal: true,
                remixSubmitInfo: {
                    id: msg.id,
                    components: msg.components,
                    custom_id: msg.custom_id,
                },
            })
        }
        else {
            get().updateMapping((mapping) => {
                mapping[msg.id] = msg
            })
        }
    },
}))


