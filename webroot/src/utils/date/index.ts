

const bu0 = (num: number) => {
    return num > 9  ? num : `0${num}`
}

export const formatTime = (time: number) => {
    let m: string | number = Math.floor(time / 60),
        s: string | number = parseInt(String(time % 60));

    return `${bu0(m)}:${bu0(s)}`;
}

export const utcToShanghaiTime = (utcTime: string, format = 'YYYY-MM-DD hh:mm:ss'): string => {
    const date = new Date(utcTime)
    const shanghaiTime = date.getTime()
    const shanghaiDate = new Date(shanghaiTime)

    let result = format.replace('YYYY', shanghaiDate.getFullYear().toString())
    result = result.replace('MM', (`0${shanghaiDate.getMonth() + 1}`).slice(-2))
    result = result.replace('DD', (`0${shanghaiDate.getDate()}`).slice(-2))
    result = result.replace('hh', (`0${shanghaiDate.getHours()}`).slice(-2))
    result = result.replace('mm', (`0${shanghaiDate.getMinutes()}`).slice(-2))
    result = result.replace('ss', (`0${shanghaiDate.getSeconds()}`).slice(-2))

    return result
}
