import { MapPin } from "lucide-react"

interface LocationTagProps {
  location: string
}

export default function LocationTag({ location }: LocationTagProps) {
  return (
    <div className="flex items-center text-gray-500 text-sm">
      <MapPin className="h-3 w-3 mr-1" />
      <span>{location}</span>
    </div>
  )
}
