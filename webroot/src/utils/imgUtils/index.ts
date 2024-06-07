const imgSrc2Base64 = (src:string) => {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', src, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
            if (this.status == 200) {
                let blob = this.response
                let oFileReader = new FileReader()
                oFileReader.onloadend = function (e) {
                    const base64 = e.target?.result
                    resolve(base64)
                }
                oFileReader.readAsDataURL(blob)
            }
        }
        xhr.send()
    })
}

export { imgSrc2Base64 }