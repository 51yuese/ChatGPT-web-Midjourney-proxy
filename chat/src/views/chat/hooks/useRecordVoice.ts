import Recorder from 'js-audio-recorder';

import {ref, VNodeChild} from 'vue'
import {useMessage} from "naive-ui";
import {formatTime} from "@/utils/date";

export enum PlayStatus {
    pause,
    playing,
    // pause,
    // resume
}

export function useRecordVoice() {

    const ms = useMessage()
    const time = ref("00:00")
    const recordTimer = ref()
    const recordDurtion = ref(0)
    const playing = ref<PlayStatus>(PlayStatus.pause) // 0 未开始停止 1 播放 2 暂停 3 继续播放
    const recording = ref(false)
    const recorder = ref<Recorder>()
    const drawRecordId = ref()
    const recordCanvasRef = ref();

    const getRecordFile = () => {
        const blob = recorder.value?.getWAVBlob();
        return new File([blob], Date.now() + '.wav', {type: "audio/wav"})
    }

    const init = async (dom: HTMLDivElement) => {

        const protocol = location.protocol
        recording.value = false;
        time.value = formatTime(0)

        if (!protocol.includes("https")) {
            ms.error("录音功能必须要https协议")
            return;
        }

        const recordCanvas = document.createElement("canvas")

        recordCanvas.height = 150
        recordCanvas.width = 500
        recordCanvas.id = "recordCanvas"
        recordCanvasRef.value = recordCanvas;
        dom.appendChild(recordCanvas)

			  drawSpectrum(true) // 初始化调一次，为了页面有内容

        recorder.value = new Recorder({
            sampleBits: 16,                 // 采样位数，支持 8 或 16，默认是16
            sampleRate: 16000,              // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
            numChannels: 1,                 // 声道，支持 1 或 2， 默认是1
        });
        recorder.value.initRecorder();

        recorder.value.onprogress = (params) => {

            recordDurtion.value = params.duration
            time.value = formatTime(params.duration)

            // console.log('录音时长(秒)', params.duration);
            // console.log('录音大小(字节)', params.fileSize);
            // console.log('录音音量百分比(%)', params.vol);
        }

        recorder.value.onplay = () => {
            console.log('onplay')
        }

        recorder.value.onpauseplay = () => {
            console.log('onpauseplay')
            playing.value = 1;
        }

        recorder.value.onresumeplay = () => {
            console.log('onresumeplay')
            // playing.value = true;
        }

        recorder.value.onplayend = () => {
            console.log('onplayend')
            playing.value = PlayStatus.pause;
        }

        recorder.value.onstopplay = () => {
            console.log('onstopplay')
            playing.value = PlayStatus.pause;
        }

    }

    const pausePlay = () => {

    }

    const stopPlay = async () => {
        recorder.value?.stopPlay()
        playing.value = PlayStatus.pause;
    }

    const destroy = async () => {
        recorder.value?.destroy().then(() => {
            recorder.value = undefined;
        })
        playing.value = PlayStatus.pause;
    }

    const startRecord = async () => {
        // await recorder.value.getPermission()
        recording.value = false;
        await playRecord(PlayStatus.pause)
        await recorder.value?.start().then(() => {
            recording.value = true;
            drawRecord();
        }).catch((err: string | (() => VNodeChild)) => {
            console.log(err);
            recording.value = false;
            ms.error(err)
        })

    }


    const stopRecord = async () => {
        recorder.value?.stop()
        recording.value = false;
        recordTimer.value && clearInterval(recordTimer.value);
        drawRecordId.value && cancelAnimationFrame(drawRecordId.value);

        // recorder.value?.destroy().then(() => {
        //     drawRecordId.value = null;
        // });
    }


    const playRecord = async (isPlay: PlayStatus) => {

        switch (isPlay) {
            case PlayStatus.playing:

                if (recordDurtion.value === 0) {
                    ms.warning("请先录音再播放")
                    return;
                }
                await stopRecord();

                recorder.value?.play()

                recording.value = false;
                playing.value = PlayStatus.playing;
                drawRecord();
                break;
            case PlayStatus.pause:
                recorder.value?.pausePlay()
                recording.value = false;
                playing.value = PlayStatus.pause;
                drawRecordId.value && cancelAnimationFrame(drawRecordId.value);
                break;
        }
    }

    // 录音波浪图
    const drawRecord = () => {
        // 用requestAnimationFrame稳定60fps绘制
        drawRecordId.value = requestAnimationFrame(drawRecord)
        // drawWave({
        //     canvas: recordCanvasRef.value,
        //     dataArray: recorder.value?.getRecordAnalyseData(),
        // });
        drawSpectrum();

    }

    // var audioContext = new AudioContext();

    //开始绘制频谱图
    function drawSpectrum(init: boolean = false) {

          const canvas = recordCanvasRef.value;

          const dataArray = !init ?  (playing.value === PlayStatus.playing ?  recorder.value?.getPlayAnalyseData() : recorder.value?.getRecordAnalyseData()) : new ArrayBuffer(128);

          // //播放
          // source.start(0);
          const {width, height} = canvas;
          const ctx = canvas.getContext("2d");

            let cheight = height - 2 ,
            meterWidth = 10,//能量条的宽度
             // gap = 2,//能量条的间距
            capStyle = '#0f0',//冒头的颜色
            capYPositionArray = [],//将上一面各个冒头的位置保存到这个数组
            meterNum = width / (10) //计算当前画布上能画多少条

        const capHeight = 2;// //冒头的高度
        const array = new Uint8Array(dataArray);

        const step = Math.round(array.length / meterNum);//计算从analyser中的采样步长

        //清理画布
        ctx.clearRect(0, 0, width, height);
		  	// ctx.fillStyle = '#ccc';
        //定义一个渐变样式用于画图
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(1, '#0f0');
        gradient.addColorStop(0.6, '#ff0');
        gradient.addColorStop(0, '#f00');

        ctx.fillStyle = gradient;

			// ctx.fillRect(0, 0, width, height);
			// let barWidth = (width / array.length) * 10;
			// let barHeight;
			// let x = 0;
			// let c = 2
			// for (let i = 0; i < array.length; i++) {
			// 	barHeight = c + (dataArray[i] / 400) * height;
			// 	ctx.fillStyle = '#0f0';
			// 	ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
			// 	x += barWidth + 2;
			// }

        //对信源数组进行抽样遍历，画出每个频谱条
        for (let i = 0; i < meterNum; i++) {

            const value = array[i * step];

            //绘制缓慢降落的冒头
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);//初始化保存冒头位置的数组，将第一个画面位置保存
            }

            ctx.fillStyle = capStyle;

						//1.开始绘制冒头
            if (value < capYPositionArray[i]) {
                //使用前一次数据
                ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                //否则，直接使用当前数据并记录
                ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            }

            //2.开始绘制频谱条
            ctx.fillStyle = gradient;
            ctx.fillRect(i * 12/*频谱条的宽度+条间距*/, cheight - value + capHeight, meterWidth, cheight);
        }

    }

    // const drawWave = (param: { canvas: any, dataArray: any[] }) => {
		//
    //     const {canvas, dataArray} = param;
    //     const {width, height} = canvas
    //     const ctx = canvas.getContext("2d");
		//
    //     const bufferLength = dataArray.length;
    //     // 填充背景色
    //     ctx.fillStyle = "#fff";
    //     ctx.fillRect(0, 0, width, height);
		//
    //     // 设定波形绘制颜色
    //     ctx.lineWidth = 2;
    //     ctx.strokeStyle = "#409EFF";
    //     ctx.beginPath();
		//
    //     let sliceWidth = (canvas.width * 1.0) / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
    //         x = 0; // 绘制点的x轴位置
    //     for (let i = 0; i < bufferLength; i++) {
		//
    //         let v = dataArray[i] / 128.0;
    //         let y = (v * height) / 2;
		//
    //         if (i === 0) {
    //             // 第一个点
    //             ctx.moveTo(x, y);
    //         } else {
    //             // 剩余的点
    //             ctx.lineTo(x, y);
    //         }
		//
    //         // 依次平移，绘制所有点
    //         x += sliceWidth;
    //     }
    //     ctx.lineTo(canvas.width, canvas.height / 2);
    //     ctx.stroke();
		//
		//
    // }

    // 检测音频设备
    const detectRecordDevice = async () => {

        // const hasAudio = await navigator.mediaDevices.getUserMedia({audio: true})
        //
        //  console.log(hasAudio);
        return navigator.mediaDevices.enumerateDevices().then(devices => devices.filter(device => device.kind === 'audioinput' && device.deviceId !== 'default' && device.deviceId !== 'communications').length > 0) || false
    }


    // const drawVoice = ()=> {
    //
    //     // 把分析出的波形绘制到canvas上
    //     (function draw() {
    //         // 动画帧，按帧绘制canvas
    //         requestAnimationFrame(draw)
    //         // 清空画布
    //         const { width, height } = canvas
    //         ctx.clearRect(0, 0, width, height)
    //         // 让分析器节点分析出数据到数组中
    //         analyser.getByteFrequencyData(dataArray)
    //         // 设置canvas上下文绘制的颜色
    //         ctx.fillStyle = 'skyblue'
    //         // len表示获取分析到的音频数据数组长度的
    //         // 这里除以2.5是剔除不经常出现的高频的部分
    //         const len = dataArray.length / 2.5
    //         // barWidth表示每个波形矩形的宽度
    //         // 这里除以2是为了绘制对称的波形图
    //         const barWidth = width / len / 2
    //         for (let i = 0; i < len; i++) {
    //             // data是8位数组的每个数据，因为是一个字节，即data的值都是 <= 255
    //             const data = dataArray[i]
    //             // barHeight表示每个波形矩形的高度，值为单位长度乘canvas容器的高
    //             const barHeight = (data / 255) * height
    //             // 绘制点y
    //             const y = height - barHeight
    //             // 绘制点x1
    //             const x1 = i * barWidth + width / 2
    //             // 绘制点x2
    //             const x2 = width / 2 - (i + 1) * barWidth
    //             // 绘制右半部分波形图
    //             ctx.fillRect(x1, y, barWidth - 2, barHeight)
    //             // 绘制左半部分波形图
    //             ctx.fillRect(x2, y, barWidth - 2, barHeight)
    //         }
    //     })()
    //
    // }

    return {
        time,

        playing,
        recording,
        init,
        pausePlay,
        stopPlay,
        startRecord,
        stopRecord,
        getRecordFile,
        destroy,
        playRecord,
        detectRecordDevice
    }
}
