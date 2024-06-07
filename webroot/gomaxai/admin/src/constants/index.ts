export const USER_STATUS_OPTIONS = [
    {value: 0, label: '待激活'},
    {value: 1, label: '正常'},
    {value: 2, label: '已封禁'},
    {value: 3, label: '黑名单'},
]

export const MANGER_OPTIONS = [
    {value: "super", label: '超级管理员'},
    {value: "admin", label: '内置管理员'},
    {value: "manager", label: '普通管理员'},
]

export const MANGER_OPTIONS_MAP = MANGER_OPTIONS.reduce(
    (pre: any, cur, index) => {
        pre[cur.value] = cur.label;
        return pre;
    }, {})

export const USER_STATUS_MAP = {
    0: '待激活',
    1: '正常',
    2: '已封禁',
    3: '黑名单',
}

export const USER_STATUS_TYPE_MAP = {
    0: 'info',
    1: 'success',
    2: 'danger',
    3: 'danger',
}

// 充值类型map 1: 注册赠送  2: 受邀请赠送  3: 邀请人赠送  4: 购买套餐赠送  5: 管理员赠送 6：扫码支付 7: 绘画失败退款 8: 签到奖励
export const RECHARGE_TYPE_MAP = {
    1: '注册赠送',
    2: '受邀请赠送',
    3: '邀请人赠送',
    4: '购买套餐赠送',
    5: '管理员赠送',
    6: '扫码支付',
    7: '绘画失败退款',
    8: '签到奖励',
}

// 充值数组
export const RECHARGE_TYPE_OPTIONS = [
    {value: 1, label: '注册赠送'},
    {value: 2, label: '受邀请赠送'},
    {value: 3, label: '邀请人赠送'},
    {value: 4, label: '购买套餐赠送'},
    {value: 5, label: '管理员赠送'},
    {value: 6, label: '扫码支付'},
    {value: 7, label: '绘画失败退款'},
    {value: 8, label: '签到奖励'},
]

export type UserStatus = keyof typeof USER_STATUS_TYPE_MAP


// 是否开启额外赠送
export const IS_OPTIONS = {
    0: '关闭',
    1: '开启',
}

// 是否开启额外赠送类型
export const IS_TYPE_MAP = {
    0: 'danger',
    1: 'success',
}

export const PACKAGE_TYPE_OPTIONS = [
    {value: 0, label: '禁用'},
    {value: 1, label: '启动'},
]

// 扣费形式 1： 按次数扣费 2：按Token扣费
export const DEDUCTION_TYPE_OPTIONS = [
    {value: 1, label: '按次数扣费'},
    {value: 2, label: '按Token扣费'},
]

// 扣费形式 map
export const DEDUCTION_TYPE_MAP = {
    1: '按次数扣费',
    2: '按Token扣费',
}

export const CRAMI_STATUS_OPTIONS = [
    {value: 0, label: '未使用'},
    {value: 1, label: '已使用'},
]

//  图片推荐状态0未推荐1已推荐
export const RECOMMEND_STATUS_OPTIONS = [
    {value: 0, label: '未推荐'},
    {value: 1, label: '已推荐'},
]

// 0 禁用  1 启用
export const ENABLE_STATUS_OPTIONS = [
    {value: 0, label: '禁用'},
    {value: 1, label: '启用'},
    {value: 3, label: '待审核'},
    {value: 4, label: '拒绝共享'},
    {value: 5, label: '通过共享'},
]

// 问题状态 0 未解决 1 已解决
export const QUESTION_STATUS_OPTIONS = [
    {value:  0, label: '未启用'},
    {value: 1, label: '已启用'},
]

// 问题状态 0 未解决 1 已解决
export const ORDER_STATUS_OPTIONS = [
    {value: 0, label: '待审核'},
    {value: 1, label: '已通过'},
    {value: -1, label: '已拒绝'},
]

//  0：未推荐   1：已推荐  数组
export const RECOMMEND_STATUS = [
    {value: 0, label: '未推荐'},
    {value: 1, label: '已推荐'},
]

// 提现渠道 支付宝 微信
export const WITHDRAW_CHANNEL_OPTIONS = [
    {value: 1, label: '支付宝'},
    {value: 2, label: '微信'},
]

// 1 排队中 2 处理中 3 已完成 4 失败 5 超时
export const WITHDRAW_STATUS_OPTIONS = [
    {value: 1, label: '正在排队'},
    {value: 2, label: '正在绘制'},
    {value: 3, label: '绘制完成'},
    {value: 4, label: '绘制失败'},
    {value: 5, label: '绘制超时'},
]

