"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export function ImageWithFallback({ src, alt, className = "", fallbackSrc, onLoad, onError }: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [retryCount, setRetryCount] = useState(0)

  const getRandomFallback = () => {
    // Use more themed placeholders for better visual appeal
    const themes = [
      "gift-box",
      "treasure-chest",
      "diamond-ring",
      "gold-coin",
      "silver-medal",
      "bronze-trophy",
      "crystal-ball",
      "gem-stone",
      "magic-wand",
      "crown-jewel",
      "precious-stone",
      "luxury-item",
    ]
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]
    return `https://picsum.photos/150/150?random=${randomTheme}_${Math.random().toString(36).substring(7)}`
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)

    if (retryCount < 3) {
      // Try different fallback sources
      if (retryCount === 0 && fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc)
        setRetryCount(1)
        return
      } else if (retryCount === 1) {
        // Try a themed placeholder
        setCurrentSrc(getRandomFallback())
        setRetryCount(2)
        return
      } else if (retryCount === 2) {
        // Try another themed placeholder
        setCurrentSrc(getRandomFallback())
        setRetryCount(3)
        return
      }
    }

    setHasError(true)
    onError?.()
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      {hasError ? (
        <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 mx-auto mb-1 bg-gray-600 rounded"></div>
            <span className="text-xs">No Image</span>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc || "/placeholder.svg"}
          alt={alt}
          className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  )
}
