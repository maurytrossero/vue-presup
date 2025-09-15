// src/services/cloudinaryService.ts
import imageCompression from 'browser-image-compression';

export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const CLOUD_NAME = "dgwdgpwzq";
  const UPLOAD_PRESET = "unsigned_preset";

  // Opcional: comprimir la imagen antes de subir
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  });

  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Error al subir archivo a Cloudinary");

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

export function getPixelatedUrl(url: string, nivel = 30): string {
  return url.replace('/upload/', `/upload/e_pixelate:${nivel}/`);
}