// 0 禁用 warning 1启用 状态 success
export const ENABLE_STATUS_TYPE_MAP: QuestionStatusMap = {
    0: 'danger',
    1: 'success',
    2: 'info',
}

interface QuestionStatusMap {
    [key: number]: string
}

// 问题状态 0 未解决 1 已解决 映射
export const QUESTION_STATUS_MAP: QuestionStatusMap = {
    '-1': '欠费锁定',
    '0': '未启用',
    '1': '已启用',
    '3': '待审核',
    '4': '拒绝共享',
    '5': '通过共享',
}

// 问题状态 0 被封号 1 正常 映射
export const KEY_STATUS_MAP: QuestionStatusMap = {
    0: '被封禁',
    1: '工作中',
}

// 问题状态 0 被封号 1 正常 映射
export const ACCESS_STATUS_OPTIONS = [
    {value: 0, label: '全部'},
    {value: 1, label: '启用'},
    {value: 2, label: '停用'},
]

// 问题状态 0 被封号 1 正常 映射
export const MJ_STATUS_OPTIONS = [
    {value: 1, label: 'Fast(快速)'},
    {value: 2, label: 'Relax(休闲)'},
    {value: 3, label: 'Turbo'},
]

// 问题状态 0 被封号 1 正常 映射
export const FEEDBACK_STATUS_OPTIONS = [
  {label: "Bug反馈", value: 'bug'},
  {label: "意见反馈", value: 'advice'},
  {label: "建议反馈", value: 'suggestion'}]

export const ACCESS_STATUS_MAP: QuestionStatusMap = ACCESS_STATUS_OPTIONS.reduce(
    (pre: any, cur, index) => {
        pre[cur.value] = cur.label;
        return pre;
    }, {})


export interface QuestionStatus {
    value: string | number;
    label: string
}


export interface KeyVal extends QuestionStatus {

}

// 账号类型 5$ 18$ 120$
export const ACCOUNT_TYPE_MAP: QuestionStatus[] = [
    {value: '5$', label: '5$'},
    {value: '18$', label: '18$'},
    {value: '120$', label: '120$'},
    {value: '其他', label: '其他'},
]

// 模型列表
export const MODEL_LIST = [
    'gpt-4-all',
    'gpt-4-dalle',
    'gpt-4-v',
    'gpt-4-1106-preview',
    'gpt-4-vision-preview',
    'gpt-4',
    'gpt-4-0613',
    'gpt-4-32k',
    'gpt-4-32k-0314',
    'gpt-4-32k-0613',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-instruct',
    'gpt-3.5-turbo-0613',
    'gpt-3.5-turbo-0301',
    'gpt-3.5-turbo-16k-0613',
    'gpt-3.5-turbo-16k',
    'text-davinci-003',
    'text-davinci-002',
    'code-davinci-002',
    'tts-1', // TTS is an AI model that converts text to natural sounding spoken text. Text-to-speech 1New The latest text to speech model, optimized for speed.
    'tts-1-1106',
    'tts-1-hd', // The latest text to speech model, optimized for quality.
    'tts-1-hd-1106',
    'dall-e-3',
    'dall-e-2',
    'babbage-002', // Replacement for the GPT-3 ada and babbage base models. MAX TOKENS 16,384 tokens	Up to Sep 2021
    'davinci-002', // Replacement for the GPT-3 curie and davinci base models. MAX TOKENS 16,384 tokens	Up to Sep 2021
    'babbage',
    'curie',
    'ada',
    'davinci',
    'text-embedding-ada-002', // Embeddings are a numerical representation of text that can be used to measure the relatedness between two pieces of text. Our second generation embedding model,
    'text-curie-001',
    'text-babbage-001',
    'text-ada-001', //
    'text-moderation-latest', // Most capable moderation model. Accuracy will be slightly higher than the stable model.
    'text-moderation-stable', // Almost as capable as the latest model, but slightly older.
    'whisper-1', // Whisper is a general-purpose speech recognition model.
    'mj-chat',
    'suno-v3',
    'gemini-pro',
    'gemini-pro-vision',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'stable-diffusion',
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k',
    'search-gpts',
    'Balanced',
]

// 模型列表 0 mj   1 Dall-e
export const DRAW_MODEL_LIST = [
    {value: 'mj', label: 'MidjourneyAi'},
    {value: 'DALL-E2', label: 'DALL-E2'},
]

// 支付状态列表  status 0：未支付、1：已支付、2、支付失败、3：支付超时
export const PAY_STATUS_OPTIONS = [
    {value: 0, label: '未支付'},
    {value: 1, label: '已支付'},
    {value: 2, label: '支付失败'},
    {value: 3, label: '支付超时'},
]

