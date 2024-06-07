
export function UseRecord() {


    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 初始化canvas的尺寸
    canvas.width = window.innerWidth / 2 // 窗口的内部宽度
    canvas.height = 150 //窗口的内部高度
    // document.body.style.backgroundColor = '#fff' // 背景颜色设置为黑色
    // 定义数组和音频分析器
    let dataArray, analyser;

    const init = () => {

    }


    return {
        init
    }
}
