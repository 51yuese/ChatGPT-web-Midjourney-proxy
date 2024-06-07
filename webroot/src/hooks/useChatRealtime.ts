import {computed, ref} from 'vue'
import {useAppStore, useGlobalStoreWithOut} from "@/store";
import {fetchChatVoice} from "@/api";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {useMessage} from "naive-ui";

const {isMobile} = useBasicLayout()
const useGlobalStore = useGlobalStoreWithOut()
const appStore = useAppStore();
const recordDialog = computed(() => useGlobalStore.recordDialog);

export enum ListenStatusEnum {
    none,
    listening,
    thinking,
    speaking,
    error,
}

// 实时聊天
export const useChatRealtime = () => {

    const ms = useMessage();

    const theme = computed(() => appStore.theme);
    const voice = ref('alloy') // 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    const isListen = ref(false)
    const listenStatus = ref(ListenStatusEnum.none) // 1 聆听中 2 思考中 3 静默状态
    const recordingRef = ref<any>(); // 录音的canvas
    const recordingCtxRef = ref(); // 录音的canvas
    const playVoiceRef = ref(); // 播放的canvas

    const hasTimer = new Map<string, boolean>();
    let dataArray: Uint8Array;

    const threshold = 2; // 认为小于2 则表示停止说话

    const mediaRecorder = ref<MediaRecorder>();

    const recordedChunks = ref<Blob[]>([])
    const audioCtx = ref<AudioContext>();

    // 获取当前时间戳（单位为毫秒）
    let maxVolume = 0;

    let intervalTimer: string | number | NodeJS.Timeout | null | undefined = null
    let mySubTimer: string | number | NodeJS.Timeout | null | undefined = null;

    const controller = new AbortController()

    // 判断是否有麦克风
    const hasMicrophone = async () => {

        const result = await navigator.mediaDevices.enumerateDevices()

        if (result.length === 0) {
           return false;
        }

        // 判断设备中有没有音频输入设备
        return result.some(item => item.kind === 'audioinput' && item.deviceId != 'default' && item.deviceId != 'communications');

        // 只是为了获取麦克风权限，获取以后立马关闭
        // stream.getTracks().forEach(track => track.stop());
    }

    // 等待的动画
    const waitingToPlay = async () => {

        const canvas = playVoiceRef.value

        if (!canvas || !canvas.getContext) {
            return false;
        }

        /********************
         Random Number
         ********************/

        function rand(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        /********************
         Var
         ********************/
            // canvas
        const ctx = canvas.getContext('2d');

        let X = canvas.width = isMobile.value ? window.innerWidth : 608;
        let Y = canvas.height = isMobile.value ? window.innerHeight / 2 : 415;


        /********************
         Animation
         ********************/

        window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (cb) {
                setTimeout(cb, 17);
            };

        let greetNum = 1;
        let greets: any[] = [];
        const text = 'waiting gpt thinking';
        const circleSplit = text.length;
        const angleSplit = 360 / circleSplit;


        function Greet(this: any, ctx: any, x: number, y: number, r: number) {
            this.ctx = ctx;
            this.init(x, y, r);
        }

        Greet.prototype.init = function (x: any, y: any, r: any) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.v = 1;
            this.a = 0;
            this.rad = this.a * Math.PI / 180;
            this.points = [];
            this.setPoints();
            this.c = {
                r: theme.value === 'dark' ? 255 : 120,
                g: theme.value === 'dark' ? 255 : 197,
                b: theme.value === 'dark' ? 255 : 247,
            };
        };

        Greet.prototype.setPoints = function () {
            for (let i = 0; i < circleSplit; i++) {
                let pointX = Math.cos(this.rad) * this.r;
                let pointY = Math.sin(this.rad) * this.r;
                let point = [pointX, pointY, rand(0, 360)];
                this.points.push(point);
                this.a += angleSplit;
                this.rad = this.a * Math.PI / 180;
            }
        };

        Greet.prototype.draw = function () {
            const ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = 'rgb(' + this.c.r + ', ' + this.c.g + ', ' + this.c.b + ')';
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.sin(this.rad) * 3);
            ctx.translate(-this.x, -this.y);

            const xav1 = (this.points[0][0] + this.points[circleSplit - 1][0]) / 2 + this.x;
            const yav1 = (this.points[0][1] + this.points[circleSplit - 1][1]) / 2 + this.y;
            ctx.moveTo(xav1, yav1);

            for (let i = 1; i < this.points.length - 1; i++) {
                let xav2 = (this.points[i][0] + this.points[i + 1][0]) / 2;
                let yav2 = (this.points[i][1] + this.points[i + 1][1]) / 2;
                ctx.quadraticCurveTo(this.points[i][0] + this.x, this.points[i][1] + this.y, xav2 + this.x, yav2 + this.y);
            }

            ctx.quadraticCurveTo(this.points[circleSplit - 1][0] + this.x, this.points[circleSplit - 1][1] + this.y, xav1, yav1);

            ctx.closePath();
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.fillStyle = 'transparent';

            ctx.translate(this.x, this.y);
            ctx.rotate(Math.sin(this.rad) * 3);
            ctx.translate(-this.x, -this.y);

            for (let i = 0; i < text.length; i++) {
                ctx.save();
                ctx.translate(this.points[i][0] * 1 + this.x, this.points[i][1] * 1 + this.y);
                ctx.rotate((angleSplit * i + 90) * Math.PI / 180);
                ctx.translate(-this.points[i][0] - this.x, -this.points[i][1] - this.y);
                ctx.fillText(text[i], this.points[i][0] * 1 + this.x, this.points[i][1] * 1 + this.y);
                ctx.restore();
            }
            ctx.restore();
        };

        Greet.prototype.transform = function () {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] -= Math.sin(this.points[i][2] * Math.PI / 180 * 5);
                this.points[i][1] -= Math.cos(this.points[i][2] * Math.PI / 180 * 8);
                this.points[i][2] -= this.v;
            }
        };

        Greet.prototype.updateParams = function () {
            this.a += 0.3;
            this.rad = this.a * Math.PI / 180;
        };

        Greet.prototype.resize = function () {
            this.x = X / 2;
            this.y = Y / 2;
        };

        Greet.prototype.render = function () {
            this.updateParams();
            this.transform();
            this.draw();
        };

        for (let i = 0; i < greetNum; i++) {
            greets.push(new Greet(ctx, X / 2, Y / 2, 110));
        }

        /********************
         Render
         ********************/

        function render() {
            ctx.clearRect(0, 0, X, Y);
            for (let i = 0; i < greets.length; i++) {
                greets[i].render(i);
            }
            requestAnimationFrame(render);
        }

        render();

        /********************
         Event
         ********************/

        function onResize() {
            X = canvas.width = isMobile.value ? window.innerWidth : 608;
            Y = canvas.height = isMobile.value ? window.innerHeight / 2 : 415;
            for (let i = 0; i < greets.length; i++) {
                greets[i].resize();
            }
        }

        window.addEventListener('resize', function () {
            onResize();
        });

        window.onunload = () => {
            window.removeEventListener("resize", () => {
         })
        }

    }

    // 获取数据
    const getRecordedVoice = async (): Promise<Blob> => {
        return new Blob(recordedChunks.value, {type: "audio/ogg; codecs=opus"});
    }

    // 初始化并开始录音
    const initAndStart = async (): Promise<boolean | void> => {

        const protocol = location.protocol

        if (!protocol.includes("https")) {
            return Promise.reject("录音功能必须要https协议")
        }

        await analyseVoice();
        await waitingToPlay();
    }

    // const intervalInMilliseconds = 3200;

    //调用麦克风捕捉音频信息，成功时触发onSuccess函数，失败时触发onError函数
    const startAudio = (stream: MediaStream) => {

        //创建一个音频环境对像
        let AudioContext = window.AudioContext || window.webkitAudioContext;

        audioCtx.value = new AudioContext()

     /*   const audioBuffer = new AudioBuffer({
            numberOfChannels: 1,
            length: audioCtx.value.sampleRate,
            sampleRate: audioCtx.value.sampleRate,
        });

        // 假设已经获得了录音的Buffer对象 audioBuffer
        const channel = audioBuffer.getChannelData(0); // 选择第一个频道作为示例
        let sum = 0;

        for (let i = 0; i < channel.length; i++) {
            sum += Math.abs(channel[i]); // 求每个样本的绝对值并相加
        }

        const averageVolume = sum / channel.length; // 计算平均音量

            // 设置一个阈值，根据实际情况调整
        const threshold = 0.5;
        if (averageVolume >= threshold) {
            console.log("录音Buffer中存在声音数据");
        } else {
            console.log("录音Buffer中不存在声音数据");
        }

        const source2 = audioCtx.value.createBufferSource();
        // Set the buffer in the AudioBufferSourceNode
        source2.buffer = audioBuffer;
        // Connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        source2.connect(audioCtx.value.destination);
        // start the source playing
        source2.start();*/


        // console.log("音频环境对像---",audCtx);
        //将声音输入这个对像
        let source = audioCtx.value.createMediaStreamSource(stream);//创建一个音频源节点  createMediaStreamSource 创建媒体流源     createMediaElementSource  创建媒体元素源

        //设置音量节点
        let volume = audioCtx.value.createGain();
        // console.log('音量节点---', volume);
        source.connect(volume);

        let analyser = audioCtx.value.createAnalyser() //创建一个分析器节点

        // console.log("分析器节点", analyser);
        analyser.fftSize = 256; // 数字越大越精细
        //创建数组，用于接收分析器节点的数据

        let bufferLength = analyser.frequencyBinCount;

        dataArray = new Uint8Array(bufferLength)
        // console.log('分析器数据', dataArray);
        source.connect(analyser)

        //创建缓存，用来缓存声音
        const bufferSize = 2048;

        // 创建声音的缓存节点，createJavaScriptNode方法的
        // 第二个和第三个参数指的是输入和输出都是双声道。
        const recorder = audioCtx.value.createScriptProcessor(bufferSize, 1, 1);

        //创建变量并迭代来获取最大的音量值

        // 录音过程的回调函数，基本上是将左右两声道的声音
        // 分别放入缓存。
        recorder.onaudioprocess = function (e) {

            let buffer = e.inputBuffer.getChannelData(0); //获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组

            let maxVal = 0;

            for (let i = 0; i < buffer.length; i++) {
                if (maxVal < buffer[i]) {
                    maxVal = buffer[i];
                }
            }
            // 判断用户如果3s中没发出声音，并且再等等3秒钟，音量任然小于2，则将录音的内容发送到后台
            const maxVol = Math.round(maxVal * 100);

            maxVolume = maxVol;

            //把分析出来的波形绘制到canvas上
            //清空画布
            const {width, height} = recordingRef.value;

            recordingCtxRef.value.clearRect(0, 0, width, height);

            //让分析器节点分析出数据到数组中
            analyser.getByteFrequencyData(dataArray)

            const len = dataArray.length / 30;
            const barwidth = width / len / 2

            recordingCtxRef.value.fillStyle = '#78c5f7'

            // 绘制
            for (let i = 0; i < len; i++) {

                const data = dataArray[i]; // <256

                const barHeight = data / 255 * height * 0.5;

                const x1 = i * barwidth + width / 2;
                const x2 = width / 2 - (i + 1) * barwidth;

                const y = height / 2;

                recordingCtxRef.value.fillRect(x1, y, Math.ceil(barwidth - 10), barHeight)
                recordingCtxRef.value.fillRect(x1, y, Math.ceil(barwidth - 10), -barHeight)
                recordingCtxRef.value.fillRect(x2, y, Math.ceil(barwidth - 10), barHeight)
                recordingCtxRef.value.fillRect(x2, y, Math.ceil(barwidth - 10), -barHeight)

            }

            // console.log("您的音量值：", maxVol);

            // 流一直在，如果流中最大声音值 小于 阈值，则触发一个定时器，当定时器时间内有某个值大于了阈值，则定时器取消，否则定时器执行完毕，执行stop
            if (maxVol < threshold) {
                const myTimer = hasTimer.has("timer");
                if (!myTimer) {
                    hasTimer.set("timer", true);
                    startTimer();
                }
            } else {
                hasTimer.delete("timer");
                intervalTimer && clearTimeout(intervalTimer);
                mySubTimer && clearTimeout(mySubTimer);
            }

        }

        // 将音量节点连上缓存节点，换言之，音量节点是输入
        // 和输出的中间环节。
        volume.connect(recorder);

        // 将缓存节点连上输出的目的地，可以是扩音器，也可以
        // 是音频文件。
        recorder.connect(audioCtx.value.destination);
    }

    function startTimer() {

        // 当三秒钟之内，最大声音
        intervalTimer = setTimeout(() => {

            hasTimer.delete("timer");

            if (maxVolume > threshold) {
                console.log('检测到声音大于阈值，有人说话，清理定时器');
                intervalTimer && clearTimeout(intervalTimer);
            } else {
                // 再延迟1.5s,防止人说话的时候突然那一瞬间没发声

                mySubTimer && clearTimeout(mySubTimer);
                mySubTimer = setTimeout(async () => {

                    if (maxVolume > threshold) {

                        mySubTimer && clearTimeout(mySubTimer);
                        console.log('检测到声音大于阈值，有人说话，清理定时器');
                        intervalTimer && clearTimeout(intervalTimer);
                    } else {

                        await stop(ListenStatusEnum.thinking)
                        // 	执行完毕
                        console.log('说话结束，清除所有定时器');
                    }
                }, 1400)
            }
        }, 2800)
    }


    const startRecord = (stream: MediaStream) => {

        mediaRecorder.value = new MediaRecorder(stream)

        // 记录数据
        mediaRecorder.value.ondataavailable = (ev) => {
            recordedChunks.value.push(ev.data);
        }

        // 设置录音完成事件处理函数
        mediaRecorder.value.onstop = async () => {
            console.log("录音已经停止");
			const blob = new Blob(recordedChunks.value, {type: "audio/wav"});
            await handleSubmitFile(blob);
        };

        // 开始录音
        mediaRecorder.value.start();

    }

    // 分析波普
    const analyseVoice = async () => {

        const cvs = recordingRef.value;

        if (!cvs) return;

        recordingCtxRef.value = cvs.getContext('2d');

        const w = isMobile.value ? 4 : 8;
        const h = isMobile.value ? 8 : 4;

        cvs.width = (window.innerWidth / w) * devicePixelRatio;
        cvs.height = (window.innerHeight / h) * devicePixelRatio;

        const getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;

        recordedChunks.value = [];

        if (!getUserMedia) {
            return false;
        }

        await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1, // 单声道
                noiseSuppression: true, // 降噪
                echoCancellation: true,   // 回音消除
                frameRate: 16,             // 采样位数，支持 8 或 16，默认是16
                sampleRate: 48000,         // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
                sampleSize: 1,             // 声道，支持 1 或 2， 默认是1
            }
        }).then(res => {
            startRecord(res);
            startAudio(res)
        }).catch(error => {
            console.error(error);
        });

    }

    // 当用户没有说时，
    // 判断输入音频音量持续3s小于1，再等待3s任然小于1 则暂停录音并保存语音

    const playBlob = async (blobData: Blob) => {

        const blob = new Blob([blobData], {type: 'audio/wav'});

        const localUrl = (window.URL || webkitURL).createObjectURL(blob);

        const audio = document.createElement('audio');

        audio.style.display = 'none'; // 防止影响页面布局
        audio.controls = true;

        document.body.appendChild(audio);

        audio.src = localUrl;

        await audio.play();

        listenStatus.value = ListenStatusEnum.speaking;

        // audio.onplaying = () => {
        //     if (!recordDialog.value) {
        //         audio.pause();
        //         document.body.removeChild(audio);
        //         URL.revokeObjectURL(localUrl);
        //     }
        // }

        // 语音播放完毕后，需要手动释放内存
        audio.onended = () => {

            document.body.removeChild(audio);
            URL.revokeObjectURL(localUrl);

            if (recordDialog.value) {
                restart();
            } else {
                stop(ListenStatusEnum.none);
            }

        };
    }


    const handleSubmitFile = async (voiceData: Blob) => {

        const form = new FormData();

        form.append('file', new File([voiceData], Date.now() + 'record.wav'));
        form.append('voice', voice.value);

        const signal = controller.signal;

        const blob = await fetchChatVoice(form, signal).catch(error => {
            handleReset();
            error && error.message !== 'CanceledError: canceled' && ms.error(error.message || "")
        })

        if (!blob) return;

        // await playBlob(blob)

    }

        /* const blobToStream = (blob: Blob) => {

        }*/

    // 重启
    const restart = async () => {
        intervalTimer && clearTimeout(intervalTimer);
        isListen.value = true;
        listenStatus.value = ListenStatusEnum.listening;
        recordedChunks.value = [];
        await initAndStart();
    }

    // 重置
    const handleReset = () => {
        isListen.value = false;
        intervalTimer && clearTimeout(intervalTimer)
        mediaRecorder.value && mediaRecorder.value?.stop();
        audioCtx.value && audioCtx.value?.close();
    }


    const clear = () => {
        const {width, height} = recordingRef.value;
        recordingCtxRef.value.clearRect(0, 0, width, height);
    }

    // 暂停录音
    const stop = async (status: ListenStatusEnum) => {
        listenStatus.value = status;
        handleReset();
        clear();
    }

    return {
        voice,
        isListen,
        listenStatus,
        recordingRef,
        playVoiceRef,
        controller,
        hasMicrophone,
        initAndStart,
        stop,
        restart,
        getRecordedVoice
    }
}