//  支付状态  status 0：未支付、1：已支付、2、支付失败、3：支付超时
export const PAY_STATUS_MAP: QuestionStatusMap = {
    0: '未支付',
    1: '已支付',
    2: '支付失败',
    3: '支付超时',
}

// 平台列表 epay: 易支付  hupi：虎皮椒
export const PAY_PLATFORM_LIST = [
    {value: 'epay', label: '易支付'},
    {value: 'hupi', label: '虎皮椒'},
    {value: 'mpay', label: '码支付'},
    {value: 'wechat', label: '微信支付'},
    {value: 'alipay', label: '支付宝支付'},
]

// 支付对应
export const PAY_PLATFORM_MAP = {
    epay: '易支付',
    hupi: '虎皮椒',
    mpay: '码支付',
    wechat: '微信支付',
    alipay: '支付宝支付',
}

//  绘画状态  1: 等待中 2: 绘制中 3: 绘制完成 4: 绘制失败 5: 绘制超时
export const DRAW_MJ_STATUS_LIST = [
    {value: 1, label: '等待中'},
    {value: 2, label: '绘制中'},
    {value: 3, label: '绘制完成'},
    {value: 4, label: '绘制失败'},
    {value: 5, label: '绘制超时'},
]

// App角色 系统 system  用户 user
export const APP_ROLE_LIST = [
    {value: 'system', label: '系统'},
    {value: 'user', label: '用户'},
]

// 绘画状态 1：排队中 2：绘制中 3：绘制完成 4：绘制失败 5：绘制超时
export const DRAW_STATUS_MAP = {
    1: '排队中',
    2: '绘制中',
    3: '绘制完成',
    4: '绘制失败',
    5: '绘制超时',
}

export const TYPEORIGINLIST = [
    {value: '百度云检测', label: '百度云检测'},
    {value: '自定义检测', label: '自定义检测'},
    {value: 'GoMaxAI检测', label: 'GoMaxAI检测'},
]


export const MODELTYPELIST = [
    {value: 1, label: '通用模型'},
    {value: 2, label: '百度 - [千帆大模型]'},
    {value: 3, label: '清华 - [智谱大模型]'},
    {value: 4, label: '讯飞 - [星火大模型]'},
]

export const MODELSMAP:{[key:number]: string} = {
    1: 'OPENAI',
    2: '百度文心',
    3: '清华智谱',
    4: '讯飞星火',
}

export const MODELSMAPLIST:{[key:number]: string[]} = {
    1: MODEL_LIST,
    2: [
        'ERNIE-Bot',
        'ERNIE-Bot-turbo',
        "ERNIE-Bot-4.0",
        'BLOOMZ-7B',
        'Llama-2-7b-chat',
        'Llama-2-13b-chat',
        // 'Llama-2-70b-chat',
        // 'ChatGLM2-6B-32K',
        'Qianfan-BLOOMZ-7B-compressed',
        'Qianfan-Chinese-Llama-2-7B',
        'AquilaChat-7B'
    ],
    3: [
        'chatglm_pro',
        'chatglm_std',
        'chatglm_lite',
        'chatglm_lite_32k'
    ],
    4: [
        '星火大模型V1.5',
        '星火大模型V2.0',
        '星火大模型V3.0',
    ],
}

/* 扣费类型  普通余额还是高级余额 */
export const DEDUCTTYPELIST = [
    {value: 1, label: '普通余额'},
    {value: 2, label: '高级余额'},
]

/* 不同模型在填入key字段的时候 key代表的含义不同 */
export const ModelTypeLabelMap:{[key: number]: string} = {
    1: 'APIKey',
    2: 'ClientId',
    3: 'AppKey',
    4: 'APIKey'
}


