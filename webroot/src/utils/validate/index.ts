
export const Validate  = {
    isImg: (str: string) => /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png)$/.test(str), //
    isWord: (str: string) => /(.*)\.(doc|docx)$/.test(str.toLowerCase()),
    isExcel: (str: string) => /(.*)\.(xlsx|xls)$/.test(str),
    isPdf: (str: string) => /(.*)\.(pdf)$/.test(str),
    isPPt: (str: string) => /(.*)\.(ppt|pptx)$/.test(str),
    isVoice: (str: string) => /(.*)\.(wav|mp3|pcm|aac)$/.test(str),
}
