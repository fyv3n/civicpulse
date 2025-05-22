"use client"

import type React from "react"

import { useState } from "react"
import { Camera, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PostForm() {
  const [isEmergency, setIsEmergency] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("")
  const [media, setMedia] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log({ title, content, location, isEmergency, media })
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
            required
          />
        </div>

        <div>
          <Textarea
            placeholder="What's happening in your barangay?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px]"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <Input
                type="file"
                id="media-upload"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
              />
              <Label htmlFor="media-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Camera className="h-5 w-5" />
                  <span>Add Media</span>
                </div>
              </Label>
            </div>

            {media.length > 0 && (
              <span className="text-sm text-gray-500">
                {media.length} file{media.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Switch id="emergency-toggle" checked={isEmergency} onCheckedChange={setIsEmergency} />
            <Label htmlFor="emergency-toggle" className="flex items-center gap-1 cursor-pointer">
              <AlertTriangle className={`h-4 w-4 ${isEmergency ? "text-red-600" : "text-gray-500"}`} />
              <span className={isEmergency ? "text-red-600 font-medium" : "text-gray-600"}>Mark as Emergency</span>
            </Label>
          </div>
        </div>

        {isEmergency && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
            <p className="font-medium">Important:</p>
            <p>
              Only mark posts as emergencies for genuine urgent situations. False alarms may affect your trust score.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Post to Community
          </Button>
        </div>
      </div>
    </form>
  )
}
