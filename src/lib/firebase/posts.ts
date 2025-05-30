import { db } from "./config"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"

export interface Post {
  id?: string
  userId: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string
    avatar?: string
    trustScore: number
    isVerified: boolean
  }
  location: string
  mediaUrls?: string[]
  isEmergency: boolean
  status: "pending" | "verified" | "resolved" | "false_alarm"
  commentCount: number
}

const postsCollection = collection(db, "posts")

export async function createPost(post: Omit<Post, "id">) {
  try {
    if (!post.userId) {
      throw new Error("userId is required to create a post")
    }
    
    const docRef = await addDoc(postsCollection, {
      ...post,
      createdAt: Timestamp.fromDate(post.createdAt),
    })
    return { id: docRef.id, ...post }
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export async function updatePost(id: string, data: Partial<Post>) {
  try {
    const postRef = doc(db, "posts", id)
    await updateDoc(postRef, {
      ...data,
      ...(data.createdAt && { createdAt: Timestamp.fromDate(data.createdAt) }),
    })
    return { id, ...data }
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

export async function deletePost(id: string) {
  try {
    const postRef = doc(db, "posts", id)
    await deleteDoc(postRef)
    return id
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

export async function getPosts(options?: {
  limit?: number
  status?: Post["status"]
  isEmergency?: boolean
}) {
  try {
    let q = query(postsCollection, orderBy("createdAt", "desc"))
    
    if (options?.status) {
      q = query(q, where("status", "==", options.status))
    }
    
    if (options?.isEmergency !== undefined) {
      q = query(q, where("isEmergency", "==", options.isEmergency))
    }
    
    if (options?.limit) {
      q = query(q, limit(options.limit))
    }

    const querySnapshot = await getDocs(q)
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    })) as Post[]

    return posts
  } catch (error) {
    console.error("Error getting posts:", error)
    throw error
  }
}

export async function getPostsByUserId(userId: string, options?: {
  limit?: number
  status?: Post["status"]
  isEmergency?: boolean
}) {
  try {
    let q = query(
      postsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    if (options?.status) {
      q = query(q, where("status", "==", options.status))
    }
    
    if (options?.isEmergency !== undefined) {
      q = query(q, where("isEmergency", "==", options.isEmergency))
    }
    
    if (options?.limit) {
      q = query(q, limit(options.limit))
    }

    const querySnapshot = await getDocs(q)
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    })) as Post[]

    return posts
  } catch (error) {
    console.error("Error getting user posts:", error)
    throw error
  }
} 