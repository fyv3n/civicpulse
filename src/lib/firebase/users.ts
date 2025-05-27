import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User,
  applyActionCode,
  checkActionCode,
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
  deleteDoc
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

export async function verifyEmail(oobCode: string): Promise<void> {
  try {
    console.log("Starting email verification process...")
    
    // Apply the verification code directly
    try {
      await applyActionCode(auth, oobCode);
      console.log("Verification code applied successfully");
    } catch (error: any) {
      console.error("Error applying verification code:", error);
      throw new Error("Invalid or expired verification link");
    }

    // Get the current user after verification
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user found after verification");
    }

    // Update user's verification status in Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isVerified: true,
        updatedAt: new Date()
      });
      console.log("Firestore user document updated successfully");
    } catch (error: any) {
      console.error("Error updating Firestore document:", error);
      throw new Error("Failed to update user verification status");
    }

    // Double check the verification is set
    const updatedUserDoc = await getDoc(doc(db, "users", user.uid));
    if (!updatedUserDoc.exists()) {
      throw new Error("User document not found after update");
    }

    const userData = updatedUserDoc.data();
    if (!userData.isVerified) {
      throw new Error("User verification status not properly updated");
    }

    console.log("Email verification process completed successfully");
  } catch (error: any) {
    console.error("Email verification failed:", {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
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

export async function deleteUserAccount(): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in")
    }

    const userId = auth.currentUser.uid

    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", userId))

    // Delete user from Firebase Auth
    await deleteUser(auth.currentUser)

    console.log("User account deleted successfully")
  } catch (error) {
    console.error("Error deleting user account:", error)
    throw error
  }
} 