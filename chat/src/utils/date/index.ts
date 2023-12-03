

const bu0 = (num: number) => {
    return num > 9  ? num : `0${num}`
}

export const formatTime = (time: number) => {
    let m: string | number = Math.floor(time / 60),
        s: string | number = parseInt(String(time % 60));

    return `${bu0(m)}:${bu0(s)}`;
}
