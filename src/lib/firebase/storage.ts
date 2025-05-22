import { storage } from "./config"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function uploadMultipleFiles(files: File[], basePath: string): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`
      return uploadFile(file, path)
    })
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading multiple files:", error)
    throw error
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export async function deleteMultipleFiles(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map(url => deleteFile(url)))
  } catch (error) {
    console.error("Error deleting multiple files:", error)
    throw error
  }
} 