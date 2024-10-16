import cocoMessage from "coco-message";
import APK from "@/assets/images/apk.svg";
import PPT from "@/assets/images/ppt.svg";
import MP3 from "@/assets/images/mp3.svg";
import FLAC from "@/assets/images/flac.svg";
import MP4 from "@/assets/images/mp4.svg";
import JavaScript from "@/assets/images/javascript.svg";
import HTML from "@/assets/images/html.svg";
import CSS from "@/assets/images/css.svg";
import VueJS from "@/assets/images/vuejs.svg";
import Java from "@/assets/images/java.svg";
import Python from "@/assets/images/python.svg";
import C from "@/assets/images/c.svg";
import Excel from "@/assets/images/excel.svg";
import Word from "@/assets/images/word.svg";
import WinRAR from "@/assets/images/winrar.svg";
import File from "@/assets/images/file.svg";
import FileFolder from "@/assets/images/file-folder.svg";

cocoMessage.config({
  duration: 3000,
});

export function msgs(
  meta: string,
  type?: "warning" | "success" | "info" | "error" | "loading"
) {
  type = type || "info";
  return cocoMessage[type](meta);
}

export function getFileIcon(filtInfo) {
  const { httpMetadata, key, customMetadata, path } = filtInfo;
  if (path) return FileFolder;
  if (customMetadata?.thumbnail) {
    return `/raw/_$flaredrive$/thumbnails/${customMetadata?.thumbnail}.png`;
  }
  let mimeType = httpMetadata.contentType;
  if (!mimeType) {
    const TypeMapping = {
      js: "application/javascript",
      html: "text/html",
      css: "text/css",
      vue: "text/x-vue",
      java: "application/java-archive",
      py: "application/x-python-code",
      c: "text/x-csrc",
      cpp: "text/x-c++src",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      zip: "application/zip",
      apk: "application/vnd.android.package-archive",
      mp3: "audio/mpeg",
      avi: "video/x-msvideo",
      mp4: "video/mp4",
      flac: "audio/flac",
    };
    mimeType = TypeMapping[key.split(".").pop()] ?? mimeType;
  }

  const iconMapping = {
    "application/vnd.android.package-archive": APK,
    "audio/mpeg": MP3,
    "audio/flac": FLAC,
    "video/x-msvideo": MP4,
    "video/mp4": MP4,
    "application/javascript": JavaScript,
    "text/html": HTML,
    "text/css": CSS,
    "text/x-vue": VueJS,
    "application/java-archive": Java,
    "text/x-java-source": Java,
    "application/x-python-code": Python,
    "text/x-python": Python,
    "text/x-csrc": C,
    "text/x-c++src": C,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": Excel,
    "application/x-cfb": Excel,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      PPT,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      Word,
    "application/zip": WinRAR,
  };

  return iconMapping[mimeType] || File;
}

export function formatSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
