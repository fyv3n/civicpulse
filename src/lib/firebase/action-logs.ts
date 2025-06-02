import { db } from "./config"
import { collection, addDoc, Timestamp } from "firebase/firestore"

export type ActionType = "user_role_update" | "post_status_update" | "post_report" | "user_verification"

interface ActionLogData {
  actionType: ActionType
  actionBy: {
    name: string
    role: string
  }
  target: {
    type: "user" | "post"
    id: string
    name: string
  }
  details: {
    from?: string
    to?: string
    note?: string
  }
  createdAt: Date
}

export async function logAction(data: Omit<ActionLogData, "createdAt">) {
  try {
    const actionLogsCollection = collection(db, "action_logs")
    
    // Create a clean data object without undefined values
    const cleanData = {
      ...data,
      details: {
        ...(data.details.from && { from: data.details.from }),
        ...(data.details.to && { to: data.details.to }),
        ...(data.details.note && { note: data.details.note })
      },
      createdAt: Timestamp.fromDate(new Date())
    }

    await addDoc(actionLogsCollection, cleanData)
  } catch (error) {
    console.error("Error logging action:", error)
    // Don't throw the error to prevent disrupting the main action
  }
} 