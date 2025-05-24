"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { createUser } from "@/lib/firebase/users"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// List of barangays in Olongapo City
const BARANGAYS = [
  "West Bajac-Bajac",
  // Add more barangays here as we expand
]

//todo: add a loading spinner when the user is signing up ✅
//todo: add a success message when the user is signed up ✅
//todo: add a error message when the user is not signed up ✅
//todo: add a verification email to the user ✅
//todo: add a verification code to the user ✅
//todo: add a verification button to the user ✅
//todo: add a verification input to the user ✅
//todo: verify the user after the verification button is clicked and if the code is correct, then the user is verified
//todo: if the code is incorrect, then the user is not verified and the user can try again
//todo: if the user is not verified, then the user can not create a post ✅
//todo: if the user is not verified, then the user can not comment on a post ✅
//todo: connect the signup page to the database ✅
//todo: connect the signup page to the firebase authentication ✅
//todo: connect the signup page to the firebase database, so each user has a unique id and a unique username so the user can be identified by their username, and the user can have a profile picture and a bio, and the user can have a trust score and a verification status, and see their own post thru their own profile page
//todo: connect the signup page to the firebase storage? Do i need to?


export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    barangay: "",
    password: "",
    termsAccepted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.termsAccepted) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      })
      return
    }

    if (!formData.barangay) {
      toast({
        title: "Barangay not selected",
        description: "Please select your barangay",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await createUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.barangay
      )

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      })

      router.push("/verify")
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-red-600"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span className="text-xl font-bold">CivicPulse</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Create an account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangay">Barangay</Label>
              <Select
                value={formData.barangay}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, barangay: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your barangay" />
                </SelectTrigger>
                <SelectContent>
                  {BARANGAYS.map((barangay) => (
                    <SelectItem key={barangay} value={barangay}>
                      {barangay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Currently only available for West Bajac-Bajac residents
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with a number and a special character.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="termsAccepted" 
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))
                }
                required 
                className="mt-1" 
              />
              <Label htmlFor="termsAccepted" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-red-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-red-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-red-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
