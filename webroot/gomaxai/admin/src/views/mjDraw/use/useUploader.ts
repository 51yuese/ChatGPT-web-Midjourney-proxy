import {ElMessage} from 'element-plus'
import MjApi from "@/api/modules/mj";
import {AxiosProgressEvent} from "axios";
export function useUploader() {
   const ms = ElMessage;
  function selectFile(): Promise<File> {

    return new Promise((resolve, reject) => {

      const accepts = "image/jpeg,image/jpg,image/gif,image/png";

      const fileType = [".jpeg",".jpg", ".gif",".png"]

      const uploader = document.createElement('input')
      uploader.multiple = true
      uploader.name = 'file'
      uploader.type = 'file'
      uploader.accept = accepts // 同时支持jpg和png
      uploader.click(); // 同时支持jpg和png
      uploader.style.display = "none"; // 同时支持jpg和png

      uploader.onchange = async () => {

        const files = uploader.files;
        let file = files && files?.length >= 1 ? files[0] : undefined

        if (!file) {
          reject("未选择文件")
          return
        }

        if (!accepts.includes(file.type)) {
          ms.error("上传文件只支持" + fileType.join(",") + '格式');
          reject("上传文件只支持" + fileType.join(",") + '格式')
          return;
        }

        // max 512Mb
        if (file.size >= 512 * 1024 * 1024) {
          ms.error("上传的文件不能超过512Mb")
          reject("上传的文件不能超过512Mb")
          return;
        }
        resolve(file)


      }

      uploader.remove()
    })

  }

  async function upload(param: {file: File}) {
    const {file, } = param;
    const formData = new FormData();
    formData.append("filename", file.name)
    formData.append("file", file)
    formData.append("dir", 'mj-upload')
    return await MjApi.uploadPromptImage(formData)
  }

  return {
    selectFile,
    upload
  }
}
