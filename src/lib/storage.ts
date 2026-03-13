import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadCardFile(
  file: File,
  type: "image" | "pdf"
): Promise<string> {
  const extension = type === "pdf" ? "pdf" : file.name.split(".").pop();
  const fileName = `wedding-card.${extension}`;
  const storageRef = ref(storage, `cards/${fileName}`);

  const contentType = type === "pdf" ? "application/pdf" : file.type;
  await uploadBytes(storageRef, file, {
    contentType,
  });

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function deleteCardFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
