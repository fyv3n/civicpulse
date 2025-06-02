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
  increment,
  getDoc
} from "firebase/firestore"
import { logAction } from "./action-logs"

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
    role: "admin" | "moderator" | "user"
  }
  location: string
  mediaUrls?: string[]
  isEmergency: boolean
  status: "pending" | "verified" | "resolved" | "false_alarm"
  commentCount: number
  reportCount?: number
  reportReason?: string
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
    console.log("Getting posts for userId:", userId)
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
    console.log("Query snapshot size:", querySnapshot.size)
    console.log("Query snapshot docs:", querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    
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

export async function getFlaggedPosts(status: "pending" | "verified" | "resolved" | "false_alarm" = "pending") {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", status),
      where("reportCount", ">", 0),
      orderBy("reportCount", "desc"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Post[];
  } catch (error) {
    console.error("Error fetching flagged posts:", error);
    throw error;
  }
}

export async function reportPost(postId: string, reason: string, reporterId: string) {
  try {
    // Add report to reports collection
    await addDoc(collection(db, "moderation"), {
      postId,
      reason,
      reporterId,
      createdAt: new Date(),
      status: "pending"
    });

    // Update post's report count
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      reportCount: increment(1),
      status: "pending" // Mark as pending for moderator review
    });
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
}

interface PostUpdateData {
  status: "verified" | "resolved" | "false_alarm"
  updatedAt: Date
  moderatorNote?: string
  [key: string]: string | Date | undefined // More specific type for index signature
}

export async function updatePostStatus(
  postId: string, 
  status: "verified" | "resolved" | "false_alarm",
  moderatorNote?: string,
  moderator?: { name: string; role: string }
) {
  try {
    const postRef = doc(db, "posts", postId)
    const postDoc = await getDoc(postRef)
    const oldStatus = postDoc.data()?.status

    // Only include moderatorNote in the update if it's provided
    const updateData: PostUpdateData = {
      status,
      updatedAt: new Date()
    }

    if (moderatorNote) {
      updateData.moderatorNote = moderatorNote
    }

    await updateDoc(postRef, updateData)

    // Log the action if moderator info is provided
    if (moderator) {
      await logAction({
        actionType: "post_status_update",
        actionBy: moderator,
        target: {
          type: "post",
          id: postId,
          name: postDoc.data()?.title || "Untitled Post"
        },
        details: {
          from: oldStatus,
          to: status,
          note: moderatorNote || undefined
        }
      })
    }
  } catch (error) {
    console.error("Error updating post status:", error)
    throw error
  }
}

export async function getPostsForModeration(status: "pending" | "verified" | "resolved" | "false_alarm" = "pending") {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", status),
      where("isEmergency", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Post[];
  } catch (error) {
    console.error("Error fetching posts for moderation:", error);
    throw error;
  }
} 