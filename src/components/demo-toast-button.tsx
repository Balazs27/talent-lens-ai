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
          "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        }
      >
        {label}
      </button>
      {showToast && (
        <div className="absolute left-0 top-full mt-1.5 z-10 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
