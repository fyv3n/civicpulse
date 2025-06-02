import { storage } from "./config"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { FirebaseError } from "firebase/app"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries === 0) throw error
    
    if (error instanceof FirebaseError && error.code === 'storage/retry-limit-exceeded') {
      await wait(delay)
      return retryOperation(operation, retries - 1, delay * 2)
    }
    
    throw error
  }
}

export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }

    const storageRef = ref(storage, path)
    
    // Upload with retry logic
    await retryOperation(async () => {
      await uploadBytes(storageRef, file)
    })
    
    // Get download URL with retry logic
    const downloadURL = await retryOperation(async () => {
      return await getDownloadURL(storageRef)
    })
    
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
    throw error
  }
}

export async function uploadMultipleFiles(files: File[], basePath: string): Promise<string[]> {
  try {
    // Validate all files before starting upload
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File "${file.name}" exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      }
    }

    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`
      return uploadFile(file, path)
    })
    
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading multiple files:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to upload files: ${error.message}`)
    }
    throw error
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await retryOperation(async () => {
      await deleteObject(storageRef)
    })
  } catch (error) {
    console.error("Error deleting file:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
    throw error
  }
}

export async function deleteMultipleFiles(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map(url => deleteFile(url)))
  } catch (error) {
    console.error("Error deleting multiple files:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to delete files: ${error.message}`)
    }
    throw error
  }
} 