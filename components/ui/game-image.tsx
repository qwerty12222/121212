"use client"

import { useState } from "react"
import { Loader2, Gift, Diamond, Crown, Star } from "lucide-react"
import { isTelegramSticker, getImageTheme } from "@/utils/image-utils"

interface GameImageProps {
  src: string
  alt: string
  className?: string
  itemId?: string
  rarity?: string
  type?: "item" | "case" | "logo"
  onLoad?: () => void
  onError?: () => void
}

export function GameImage({
  src,
  alt,
  className = "",
  itemId = "",
  rarity = "common",
  type = "item",
  onLoad,
  onError,
}: GameImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [retryCount, setRetryCount] = useState(0)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)

    if (retryCount < 3) {
      // Try different fallback sources
      if (retryCount === 0) {
        // First try: Use our image cache API
        const encodedUrl = encodeURIComponent(src)
        setCurrentSrc(`/api/images/cache?url=${encodedUrl}`)
        setRetryCount(1)
        return
      } else if (retryCount === 1) {
        // Second try: themed placeholder based on item name
        const theme = getImageTheme(alt)
        setCurrentSrc(`https://source.unsplash.com/150x150/?${theme}`)
        setRetryCount(2)
        return
      } else if (retryCount === 2) {
        // Third try: Picsum with themed seed
        const seed = itemId || alt.replace(/\s+/g, "-").toLowerCase()
        setCurrentSrc(`https://picsum.photos/seed/${seed}/150/150`)
        setRetryCount(3)
        return
      }
    }

    setHasError(true)
    onError?.()
  }

  // Check if it's a Telegram sticker that browsers can't display
  const isTgsFile = isTelegramSticker(src)

  // If it's a .tgs file or has error, show custom placeholder immediately
  if (hasError || isTgsFile) {
    const getRarityIcon = () => {
      switch (rarity) {
        case "legendary":
          return <Crown className="w-6 h-6 text-yellow-400" />
        case "epic":
          return <Diamond className="w-6 h-6 text-purple-400" />
        case "rare":
          return <Star className="w-6 h-6 text-blue-400" />
        default:
          return <Gift className="w-6 h-6 text-gray-400" />
      }
    }

    const getRarityGradient = () => {
      switch (rarity) {
        case "legendary":
          return "from-yellow-600 via-yellow-500 to-yellow-400"
        case "epic":
          return "from-purple-600 via-purple-500 to-purple-400"
        case "rare":
          return "from-blue-600 via-blue-500 to-blue-400"
        default:
          return "from-gray-600 via-gray-500 to-gray-400"
      }
    }

    return (
      <div className={`relative ${className}`}>
        <div
          className={`w-full h-full bg-gradient-to-br ${getRarityGradient()} rounded flex items-center justify-center relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
          </div>

          {/* Content */}
          <div className="text-center text-white z-10 p-2">
            {getRarityIcon()}
            <div className="text-xs font-medium mt-1 line-clamp-2 leading-tight">
              {alt.split(" ").slice(0, 3).join(" ")}
            </div>
            {isTgsFile && <div className="text-[8px] text-white/70 mt-1">TGS</div>}
          </div>

          {/* Rarity glow effect */}
          <div
            className={`absolute inset-0 rounded opacity-30 ${
              rarity === "legendary"
                ? "shadow-lg shadow-yellow-400/50"
                : rarity === "epic"
                  ? "shadow-lg shadow-purple-400/50"
                  : rarity === "rare"
                    ? "shadow-lg shadow-blue-400/50"
                    : ""
            }`}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded z-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      <img
        src={currentSrc || src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  )
}
