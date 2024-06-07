interface RechargeType {
    [key: number]: string
}

export const RechargeTypeMap: RechargeType = {
    1: '注册赠送',
    2: '受邀请赠送',
    3: '邀请他人赠送',
    4: '购买卡密充值',
    5: '管理员赠送',
    6: '扫码购买充值',
    7: 'MJ绘画失败退款',
    8: '签到奖励',
}

// 0：未支付、1：已支付、2、支付失败、3：支付超时）
export const OrderMap = {
    0: '未支付',
    1: '已支付',
    2: '支付失败',
    3: '支付超时',
}

/**
 * 任务状态枚举 1: 等待中 2: 绘制中 3: 绘制完成 4: 绘制失败 5: 绘制超时
 */
export enum MidjourneyStatusEnum {
    None,
    WAITING,
    DRAWING,
    DRAWED,
    DRAWFAIL,
    DRAWTIMEOUT,
}


export const MidjourneyActionMap: { [key: number]: string } = {
    0:"放大",
    1: "文生图",
    2: "图生文",
    3: "图混图",
    4: "单张放大",
    5: "单张变换",
    6: "重新生成",
    7: "大差异化扩展",
    8: "小差异化扩展",
    9: "区域重绘",
    10: "切正方形",
    11: "镜头拉远2倍",
    12: "镜头拉远1.5倍",
    13: "放大2倍",
    14: "放大4倍",
    15: "重新放大2倍",
    16: "重新放大4倍",
    17: "拉伸",
    18: "自定义缩放",
    19: "重新微小创意",
    20: "重新高档创意",
    21: "生图",
    22:"AI换脸"
}

/**
 * 绘画动作枚举
 */
export enum MidjourneyActionEnum {
    NONE, // 没有
    TEXT_TO_IMAGE,  // 文生图
    IMAGE_TO_TEXT,  // 图生文
    IMAGE_MIX_IMAGE,  // 图混图
    // AIChangeFace,
    U_SCALE,  // 放大 u1-u4
    V_EXPAND,  // 变换 v1-v4
    REGENERATE,  // 重新生成
    VARY_STRONG,  // 大差异化扩展
    VARY_SUBTLE,  // 小差异化扩展
    VARY_REGION,  // 区域重绘
    SQUARE,  // 切正方形
    ZOOM2X,  // 镜头拉远两倍
    ZOOM1_5X,  // 镜头拉远1.5倍
    UPSCALE_2X,  // 放大2倍
    UPSCALE_4X,  // 放大4倍
    RE_UPSCALE_2X,  // 重新放大2倍
    RE_UPSCALE_4X,  // 重新放大4倍
    STRETCH,  // 拉伸 上下左右
    ZOOM_CUSTOM,  // 自定义缩放
    REDO_UPSCALE_SUBTLE,  // 重新微小创意
    REDO_UPSCALE_CREATIVE ,  // 重新高档创意
    IMAGE_TO_TEXT_ACTION ,  // 图生文按钮
		MODAL_ACTION, // MOFAL Prompt
}


// 提交参数的模式
// 提交参数的模式
export enum MidJourneyDrawEnum {
    NONE, // 空
    TEXT_TO_IMAGE , // 文生图
    IMAGE_TO_TEXT , // 图生文
    IMAGE_MIX_IMAGE , // 图混图
    // AIChangeFace,
    IMAGE_ACTION, // 图片按钮操作
    REGION_ACTION // 局部重绘
}

// 文生图
export interface TEXT_TO_IMAGE_OPTIONS {
    action: MidjourneyActionEnum,
    imageUrl?: string,
    mode: DRAW_SPEED_MODE,
    translate: TRANSLATE_ENABLE,
    extend?: string
}


// 图生文
export interface IMAGE_TO_TEXT_OPTIONS {
    action: MidjourneyActionEnum,
    attachments: { id: string, filename: string, uploaded_filename: string }[],
    prompt?: string;
    mode: number;
}

// 图混图
export interface IMAGE_MIX_IMAGE_OPTIONS {
    action: MidjourneyActionEnum,
    image1: string;
    image2: string;
    image3?: string;
    image4?: string;
}


// 图片按钮操作
export interface IMAGE_ACTION_OPTIONS {
    taskId: number;
    messageId: string;
    customId: string;
    messageFlags: number;
    prompt?: string
}

// 区域重绘
export interface REGION_REDRAW_ACTION_OPTIONS {
    taskId: number,
    action: MidjourneyActionEnum,
    customId: string,
    prompt: string,
    mask: string,
}


// 是否翻译
export enum TRANSLATE_ENABLE {
    DISABLED, // 停用
    ENABLE // 启用
}

// 绘制速度
export enum DRAW_SPEED_MODE {
    NONE,
    FAST, // 快速
    RELAX, // 休闲
    TURBO // turbo
}
