import {useMessage} from "naive-ui";

import {fetchChatAPIUpload} from "@/api";
import {AxiosProgressEvent} from "axios";
export function useUpload() {
    const ms = useMessage()

    // function getFileSize(fileSize: number) {
    //     let size = fileSize;
    //     const units = ["B", "KB", "MB", "GB", "TB"];
    //     let i = 0;
    //     while (size >= 1024 && i < units.length - 1) {
    //         size /= 1024;
    //         i++;
    //     }
    //     return size.toFixed(2) + " " + units[i];
    // }

    function selectFile(): Promise<File> {

			return new Promise((resolve, reject) => {

				const accepts = "text/x-c,text/x-c++,application/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html," +
					"text/x-java,application/json,text/markdown,application/pdf,text/x-php,application/vnd.openxmlformats-officedocument.presentationml.presentation," +
					"text/x-python,text/x-script.python,text/x-ruby,text/x-tex,text/plain,text/css,image/jpeg,image/gif," +
					"image/png,application/x-tar,application/typescript,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
					"application/xml,application/zip";

				const fileType = [".c", ".cpp", ".csv", ".docx", ".html", ".java", ".json", ".md", ".pdf", ".php",
					".pptx",".py",".py",".rb",".tex",".txt",".css",".jpeg",".jpg",".js",".gif",".png",".tar",".ts",".xlsx",".xml",".zip"
				]

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

   async function upload(param: {file: File, purpose:  "fine-tune" | "assistants"}, onProgress?: (progress: AxiosProgressEvent) => void) {
          const {file, purpose} = param;
          const formData = new FormData();
          formData.append("file", file)
          formData.append("purpose", purpose)
          return await fetchChatAPIUpload(formData, onProgress)
    }

    return {

	   selectFile,
	   upload
    }
}
