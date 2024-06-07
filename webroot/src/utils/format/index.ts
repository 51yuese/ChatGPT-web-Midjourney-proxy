/**
 * 转义 HTML 字符
 * @param source
 */
export function encodeHTML(source: string) {
  return source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 判断是否为代码块
 * @param text
 */
export function includeCode(text: string | null | undefined) {
  const regexp = /^(?:\s{4}|\t).+/gm
  return !!(text?.includes(' = ') || text?.match(regexp))
}

/**
 * 复制文本
 * @param options
 */
export function copyText(options: { text: string; origin?: boolean }) {
  const props = { origin: true, ...options }

  let input: HTMLInputElement | HTMLTextAreaElement

  if (props.origin)
    input = document.createElement('textarea')
  else
    input = document.createElement('input')

  input.setAttribute('readonly', 'readonly')
  input.value = props.text
  document.body.appendChild(input)
  input.select()
  if (document.execCommand('copy'))
    document.execCommand('copy')
  document.body.removeChild(input)
}

export function utcToShanghaiTime(utcTime: string, format: string): string {
  const date = new Date(utcTime)
  const shanghaiTime = date.getTime() + 8 * 60 * 60 * 1000
  const shanghaiDate = new Date(shanghaiTime)

  let result = format.replace('YYYY', shanghaiDate.getFullYear().toString())
  result = result.replace('MM', (`0${shanghaiDate.getMonth() + 1}`).slice(-2))
  result = result.replace('DD', (`0${shanghaiDate.getDate()}`).slice(-2))
  result = result.replace('hh', (`0${shanghaiDate.getHours()}`).slice(-2))
  result = result.replace('mm', (`0${shanghaiDate.getMinutes()}`).slice(-2))
  result = result.replace('ss', (`0${shanghaiDate.getSeconds()}`).slice(-2))

  return result
}

/**
 * 解析suno音乐
 * @param text 
 */
export function parseMusicText(text: string) {
  const first = {
    title: '解析错误',
    image: "",
    agree: null,
    agreeNum: 0,
    operation: false,
    intro: '解析错误',
    mp3: '解析错误',
    mp4: '解析错误',
    chatLogId: null
  }
  const second = {
    title: '解析错误',
    image: "",
    agree: null,
    agreeNum: 0,
    operation: false,
    intro: '解析错误',
    mp3: '解析错误',
    mp4: '解析错误',
    chatLogId: null
  }
  if (text.indexOf("Request failed") != -1) {
    return [first, second];
  } else {
    let title = '解析错误';
    let intro = '解析错误';
    let image_1 = '解析错误';
    let image_2 = '解析错误';
    let mp3_1 = '解析错误';
    let mp3_2 = '解析错误';
    let mp4_1 = '解析错误';
    let mp4_2 = '解析错误';
    // 中转1
    if (text.startsWith('####')) {
      title = text.split('\n')[0].substring(7);
      intro = text.split('---')[1].replace(/\[.*\]|（.*）/g,'').replace(/\n+/g, '\n');
      const imageMatch = text.match(/!\[image\].*\)/g);
      if (imageMatch) {
        [image_1, image_2] = imageMatch.map(item => item.substring(9,  item.length - 1));
      }
      const mp3Match = text.match(/https:\/\/(.*)\.mp3/g);
      if (mp3Match) {
        [mp3_1, mp3_2] = mp3Match;
      }
      const mp4Match = text.match(/https:\/\/(.*)\.mp4/g);
      if (mp4Match) {
        [mp4_1, mp4_2] = mp4Match;
      }
    } 
    // 中转2 
    else if (text.startsWith('🎵')) {
      title = text.split('\n')[0].replace(/🎵/g, '');
      const originLyrics = text.split('--').find(item => /-\n\n\[/.test(item));
      if (originLyrics) {
        const lyrics = originLyrics.replace(/\[.*\]|（.*）|-/g,'').replace(/\n+/g, '\n');
        if (lyrics.startsWith('\n')) {
          intro = lyrics.replace('\n', '');
        } else {
          intro = lyrics;
        }
      }
      const imageMatch = text.match(/\[封面图片\].*\)/g);
      if (imageMatch) {
        [image_1, image_2] = imageMatch.map(item => item.substring(7,  item.length - 1))
      }
      const mp3Match = text.match(/https:\/\/(.*)\.mp3/g);
      if (mp3Match) {
        [mp3_1, mp3_2] = mp3Match;
      }
      const mp4Match = text.match(/https:\/\/(.*)\.mp4/g);
      if (mp4Match) {
        [mp4_1, mp4_2] = mp4Match;
      }
    } 
    // 未匹配
    else {
      // nothing
    }
    first.title = title;
    first.intro = intro;
    first.image = image_1;
    first.mp3 = mp3_1;
    first.mp4 = mp4_1;

    second.title = title;
    second.intro = intro;
    second.image = image_2;
    second.mp3 = mp3_2;
    second.mp4 = mp4_2;

    return [first, second];
  }
}
