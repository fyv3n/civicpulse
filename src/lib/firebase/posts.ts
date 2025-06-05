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
  getDoc
} from "firebase/firestore"
import { logAction } from "./action-logs"
import { type AnalysisCache } from "@/app/api/backend/services/cacheService"

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
  status: "pending" | "verified" | "resolved" | "false alarm" | "auto flagged"
  commentCount: number
  reportCount?: number
  reportReason?: string
  aiAnalysis?: AnalysisCache['analysis'] | null
  aiFlagReason?: string | null
  combinedRiskScore?: number | null
}

const postsCollection = collection(db, "posts")

const MAX_USER_REPORTS_EFFECTIVE = 5
const WEIGHT_AI_SCORE = 0.6
const WEIGHT_USER_REPORTS = 0.4

function calculateCombinedRiskScore(
  aiAnalysis: AnalysisCache['analysis'] | undefined,
  reportCount: number
): number {
  let aiScoreContribution = 0
  if (aiAnalysis && typeof aiAnalysis.riskScore === 'number') {
    const validAiRiskScore = Math.min(Math.max(aiAnalysis.riskScore, 0), 1)
    aiScoreContribution = validAiRiskScore * WEIGHT_AI_SCORE
  } else if (aiAnalysis === undefined && reportCount > 0) {
  }

  const normalizedReportContribution = reportCount > 0 
    ? (Math.min(reportCount, MAX_USER_REPORTS_EFFECTIVE) / MAX_USER_REPORTS_EFFECTIVE) * WEIGHT_USER_REPORTS
    : 0
  
  const combinedScore = aiScoreContribution + normalizedReportContribution
  return Math.min(Math.max(combinedScore, 0), 1)
}

