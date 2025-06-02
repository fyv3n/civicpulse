import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  increment,
  updateDoc,
} from "firebase/firestore"
import { db } from "./config"

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Timestamp | string
  author: {
    name: string
    avatar?: string | undefined
  }
}

export async function addComment(postId: string, content: string, userId: string, author: { name: string; avatar?: string }) {
  try {
    const commentData = {
      postId,
      userId,
      content,
      author: {
        name: author.name,
        avatar: author.avatar || null
      },
      createdAt: serverTimestamp(),
    }

    const commentRef = await addDoc(collection(db, "comments"), commentData)

    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      commentCount: increment(1),
      updatedAt: serverTimestamp()
    })
    
    return commentRef.id
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const commentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(commentsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[]
  } catch (error) {
    console.error("Error getting comments:", error)
    throw error
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    await deleteDoc(doc(db, "comments", commentId))

    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      commentCount: increment(-1),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
} 