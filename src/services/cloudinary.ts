export async function uploadComprobanteToCloudinary(file: File): Promise<string> {
  const CLOUD_NAME = "dgwdgpwzq"; // tu cloud_name
  const UPLOAD_PRESET = "unsigned_preset"; // tu upload preset

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al subir archivo a Cloudinary");
  }

  const data = await res.json();
  return data.secure_url; // URL pública que podés guardar en Firestore
}
