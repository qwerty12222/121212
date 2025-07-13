"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, X, Info, ArrowLeft } from "lucide-react"
import { ImageWithFallback } from "./image-with-fallback"
import { GameImage } from "@/components/ui/game-image"

interface GameCase {
  id: string
  name: string
  image: string
  price: number
  currency: "TON" | "STARS"
  category: string
  items: GameItem[]
}

interface GameItem {
  id: string
  name: string
  image: string
  rarity: "common" | "rare" | "epic" | "legendary"
  value: number
  probability: number
}

interface CaseOpeningModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: GameCase | null
  onOpenCase: (quantity: number) => void
  balance: { ton: number; stars: number }
  isOpening: boolean
  wonItem: GameItem | null
  language: "en" | "ru" | "uz"
}

export function CaseOpeningModal({
  isOpen,
  onClose,
  caseData,
  onOpenCase,
  balance,
  isOpening,
  wonItem,
  language,
}: CaseOpeningModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationItems, setAnimationItems] = useState<GameItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showContents, setShowContents] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const translations = {
    en: {
      openCase: "Open Case",
      openQuick: "Open Quick",
      howManyToOpen: "How many cases to open?",
      caseContents: "CASE CONTENTS",
      notEnoughStars: "Not enough stars",
      demoVersion: "Demo version",
      opening: "Opening...",
      viewContents: "View Contents",
      back: "Back",
    },
    ru: {
      openCase: "Открыть кейс",
      openQuick: "Открыть быстро",
      howManyToOpen: "Сколько кейсов открыть?",
      caseContents: "СОДЕРЖИМОЕ КЕЙСА",
      notEnoughStars: "У вас не хватает",
      demoVersion: "Демо режим",
      opening: "Открытие",
      viewContents: "Посмотреть содержимое",
      back: "Назад",
    },
    uz: {
      openCase: "Qutini ochish",
      openQuick: "Tez ochish",
      howManyToOpen: "Nechta quti ochish?",
      caseContents: "QUTI TARKIBI",
      demoVersion: "Demo rejim",
      notEnoughStars: "Yulduzlar yetarli emas",
      opening: "Ochilmoqda",
      viewContents: "Tarkibni ko'rish",
      back: "Orqaga",
    },
  }

  const t = translations[language]

  useEffect(() => {
    if (isOpening && caseData) {
      setShowAnimation(true)
      setShowContents(false)
      // Create animation items (duplicate items for smooth scrolling)
      const items = [...caseData.items, ...caseData.items, ...caseData.items, ...caseData.items]
      setAnimationItems(items)

      // Start animation
      setTimeout(() => {
        if (scrollRef.current) {
          const container = scrollRef.current
          const itemWidth = 120 // Width of each item + margin
          const totalWidth = items.length * itemWidth
          const centerPosition = totalWidth / 2 - container.offsetWidth / 2

          // Animate to center
          container.scrollTo({
            left: centerPosition,
            behavior: "smooth",
          })

          // After animation, show selected item
          setTimeout(() => {
            setSelectedIndex(Math.floor(items.length / 2))
          }, 2000)
        }
      }, 500)
    } else {
      setShowAnimation(false)
      setSelectedIndex(-1)
    }
  }, [isOpening, caseData])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-400 bg-gray-400/10"
      case "rare":
        return "border-blue-400 bg-blue-400/10"
      case "epic":
        return "border-purple-400 bg-purple-400/10"
      case "legendary":
        return "border-yellow-400 bg-yellow-400/10"
      default:
        return "border-gray-400 bg-gray-400/10"
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "shadow-gray-400/50"
      case "rare":
        return "shadow-blue-400/50"
      case "epic":
        return "shadow-purple-400/50"
      case "legendary":
        return "shadow-yellow-400/50"
      default:
        return "shadow-gray-400/50"
    }
  }

  const canAfford = caseData
    ? caseData.currency === "TON"
      ? balance.ton >= caseData.price * quantity
      : balance.stars >= caseData.price * quantity
    : false

  if (!caseData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full h-[85vh] bg-gray-900 border-gray-700 p-0 overflow-hidden mx-auto">
        <div className="relative h-full flex flex-col">
          {/* Header - Mobile optimized */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
            {showContents && (
              <Button
                onClick={() => setShowContents(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="text-sm font-bold text-white uppercase flex-1 text-center">
              {showContents ? t.caseContents : caseData.name}
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {!showAnimation && !showContents ? (
              /* Case Selection View - Mobile optimized */
              <div className="p-4 space-y-4">
                {/* Case Image */}
                <div className="flex justify-center">
                  <div className="relative">
                    <GameImage
                      src={caseData.image || "/placeholder.svg"}
                      alt={caseData.name}
                      className="w-32 h-32 object-cover rounded-lg"
                      itemId={caseData.id}
                      type="case"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white font-bold text-sm">
                            {caseData.price * quantity}{" "}
                            {!canAfford && `(${t.notEnoughStars} ${caseData.price * quantity - balance.stars})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Toggle */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 text-xs">{t.demoVersion}</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="text-center space-y-3">
                  <p className="text-gray-300 text-sm">{t.howManyToOpen}</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        onClick={() => setQuantity(num)}
                        variant={quantity === num ? "default" : "outline"}
                        className={`w-10 h-10 rounded-lg text-sm ${
                          quantity === num
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => onOpenCase(quantity)}
                    disabled={!canAfford || isOpening}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {t.openCase} ★ {caseData.price * quantity}
                  </Button>
                  <Button
                    onClick={() => onOpenCase(quantity)}
                    disabled={!canAfford || isOpening}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-3 text-sm"
                  >
                    {t.openQuick}
                  </Button>
                  <Button
                    onClick={() => setShowContents(true)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-2 text-sm"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    {t.viewContents}
                  </Button>
                </div>
              </div>
            ) : showAnimation ? (
              /* Animation View - Mobile optimized */
              <div className="p-4 space-y-4">
                {/* Scrolling Items Animation */}
                <div className="relative">
                  <div className="text-center mb-4">
                    <p className="text-white font-bold text-sm">{t.opening}...</p>
                  </div>

                  {/* Scroll Container */}
                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-4"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {animationItems.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className={`flex-shrink-0 w-20 h-20 relative ${
                          index === selectedIndex ? "transform scale-110" : ""
                        } transition-transform duration-300`}
                      >
                        <div
                          className={`w-full h-full rounded-lg border-2 ${getRarityColor(item.rarity)} ${
                            index === selectedIndex ? `shadow-lg ${getRarityGlow(item.rarity)}` : ""
                          } p-1`}
                        >
                          <ImageWithFallback
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        {index === selectedIndex && (
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{item.value}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Center Indicator */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white/30 pointer-events-none">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-5 h-5 border-2 border-white rounded-full bg-gray-900/50"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-5 border-2 border-white rounded-full bg-gray-900/50"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Case Contents View - Mobile optimized */
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  {caseData.items.map((item) => (
                    <div key={item.id} className="relative">
                      <div
                        className={`bg-gray-800 rounded-lg p-2 border-2 ${getRarityColor(item.rarity)} hover:scale-105 transition-transform`}
                      >
                        <div className="relative">
                          <GameImage
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-16 object-cover rounded mb-2"
                            itemId={item.id}
                            rarity={item.rarity}
                            type="item"
                          />
                          <div className="absolute top-1 right-1">
                            <Info className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>

                        <h4 className="text-white text-xs font-semibold mb-1 line-clamp-1">{item.name}</h4>

                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-bold">{item.value}★</span>
                          </div>
                          <span className="text-xs text-gray-400">{(item.probability * 100).toFixed(1)}%</span>
                        </div>

                        <Badge
                          className={`text-[10px] px-1 py-0 ${
                            item.rarity === "common"
                              ? "bg-gray-500"
                              : item.rarity === "rare"
                                ? "bg-blue-500"
                                : item.rarity === "epic"
                                  ? "bg-purple-500"
                                  : "bg-yellow-500"
                          } text-white`}
                        >
                          {item.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CaseOpeningModal
