'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in" style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
      <div className="bg-red-500/95 border-2 border-red-400 rounded-lg px-6 py-4 shadow-lg backdrop-blur-sm min-w-[300px]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="font-mono text-white font-bold text-sm flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors font-bold text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
