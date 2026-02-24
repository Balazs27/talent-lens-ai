"use client"

import { useState, useEffect } from "react"

interface DemoToastButtonProps {
  label: string
  toastMessage: string
  className?: string
}

export function DemoToastButton({
  label,
  toastMessage,
  className,
}: DemoToastButtonProps) {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 2500)
    return () => clearTimeout(timer)
  }, [showToast])

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowToast(true)}
        className={
          className ??
          "rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
        }
      >
        {label}
      </button>
      {showToast && (
        <div className="absolute left-0 top-full mt-1.5 z-10 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