// 权限管理所有涉及到的菜单
export const MENU_LIST = [
    {
        name: "用户管理",
        value: "UserMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "用户数据列表", value: 'UserMenuList'},
            {label: "用户账户明细", value: 'AccountLogMenu'},
            {label: "用户注册设置", value: 'SystemMenuRegister'},
        ]
    },
    {
        name: "注册管理",
        value: "RegisterMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "用户数据列表", value: 'SystemMenuEmail'},
            {label: "用户账户明细", value: 'SystemMenuWechat'},
            {label: "用户注册设置", value: 'AliPhoneMenu'},
        ]
    },
    {
        name: "对话系统",
        value: "AiMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "对话模型配置", value: 'AiMenuInterface'},
            {label: "模型池设置", value: 'AiMenuModels'},
            {label: "头部预设", value: 'AiMenuModelPre'},
        ]
    },
    {
        name: "GPTS",
        value: "GptsMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "Gpts模型管理", value: 'GptsModelList'},
            {label: "Gpts模型组管理", value: 'GptsGrouplList'},
        ]
    },
    {
        name: "数据管理",
        value: "ChatMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "GPT对话管理", value: 'ChatMenuList'},
            {label: "Dall-E2绘画管理", value: 'DrawMenuList'},
            {label: "MJ绘画管理", value: 'MjMenuList'},
        ]
    },
    {
        name: "订单管理",
        value: "OrderMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "订单列表", value: 'OrderMenuList'},
        ]
    },
    {
        name: "套餐管理",
        value: "PackageMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "套餐设置", value: 'PackageMenuList'},
            {label: "卡密管理", value: 'CramiMenuList'},
        ]
    },
    {
        name: "应用管理",
        value: "AppMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "分类列表", value: 'AppMenuClassify'},
            {label: "应用列表", value: 'Application'},
        ]
    },
    {
        name: "分销系统",
        value: "SalesMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "基础分销配置", value: 'SalesBaseManage'},
            {label: "佣金账户列表", value: 'SalesUserManage'},
            {label: "佣金分销明细", value: 'SalesRecordManage'},
            {label: "提现工单管理", value: 'SalesOrderManage'},
        ]
    },
    {
        name: "支付管理",
        value: "SalesMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "官方支付", value: 'WechatConfig'},
            {label: "易支付", value: 'EpayConfig'},
            {label: "码支付", value: 'MpayConfig'},
            {label: "虎皮椒支付", value: 'HupioConfig'},
        ]
    },
    {
        name: "MJ绘画管理",
        value: "MjMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "绘图历史", value: 'MjDrawManage'},
            {label: "参数配置", value: 'MjManage'},
            {label: "更多设置", value: 'MjProxyManage'},
            // {label: "功能预设", value: 'MjPromptManage'},
            {label: "提示词预设", value: 'MjPromptsManage'},
        ]
    },
    {
        name: "存储配置",
        value: "StorageMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "腾讯云COS", value: 'StorageTencent'},
            {label: "阿里云OSS", value: 'StorageAli'},
            {label: "chevereto图床", value: 'StorageChevereto'},
        ]
    },
    {
        name: "用户端设置",
        value: "ClientMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "基础配置", value: 'ClientBaseConfig'},
            {label: "用户协议", value: 'ClientAgreement'},
            {label: "隐私政策", value: 'ClientPolicy'},
            {label: "用户端logo", value: 'ClientCopyRightConfig'},
            {label: "动态菜单", value: 'ClientMenuConfig'},
            {label: "公告设置", value: 'SystemMenuNotice'},
            {label: "思维导图", value: 'SystemMenuMind'},
            {label: "访客设置", value: 'SystemMenuVisitor'},
            {label: "签到奖励赠送", value: 'SignInMenu'},
            {label: "UI显示设置", value: 'VisibleMenu'},
            {label: "对话小尾巴", value: 'TailSet'},
        ]
    },
    {
        name: "风控管理",
        value: "SecureMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "违规检测记录", value: 'SensitiveViolationLog'},
            {label: "百度云敏感词", value: 'SensitiveBaiduyun'},
            {label: "GoMaxAi敏感词", value: 'SensitiveGoMaxAi'},
            {label: "自定义敏感词", value: 'SensitiveCustom'},
            {label: "自定义回复预设", value: 'ReplyMenuList'},
        ]
    },
    {
        name: "权限管理",
        value: "AccessMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "权限分配", value: 'AccessList'},
        ]
    },
    {
        name: "系统设置",
        value: "SystemMenu",
        checkAll: false,
        isIndeterminate: false,
        checked: [],
        children: [
            {label: "百度统计设置", value: 'SystemMenuBase'},
            {label: "底部版权信息", value: 'CopyrightConfig'},
            {label: "系统主题设置", value: 'ThemeConfig'},
            {label: "迁移助手", value: 'UpgradeConfig'},
        ]
    },
]

export const MenuKeys = {
    map: () => {
        const map = new Map();
        MENU_LIST.forEach(item => {
            item.children.length && item.children.forEach(sub => {
                map.set(sub.value, sub.label)
            })
        })
        return map;
    }
}

export const ModelTypes = [
  { label: "对话模型", value: "chat" },
  { label: "GPTS应用模型", value: "app" },
  { label: "绘画(dell)模型", value: "draw" },
  { label: "音乐(suno)模型", value: "music" },
  // {label: "视频模型", value: 'video'},
  { label: "工具(翻译、ppt)模型", value: "other" },
];

export const MODELTYPESMAP:{[key: string]: string} = {
  chat: '对话模型',
  app: 'GPTS应用模型',
  draw: '绘画(dell)模型',
  music: '音乐(suno)模型',
  video: '视频模型',
  other: '工具(翻译、ppt)模型',
}
