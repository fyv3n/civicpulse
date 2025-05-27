import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User,
  applyActionCode,
  deleteUser
} from "firebase/auth"
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FieldValue
} from "firebase/firestore"
import { Timestamp } from "firebase-admin/firestore"
import { auth, db } from "./config"
import { FirebaseError } from "firebase/app"

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
  createdAt: Date | Timestamp | FieldValue
  updatedAt: Date | Timestamp | FieldValue
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
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
      updatedAt: serverTimestamp()
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

// Add this new function to sync verification status
async function syncVerificationStatus(user: User): Promise<void> {
  if (!user) return;
  
  try {
    // Force refresh the user to get the latest email verification status
    await user.reload();
    
    // Update Firestore with the latest verification status
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      isVerified: user.emailVerified,
      updatedAt: serverTimestamp()
    });
    
    console.log("Verification status synced successfully");
  } catch (error) {
    console.error("Error syncing verification status:", error);
    throw error;
  }
}

export async function verifyEmail(oobCode: string): Promise<void> {
  try {
    console.log("Starting email verification process...")
    
    // Apply the verification code
    try {
      await applyActionCode(auth, oobCode);
      console.log("Verification code applied successfully");
    } catch (error: unknown) {
      console.error("Error applying verification code:", error);
      if (error instanceof FirebaseError) {
        throw new Error("Invalid or expired verification link");
      }
      throw error;
    }

    // Get the current user after verification
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user found after verification");
    }

    // Sync the verification status with Firestore
    await syncVerificationStatus(user);
    
    console.log("Email verification process completed successfully");
  } catch (error: unknown) {
    console.error("Email verification failed:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: error instanceof FirebaseError ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Also add a listener to keep verification status in sync
export function setupVerificationListener() {
  if (!auth.currentUser) return;

  // Set up listener for auth state changes
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        await syncVerificationStatus(user);
      } catch (error) {
        console.error("Error in verification listener:", error);
      }
    }
  });
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

export async function deleteUserAccount(): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in")
    }

    const userId = auth.currentUser.uid

    try {
      // Delete user document from Firestore first
      await deleteDoc(doc(db, "users", userId))
    } catch (error: unknown) {
      // Handle Firestore deletion errors
      if (error instanceof FirebaseError && error.code === "permission-denied") {
        throw new Error("You don't have permission to delete your account. Please contact support.")
      }
      throw error
    }

    try {
      // Delete user from Firebase Auth
      await deleteUser(auth.currentUser)
    } catch (error: unknown) {
      // Handle Auth deletion errors
      if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
        throw new Error("For security reasons, please sign out and sign in again before deleting your account.")
      }
      throw error
    }

    console.log("User account deleted successfully")
  } catch (error) {
    console.error("Error deleting user account:", error)
    throw error
  }
} 