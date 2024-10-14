<template>
  <div class="main" @dragenter.prevent @dragover.prevent @drop.prevent="onDrop">
    <progress
      v-if="uploadProgress !== null"
      :value="uploadProgress"
      max="100"
    ></progress>
    <UploadPopup
      v-model="showUploadPopup"
      @upload="onUploadClicked"
      @createFolder="createFolder"
    ></UploadPopup>
    <button class="upload-button circle" @click="showUploadPopup = true">
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="33"
        height="33"
        @contextmenu.prevent
      >
        <path
          d="M811.1616 393.3184c-5.2736-160.6656-137.0624-289.28-299.008-289.28s-293.7344 128.6144-299.008 289.28c-100.9152 3.328-181.7088 86.1184-181.7088 187.8528 0 103.8336 84.1728 188.0064 188.0064 188.0064h585.3696c103.8336 0 188.0064-84.1728 188.0064-188.0064 0.0512-101.7344-80.7424-184.5248-181.6576-187.8528z"
          fill="#80B7F9"
        ></path>
        <path
          d="M652.8 481.2288l-117.8112-91.4432a40.4224 40.4224 0 0 0-51.2-0.0512L371.5584 481.28c-17.3056 14.1312-19.9168 39.5776-5.7856 56.8832a40.45824 40.45824 0 0 0 56.8832 5.7856l48.9984-39.9872v381.0304c0 22.3232 18.1248 40.448 40.448 40.448s40.448-18.1248 40.448-40.448V508.7744l48.896 34.9696a40.37632 40.37632 0 0 0 25.6 9.1648c11.7248 0 23.296-5.0688 31.2832-14.7968a40.25344 40.25344 0 0 0-5.5296-56.8832z"
          fill="#80B7F9"
        ></path>
        <path
          d="M552.6016 769.1776V508.7744l48.896 34.9696a40.37632 40.37632 0 0 0 25.6 9.1648c11.7248 0 23.296-5.0688 31.2832-14.7968 14.1824-17.2544 11.6224-42.752-5.632-56.9344l-117.8112-91.4432a40.4224 40.4224 0 0 0-51.2-0.0512L371.5584 481.28c-17.3056 14.1312-19.9168 39.5776-5.7856 56.8832a40.45824 40.45824 0 0 0 56.8832 5.7856l48.9984-39.9872v265.216h80.9472z"
          fill="#3E8BF8"
        ></path>
      </svg>
    </button>
    <div class="app-bar">
      <input
        type="search"
        v-model="search"
        aria-label="Search"
        placeholder="输入文件名检索文件"
      />
      <div class="menu-button">
        <button class="circle" @click="showMenu = true">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            style="margin-left: 8px; margin-right: 5px"
          >
            <path
              d="M957.397333 479.744L1024 563.370667v0.085333L888.96 768 810.666667 726.186667V42.666667h90.026666v523.093333l56.704-86.016zM554.666667 554.837333v-85.333333H0v85.333333h554.666667zM1024 981.162667v-85.333334H0v85.333334h1024zM554.666667 128V42.666667H0v85.333333h554.666667z"
              fill="#000000"
            ></path>
          </svg>
        </button>
        <Menu
          v-model="showMenu"
          :items="[
            { text: '名称 A-Z' },
            { text: '从大到小 ↑' },
            { text: '从小到大 ↓' },
          ]"
          @click="onMenuClick"
        />
      </div>
    </div>
    <ul class="file-list">
      <li v-if="cwd !== ''">
        <div
          tabindex="0"
          class="file-item"
          style="cursor: pointer"
          @click="cwd = cwd.replace(/[^\/]+\/$/, '')"
          @contextmenu.prevent
        >
          <div class="file-icon">
            <img
              src="https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/4.0.0/png/file/folder/materialicons/36dp/2x/baseline_folder_black_36dp.png"
              width="36"
              height="36"
              alt="Folder"
            />
          </div>
          <span class="file-name">返回上一级..</span>
        </div>
      </li>
      <transition-group :name="isDeleting ? 'fileList' : ''" mode="out-in">
        <li v-for="folder in filteredFolders" :key="folder">
          <div
            tabindex="0"
            class="file-item"
            @contextmenu.prevent="
              showContextMenu = true;
              focusedItem = folder;
            "
          >
            <div
              style="cursor: pointer; position: relative"
              class="file-icon"
              @click="cwd = folder"
            >
              <MimeIcon thumbnail="assets/images/file-folder.svg" :size="42" />
              <template v-if="FolderQQ[folder.match(/.*?([^/]*)\/?$/)[1]]">
                <img
                  style="
                    height: 22px;
                    position: absolute;
                    left: 14px;
                    top: 15px;
                    border-radius: 50%;
                    filter: opacity(0.8);
                  "
                  :src="`https://q1.qlogo.cn/g?b=qq&nk=${
                    FolderQQ[folder.match(/.*?([^/]*)\/?$/)[1]]
                  }&s=640`"
                />
              </template>
            </div>
            <span
              @click="cwd = folder"
              class="file-name"
              style="cursor: pointer"
              >{{ folder.match(/.*?([^/]*)\/?$/)[1] }}</span
            >
            <div
              class="contextmenu-button"
              @click.stop="
                showContextMenu = true;
                focusedItem = folder;
              "
            >
              <svg
                t="1728718960353"
                class="icon"
                viewBox="0 0 4096 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="43249"
                width="15"
                height="15"
              >
                <path
                  d="M3245.397333 472.746667c0 232.106667 178.517333 419.84 399.018667 419.84s399.36-187.733333 399.36-419.84c0-232.106667-178.858667-420.181333-399.36-420.181334-220.501333 0-399.36 187.733333-399.36 419.84z m-798.378666 0C2447.36 240.64 2268.501333 52.565333 2048 52.565333s-399.36 187.733333-399.36 419.84c0 232.106667 178.858667 420.181333 399.36 420.181334 220.501333 0 399.36-187.733333 399.36-419.84z m-1596.416 0c0-232.106667-178.517333-420.181333-399.018667-420.181334s-399.36 187.733333-399.36 419.84c0 232.106667 178.858667 420.181333 399.36 420.181334 105.813333 0 207.530667-44.373333 282.282667-122.88 75.093333-78.506667 116.736-185.685333 116.736-296.96z"
                  fill="#000000"
                  p-id="43250"
                ></path>
              </svg>
            </div>
          </div>
        </li>
        <li v-for="file in filteredFiles" :key="file.key">
          <div
            @contextmenu.prevent="
              showContextMenu = true;
              focusedItem = file;
            "
          >
            <div class="file-item">
              <MimeIcon
                style="cursor: pointer"
                @click="preview(`/raw/${file.key}`)"
                :content-type="file.httpMetadata.contentType"
                :thumbnail="
                  file.customMetadata.thumbnail
                    ? `/raw/_$flaredrive$/thumbnails/${file.customMetadata.thumbnail}.png`
                    : getFileIcon(file)
                    ? getFileIcon(file)
                    : null
                "
              />
              <div style="cursor: pointer" @click="preview(`/raw/${file.key}`)">
                <div class="file-name" v-text="file.key.split('/').pop()"></div>
                <div class="file-attr">
                  <span
                    v-text="new Date(file.uploaded).toLocaleString()"
                  ></span>
                  <span v-text="formatSize(file.size)"></span>
                </div>
              </div>
              <div
                class="contextmenu-button"
                @click.stop="
                  showContextMenu = true;
                  focusedItem = file;
                "
              >
                <svg
                  t="1728718960353"
                  class="icon"
                  viewBox="0 0 4096 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="43249"
                  width="15"
                  height="15"
                >
                  <path
                    d="M3245.397333 472.746667c0 232.106667 178.517333 419.84 399.018667 419.84s399.36-187.733333 399.36-419.84c0-232.106667-178.858667-420.181333-399.36-420.181334-220.501333 0-399.36 187.733333-399.36 419.84z m-798.378666 0C2447.36 240.64 2268.501333 52.565333 2048 52.565333s-399.36 187.733333-399.36 419.84c0 232.106667 178.858667 420.181333 399.36 420.181334 220.501333 0 399.36-187.733333 399.36-419.84z m-1596.416 0c0-232.106667-178.517333-420.181333-399.018667-420.181334s-399.36 187.733333-399.36 419.84c0 232.106667 178.858667 420.181333 399.36 420.181334 105.813333 0 207.530667-44.373333 282.282667-122.88 75.093333-78.506667 116.736-185.685333 116.736-296.96z"
                    fill="#333333"
                    p-id="43250"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </li>
      </transition-group>
    </ul>
    <div v-if="loading" style="margin-top: 12px; text-align: center">
      <span>加载中...</span>
    </div>
    <div
      v-else-if="!filteredFiles.length && !filteredFolders.length"
      style="
        margin-top: 12px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      "
    >
      <img width="120" src="assets/images/empty.gif" />
      <span style="color: #858585; font-size: 13px">空！！！</span>
    </div>
    <Dialog v-model="showContextMenu">
      <div class="focused-item-icon">
        <img
          :src="
            typeof focusedItem === 'string'
              ? 'assets/images/file-folder.svg'
              : focusedItem.customMetadata.thumbnail
              ? `/raw/_$flaredrive$/thumbnails/${focusedItem.customMetadata.thumbnail}.png`
              : getFileIcon(focusedItem)
              ? getFileIcon(focusedItem)
              : null
          "
          width="80"
        />
        <p style="margin: 0">{{ focusedItem.key || focusedItem }}</p>
      </div>
      <div class="contextmenu-filename" @click.stop.prevent>选择操作</div>
      <ul v-if="typeof focusedItem === 'string'" class="contextmenu-list">
        <li>
          <button @click="copyLink(`/?p=${encodeURIComponent(focusedItem)}`)">
            <span>复制链接</span>
          </button>
        </li>
        <li>
          <button
            style="color: red"
            @click="removeFile(focusedItem + '_$folder$')"
          >
            <span>删除</span>
          </button>
        </li>
      </ul>
      <ul v-else class="contextmenu-list">
        <li>
          <button @click="renameFile(focusedItem.key)">
            <span>重命名</span>
          </button>
        </li>
        <li>
          <a :href="`/raw/${focusedItem.key}`" target="_blank" download>
            <span>下载</span>
          </a>
        </li>
        <li>
          <button @click="clipboard = focusedItem.key">
            <span>复制</span>
          </button>
        </li>
        <li>
          <button @click="copyLink(`/raw/${focusedItem.key}`)">
            <span>复制链接</span>
          </button>
        </li>
        <li>
          <button style="color: red" @click="removeFile(focusedItem.key)">
            <span>删除</span>
          </button>
        </li>
      </ul>
    </Dialog>
  </div>
</template>

<script>
import {
  generateThumbnail,
  blobDigest,
  multipartUpload,
  SIZE_LIMIT,
} from "/assets/main.mjs";
import Dialog from "./Dialog.vue";
import Menu from "./Menu.vue";
import MimeIcon from "./MimeIcon.vue";
import UploadPopup from "./UploadPopup.vue";

export default {
  data: () => ({
    cwd: new URL(window.location).searchParams.get("p") || "",
    files: [],
    folders: [],
    clipboard: null,
    focusedItem: null,
    loading: false,
    order: null,
    search: "",
    showContextMenu: false,
    showMenu: false,
    showUploadPopup: false,
    uploadProgress: null,
    uploadQueue: [],
    uploadLoading: null,
    isDeleting: false,
    FolderQQ: {
      ZhaoYU: "2496091142",
      Tina: "1478367130",
      ZhaoYuxuan: "1812028206",
      ZhaoTengye: "3072969190",
      ZhangRuili: "3099215275",
    },
  }),

  computed: {
    filteredFiles() {
      let files = this.files;
      if (this.search) {
        files = files.filter((file) => file.key.includes(this.search));
      }
      return files;
    },

    filteredFolders() {
      let folders = this.folders;
      if (this.search) {
        folders = folders.filter((folder) => folder.includes(this.search));
      }
      return folders;
    },
  },

  methods: {
    copyLink(link) {
      const url = new URL(link, window.location.origin);
      navigator.clipboard.writeText(url.toString());
    },
    getFileIcon(filtInfo) {
      const { httpMetadata, key } = filtInfo;
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
      switch (mimeType) {
        case "application/vnd.android.package-archive":
          return "assets/images/apk.svg"; // 安卓APK图标
        case "audio/mpeg":
          return "assets/images/mp3.svg"; // MP3音频图标
        case "audio/flac":
          return "assets/images/flac.svg"; // FLAC音频图标
        case "video/x-msvideo": // AVI视频图标
        case "video/mp4":
          return "assets/images/mp4.svg"; // MP4视频图标
        case "application/javascript":
          return "assets/images/javascript.svg"; // JavaScript图标
        case "text/html":
          return "assets/images/html.svg"; // HTML图标
        case "text/css":
          return "assets/images/css.svg"; // CSS图标
        case "text/x-vue":
          return "assets/images/vuejs.svg"; // Vue图标
        case "application/java-archive":
        case "text/x-java-source":
          return "assets/images/java.svg"; // Java图标
        case "application/x-python-code":
        case "text/x-python":
          return "assets/images/python.svg"; // Python图标
        case "text/x-csrc":
        case "text/x-c++src":
          return "assets/images/c.svg"; // C/C++图标
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        case "application/x-cfb":
          return "assets/images/excel.svg"; // Excel图标路径
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          return "assets/images/ppt.svg"; // PowerPoint图标路径
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return "assets/images/word.svg"; // Word图标路径
        case "application/zip":
          return "assets/images/winrar.svg"; // ZIP文件图标路径
        default:
          return "assets/images/file.svg";
      }
    },
    async copyPaste(source, target) {
      const uploadUrl = `/api/write/items/${target}`;
      await axios.put(uploadUrl, "", {
        headers: { "x-amz-copy-source": encodeURIComponent(source) },
      });
    },

    async createFolder() {
      try {
        const folderName = window.prompt("请输入文件夹名称");
        if (!folderName) {
          cocoMessage.error("玩呢？？？？");
          return;
        }
        this.showUploadPopup = false;
        const uploadUrl = `/api/write/items/${this.cwd}${folderName}/_$folder$`;
        const res = await axios.put(uploadUrl, "");
        const folderKey = res.data.key.replace("_$folder$", "");
        this.folders.push(folderKey);
        cocoMessage.success("创建成功");
      } catch (error) {
        fetch("/api/write/")
          .then((value) => {
            if (value.redirected) window.location.href = value.url;
          })
          .catch();
      }
    },

    fetchFiles() {
      this.files.length = 0;
      this.folders.length = 0;
      this.loading = true;
      fetch(`/api/children/${this.cwd}`)
        .then((res) => res.json())
        .then((files) => {
          this.files = files.value;
          if (this.order) {
            this.files.sort((a, b) => {
              if (this.order === "size") {
                return b.size - a.size;
              }
            });
          }
          this.folders = files.folders;
          this.loading = false;
        });
    },

    formatSize(size) {
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      while (size >= 1024) {
        size /= 1024;
        i++;
      }
      return `${size.toFixed(1)} ${units[i]}`;
    },

    onDrop(ev) {
      let files;
      if (ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items]
          .filter((item) => item.kind === "file")
          .map((item) => item.getAsFile());
      } else files = ev.dataTransfer.files;
      this.uploadFiles(files);
    },

    onMenuClick(text) {
      switch (text) {
        case "名称 A-Z":
          this.order = null;
          break;
        case "从大到小 ↑":
          this.order = "从大到小 ↑";
          break;
        case "从小到大 ↓":
          this.order = "从小到大 ↓";
          break;
        // case "粘贴":
        //   return this.pasteFile();
      }
      this.files.sort((a, b) => {
        if (this.order === "从小到大 ↓") {
          return a.size - b.size;
        } else if (this.order === "从大到小 ↑") {
          return b.size - a.size;
        } else {
          return a.key.localeCompare(b.key);
        }
      });
    },

    onUploadClicked(fileElement) {
      if (!fileElement.value) return;
      this.uploadFiles(fileElement.files);
      this.showUploadPopup = false;
      fileElement.value = null;
    },

    preview(filePath) {
      window.open(filePath);
    },

    async pasteFile() {
      if (!this.clipboard) return;
      let newName = window.prompt("Rename to:");
      if (newName === null) return;
      if (newName === "") newName = this.clipboard.split("/").pop();
      await this.copyPaste(this.clipboard, `${this.cwd}${newName}`);
      this.fetchFiles();
    },

    async processUploadQueue() {
      if (!this.uploadQueue.length) {
        this.fetchFiles();
        // cocoMessage.success("上传完成");
        this.uploadLoading();
        this.uploadLoading = null;
        this.uploadProgress = null;
        return;
      }
      this.uploadLoading ??= cocoMessage.loading("正在上传中...");
      const { basedir, file } = this.uploadQueue.pop(0);
      let thumbnailDigest = null;

      if (file.type.startsWith("image/") || file.type === "video/mp4") {
        try {
          const thumbnailBlob = await generateThumbnail(file);
          const digestHex = await blobDigest(thumbnailBlob);

          const thumbnailUploadUrl = `/api/write/items/_$flaredrive$/thumbnails/${digestHex}.png`;
          try {
            await axios.put(thumbnailUploadUrl, thumbnailBlob);
            thumbnailDigest = digestHex;
          } catch (error) {
            fetch("/api/write/")
              .then((value) => {
                if (value.redirected) window.location.href = value.url;
              })
              .catch(() => {});
            console.log(`Upload ${digestHex}.png failed`);
          }
        } catch (error) {
          console.log(`Generate thumbnail failed`);
        }
      }

      try {
        const uploadUrl = `/api/write/items/${basedir}${file.name}`;
        const headers = {};
        const onUploadProgress = (progressEvent) => {
          var percentCompleted =
            (progressEvent.loaded * 100) / progressEvent.total;
          this.uploadProgress = percentCompleted;
        };
        if (thumbnailDigest) headers["fd-thumbnail"] = thumbnailDigest;
        if (file.size >= SIZE_LIMIT) {
          await multipartUpload(`${basedir}${file.name}`, file, {
            headers,
            onUploadProgress,
          });
        } else {
          await axios.put(uploadUrl, file, { headers, onUploadProgress });
        }
      } catch (error) {
        fetch("/api/write/")
          .then((value) => {
            if (value.redirected) window.location.href = value.url;
          })
          .catch(() => {});
        console.log(`Upload ${file.name} failed`, error);
      }
      setTimeout(this.processUploadQueue);
    },

    async removeFile(key) {
      const DeleteFlag = window.confirm(
        `确定要删除 ${key.replace("/_$folder$", "")} ？`
      );
      if (DeleteFlag) {
        await axios.delete(`/api/write/items/${key}`);
        const targetRef = key.includes("_$folder$") ? this.folders : this.files;
        if (key.includes("_$folder$")) {
          key = key.replace("_$folder$", "");
        }
        this.isDeleting = true;
        const fileIndex = targetRef.findIndex(
          (file) => (file.key ?? file) === key
        );
        if (fileIndex !== -1) {
          targetRef.splice(fileIndex, 1);
          cocoMessage.success("删除成功", 3000);
          setTimeout(() => {
            this.isDeleting = false;
          }, 400);
        }
      }
    },

    async renameFile(key) {
      const fileSplit = key.split(".");
      const fileType = fileSplit.pop();
      const fileName = fileSplit.join(".");
      const newName = window.prompt("重命名为:", fileName);
      if (!newName) return;
      await this.copyPaste(key, `${this.cwd}${newName}.${fileType}`);
      await axios.delete(`/api/write/items/${key}`);
      this.isDeleting = true;
      const targetFile = this.files.find((file) => file.key === key);
      if (targetFile) {
        targetFile.key = `${newName}.${fileType}`;
        cocoMessage.success(`我重生了,这一世我叫【${newName}】`);
        setTimeout(() => {
          this.isDeleting = false;
        }, 400);
      }
    },

    uploadFiles(files) {
      if (this.cwd && !this.cwd.endsWith("/")) this.cwd += "/";

      const uploadTasks = Array.from(files).map((file) => ({
        basedir: this.cwd,
        file,
      }));
      this.uploadQueue.push(...uploadTasks);
      setTimeout(() => this.processUploadQueue());
    },
  },

  watch: {
    cwd: {
      handler() {
        this.fetchFiles();
        const url = new URL(window.location);
        if ((url.searchParams.get("p") || "") !== this.cwd) {
          this.cwd
            ? url.searchParams.set("p", this.cwd)
            : url.searchParams.delete("p");
          window.history.pushState(null, "", url.toString());
        }
        document.title = `${
          this.cwd.replace(/.*\/(?!$)|\//g, "") || "/"
        } - 文件库`;
      },
      immediate: true,
    },
    showUploadPopup(val) {
      document.body.style.overflow = val ? "hidden" : "";
    },
    showContextMenu(val) {
      document.body.style.overflow = val ? "hidden" : "";
    },
    showMenu(val) {
      document.body.style.overflow = val ? "hidden" : "";
    },
  },

  created() {
    window.addEventListener("popstate", (ev) => {
      const searchParams = new URL(window.location).searchParams;
      if (searchParams.get("p") !== this.cwd)
        this.cwd = searchParams.get("p") || "";
    });
  },

  components: {
    Dialog,
    Menu,
    MimeIcon,
    UploadPopup,
  },
};
</script>

<style>
.fileList-move,
.fileList-enter-active,
.fileList-leave-active {
  position: relative;
  transition: all 0.666s cubic-bezier(0.55, 0, 0.1, 1);
}
.fileList-leave-to {
  opacity: 0;
  width: 50%;
  transform: scale(0.1) translate(30px, -50%) rotate3d(1, 1, 1, 240deg);
}
.fileList-leave-active {
  position: absolute;
  bottom: 0;
}

.main {
  height: 100%;
}

.app-bar {
  position: sticky;
  top: 0;
  padding: 8px;
  background-color: #ffffff37;
  display: flex;
  box-shadow: 0px -3px 13px 0px #00000073;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.menu-button {
  display: flex;
  position: relative;
  margin-left: 4px;
}

.menu-button > button {
  transition: background-color 0.2s ease;
}

.menu-button > button:hover {
  background-color: whitesmoke;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
}
</style>
