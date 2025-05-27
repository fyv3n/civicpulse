"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: string
  title: string
  date: Date
  type: "drill" | "training" | "meeting" | "emergency"
}

interface CalendarWidgetProps {
  events?: Event[]
}

export default function CalendarWidget({ events = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const hasEvents = (day: number) => {
    return events.some((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })
  }

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day))
  }

  const renderCalendarDays = () => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEventForDay = hasEvents(day)

      days.push(
        <div
          key={day}
          className={`relative h-10 flex items-center justify-center cursor-pointer rounded-full
            ${isToday(day) ? "bg-red-100 text-red-600" : ""}
            ${isSelected(day) ? "bg-red-600 text-white" : ""}
            ${!isToday(day) && !isSelected(day) ? "hover:bg-gray-100" : ""}
          `}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {hasEventForDay && !isSelected(day) && (
            <div className="absolute bottom-1 w-1 h-1 bg-red-600 rounded-full"></div>
          )}
        </div>,
      )
    }

    return days
  }

  const getEventBadgeColor = (type: Event["type"]) => {
    switch (type) {
      case "drill":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "training":
        return "bg-green-100 text-green-800 border-green-200"
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Community Calendar</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-lg font-medium">
            {monthNames[month]} {year}
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
      </div>

      {selectedDate && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">
              Events for {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
            </h3>
          </div>

          {getEventsForDay(selectedDate.getDate()).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDay(selectedDate.getDate()).map((event) => (
                <div key={event.id} className="p-2 rounded-md border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.title}</span>
                    <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No events scheduled for this day.</p>
          )}
        </div>
      )}
    </div>
  )
}
