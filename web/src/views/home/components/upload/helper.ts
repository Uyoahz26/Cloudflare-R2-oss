import { post, put } from "@/hooks/useRequest";
import type { RequestOptions } from "@/hooks/useRequest/types";

const THUMBNAIL_SIZE = 144;
export const SIZE_LIMIT = 100 * 1000 * 1000;

export async function uploadImgThumbnail(file: File): Promise<string> {
  const thumbnailBlob = await generateThumbnail(file);
  const digestHex = await blobDigest(thumbnailBlob);
  const thumbnailUploadUrl = `/api/write/items/_$flaredrive$/thumbnails/${digestHex}.png`;
  await put(thumbnailUploadUrl, thumbnailBlob).catch((e) => {
    throw new Error(e.message ?? `Failed to upload thumbnail`);
  });
  return digestHex;
}

export async function multipartUpload(key, file, options): Promise<void> {
  const headers = {
    "content-type": file.type,
    ...(options?.headers || {}),
  };
  const requestOptions: RequestOptions = {
    globalErrorMessage: false,
    globalSuccessMessage: false,
  };

  const { uploadId } = await post(`/api/write/items/${key}?uploads`, "", {
    headers,
    requestOptions,
  });
  if (!uploadId) throw new Error("Failed to initialize multipart upload");

  const totalChunks = Math.ceil(file.size / SIZE_LIMIT);

  async function uploadChunk(partNumber, chunk) {
    const searchParams = new URLSearchParams({ partNumber, uploadId });
    const response = await put(
      `/api/write/items/${key}?${searchParams}`,
      chunk,
      {
        requestOptions: {
          ...requestOptions,
          globalReturnHeaders: true,
        },
        onUploadProgress(progressEvent) {
          if (typeof options?.onUploadProgress === "function") {
            options.onUploadProgress({
              loaded: (partNumber - 1) * SIZE_LIMIT + progressEvent.loaded,
              total: file.size,
            });
          }
        },
      }
    );

    return {
      partNumber,
      etag: response.headers.etag,
    };
  }

  const uploadPromises = Array.from({ length: totalChunks }, (_, i) => {
    const partNumber = i + 1;
    const chunk = file.slice(i * SIZE_LIMIT, (i + 1) * SIZE_LIMIT);
    return uploadChunk(partNumber, chunk);
  });

  const uploadedParts = await Promise.all(uploadPromises);

  const completeParams = new URLSearchParams({ uploadId });
  await post(
    `/api/write/items/${key}?${completeParams}`,
    {
      parts: uploadedParts,
    },
    {
      requestOptions,
    }
  );
}

async function generateThumbnail(file: File): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;
  const ctx = canvas.getContext("2d")!;

  const objectURL = URL.createObjectURL(file);

  if (file.type.startsWith("image/")) {
    const image = await loadImage(objectURL);
    ctx.drawImage(image, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  } else if (file.type === "video/mp4") {
    const video = await loadVideo(objectURL);
    ctx.drawImage(video, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  }

  URL.revokeObjectURL(objectURL);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to generate thumbnail"));
      }
    });
  });
}

export async function blobDigest(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
  const digestArray = Array.from(new Uint8Array(digest));
  const digestHex = digestArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digestHex;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.src = src;

    const timeoutId = setTimeout(
      () => reject(new Error("Video load timeout")),
      2000
    );

    video.onloadeddata = () => {
      clearTimeout(timeoutId);
      video.currentTime = 0;
      resolve(video);
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Failed to load video"));
    };

    video.play().then(() => video.pause());
  });
}
