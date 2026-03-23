const CLOUD_NAME = "dxqyhoiyv";
const UPLOAD_PRESET = "travelog_upload";

export interface UploadResult {
  url: string;
  publicId: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`파일 크기 초과: ${isVideo ? "영상 100MB" : "사진 10MB"} 이하만 가능합니다`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "travelog");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const resourceType = isVideo ? "video" : "image";
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          type: isVideo ? "video" : "image",
          width: data.width,
          height: data.height,
        });
      } else {
        reject(new Error("업로드 실패: " + xhr.responseText));
      }
    };

    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.send(formData);
  });
}

export async function uploadMultiple(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToCloudinary(files[i], (progress) => {
      if (onProgress) onProgress(i, progress);
    });
    results.push(result);
  }
  return results;
}

export function getOptimizedUrl(publicId: string, width = 800, height = 600): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
}

export function getThumbnailUrl(publicId: string): string {
  return getOptimizedUrl(publicId, 400, 300);
}