"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface MediaPreviewProps {
  mediaUrls: string[]
}

export default function MediaPreview({ mediaUrls }: MediaPreviewProps) {
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null)

  if (!mediaUrls.length) return null

  const isVideo = (url: string) => {
    return url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".avi")
  }

  return (
    <>
      <div className={`grid gap-2 ${mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {mediaUrls.slice(0, 4).map((url, index) => (
          <div
            key={index}
            className="relative rounded-md overflow-hidden cursor-pointer"
            onClick={() => setExpandedMedia(url)}
          >
            {isVideo(url) ? (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <video src={url} className="w-full h-full object-cover" controls={false} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="white" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100">
                <img src={url || "/placeholder.svg"} alt="Media content" className="w-full h-full object-cover" />
              </div>
            )}

            {index === 3 && mediaUrls.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-lg font-medium">+{mediaUrls.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {expandedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <button
            className="absolute top-4 right-4 text-white p-2 bg-black/20 rounded-full"
            onClick={() => setExpandedMedia(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-4xl max-h-[80vh]">
            {isVideo(expandedMedia) ? (
              <video src={expandedMedia} className="max-w-full max-h-[80vh]" controls autoPlay />
            ) : (
              <img
                src={expandedMedia || "/placeholder.svg"}
                alt="Expanded media"
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