export async function createPost(
  postData: Omit<
    Post,
    "id" | "aiAnalysis" | "aiFlagReason" | "status" | "commentCount" | "reportCount" | "createdAt" | "combinedRiskScore"
  > & { createdAt?: Date; status?: Post["status"] }
) {
  try {
    if (!postData.userId) {
      throw new Error("userId is required to create a post")
    }

    let analysisData: AnalysisCache['analysis'] | undefined
    try {
      const response = await fetch('/api/posts/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: postData.title, content: postData.content }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorDetails = `Status: ${response.status}`
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorDetails += `, Data: ${JSON.stringify(errorData)}`
        } else {
          const errorText = await response.text()
          errorDetails += `, Response: ${errorText.substring(0, 100)}...`
        }
        console.error("Error fetching AI analysis from API:", errorDetails)
      } else {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          analysisData = await response.json()
        } else {
          const responseText = await response.text()
          console.error("Received non-JSON response from AI analysis API (OK status). Response:", responseText.substring(0,100) + "...")
        }
      }
    } catch (apiError) {
      console.error("Network or other error calling /api/posts/analyze:", apiError)
    }

    let status: Post["status"] = postData.status || (postData.isEmergency ? "pending" : "verified")
    let aiFlagReason: string | undefined = undefined
    let initialReportCount = 0

    const RISK_THRESHOLD = 0.5

    if (analysisData) {
      if (analysisData.riskScore > RISK_THRESHOLD || 
          analysisData.categories.includes("unsafe") || 
          analysisData.categories.includes("needs_moderation")) {
        status = "pending"
        aiFlagReason = `AI detected potential issues (Score: ${analysisData.riskScore.toFixed(
          2
        )}). Categories: ${analysisData.categories.join(", ")}. Reason: ${
          analysisData.explanation
        }`
        initialReportCount = 1
      } else if (analysisData.categories.includes("verified")) {
        status = "verified"
        aiFlagReason = `AI verified content as safe (Score: ${analysisData.riskScore.toFixed(
          2
        )}). Categories: ${analysisData.categories.join(", ")}. Reason: ${
          analysisData.explanation
        }`
      } else if (postData.isEmergency && status !== "pending") {
        status = "pending"
      }
    }
    
    const combinedRiskScore = calculateCombinedRiskScore(analysisData, initialReportCount)

    const finalPostData: Omit<Post, "id"> = {
      ...postData,
      createdAt: postData.createdAt || new Date(),
      aiAnalysis: analysisData || null,
      status,
      aiFlagReason: aiFlagReason || null,
      commentCount: 0,
      reportCount: initialReportCount,
      combinedRiskScore: Number.isNaN(combinedRiskScore) ? null : combinedRiskScore,
    }
    
    const docRef = await addDoc(postsCollection, {
      ...finalPostData,
      createdAt: Timestamp.fromDate(finalPostData.createdAt),
    })

    console.log(`Post created with ID: ${docRef.id}, Status: ${status}, AI Flag: ${aiFlagReason || 'None'}, Combined Risk: ${combinedRiskScore?.toFixed(2) || 'N/A'}`)
    return { id: docRef.id, ...finalPostData, createdAt: finalPostData.createdAt }
  } catch (error) {
    console.error("Error creating post (client-side):", error)
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
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error(`Post with ID ${postId} not found.`);
    }

    const postDataFromSnap = postSnap.data() as Post;
    let currentAiAnalysis = postDataFromSnap.aiAnalysis;
    let aiAnalysisWasFetched = false;

    if (!currentAiAnalysis) {
      console.log(`AI analysis missing for post ${postId} on client, fetching from API.`);
      try {
        const response = await fetch('/api/posts/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: postDataFromSnap.title, content: postDataFromSnap.content }),
        });
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            currentAiAnalysis = await response.json();
            aiAnalysisWasFetched = true;
          } else {
            const responseText = await response.text();
            console.error("Received non-JSON response from AI analysis API (OK status). Response:", responseText.substring(0,100) + "...");
          }
        } else {
          const contentType = response.headers.get("content-type");
          let errorDetails = `Status: ${response.status}`;
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorDetails += `, Data: ${JSON.stringify(errorData)}`;
          } else {
            const errorText = await response.text();
            errorDetails += `, Response: ${errorText.substring(0, 100)}...`;
          }
          console.error("Error fetching AI analysis from API during reportPost:", errorDetails);
        }
      } catch (apiError) {
        console.error("Network or other error calling /api/posts/analyze during reportPost:", apiError);
      }
    }

    await addDoc(collection(db, "moderation"), {
      postId,
      reason,
      reporterId,
      createdAt: new Date(),
      status: "pending",
      aiContextAtReportTime: currentAiAnalysis || null,
    });

    const newReportCount = (postDataFromSnap.reportCount || 0) + 1;
    const newCombinedRiskScore = calculateCombinedRiskScore(currentAiAnalysis === null ? undefined : currentAiAnalysis, newReportCount);

    const updatePayload: Partial<Post> = {
      reportCount: newReportCount,
      status: "pending",
      combinedRiskScore: Number.isNaN(newCombinedRiskScore) ? null : newCombinedRiskScore,
    };

    if (aiAnalysisWasFetched) {
      updatePayload.aiAnalysis = currentAiAnalysis || null;
    }

    await updateDoc(postRef, updatePayload);

    console.log(`Post ${postId} reported by ${reporterId} (client-side). New Combined Risk: ${newCombinedRiskScore?.toFixed(2) || 'N/A'}`);

  } catch (error) {
    console.error("Error reporting post (client-side):", error);
    throw error;
  }
}

interface PostUpdateData {
  status: "verified" | "resolved" | "false_alarm"
  updatedAt: Date
  moderatorNote?: string
  [key: string]: string | Date | undefined
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

    const updateData: PostUpdateData = {
      status,
      updatedAt: new Date()
    }

    if (moderatorNote) {
      updateData.moderatorNote = moderatorNote
    }

    await updateDoc(postRef, updateData)

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