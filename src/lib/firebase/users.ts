import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User,
  applyActionCode,
  checkActionCode
} from "firebase/auth"
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore"
import { auth, db } from "./config"

export type UserRole = "user" | "admin" | "moderator"

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  barangay: string
  photoURL?: string
  bio?: string
  trustScore: number
  isVerified: boolean
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  barangay: string
): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    })

    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, "id"> = {
      email: user.email!,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      barangay,
      trustScore: 0,
      isVerified: false,
      role: "user", // Default role
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    // Send verification email
    await sendEmailVerification(user)

    return user
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return null
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    } as UserProfile
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      role,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(userId)
    return userProfile?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function isModerator(userId: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(userId)
    return userProfile?.role === "moderator" || userProfile?.role === "admin"
  } catch (error) {
    console.error("Error checking moderator status:", error)
    return false
  }
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("displayName", "==", username))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  } catch (error) {
    console.error("Error checking username availability:", error)
    throw error
  }
}

export async function verifyEmail(code: string): Promise<void> {
  try {
    // Verify the action code
    await checkActionCode(auth, code)
    
    // Apply the verification code
    await applyActionCode(auth, code)
    
    // Update user's verification status in Firestore
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userRef, {
        isVerified: true,
        updatedAt: new Date()
      })
    }
  } catch (error) {
    console.error("Error verifying email:", error)
    throw error
  }
}

export async function resendVerificationEmail(): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in")
    }
    
    await sendEmailVerification(auth.currentUser)
  } catch (error) {
    console.error("Error resending verification email:", error)
    throw error
  }
} 