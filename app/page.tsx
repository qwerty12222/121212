"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, Wallet, Settings, User, Trophy, Package, Crown, Sparkles, Loader2, Plus, Minus } from "lucide-react"
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { GameImage } from "@/components/ui/game-image"
import CaseOpeningModal from "@/components/ui/case-opening-modal"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

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

interface UserBalance {
  ton: number
  stars: number
}

const TonLogo = () => (
  <svg width="16" height="16" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
      fill="#0088CC"
    />
    <path
      d="M37.5603 15.6277H18.4386C17.7082 15.6277 17.6 16.0893 18.0615 16.4894L27.6894 24.7786C27.8615 24.9234 28.1384 24.9234 28.3105 24.7786L37.9385 16.4894C38.4 16.0893 38.2918 15.6277 37.5603 15.6277Z"
      fill="white"
    />
    <path
      d="M15.8 17.9H40.2C40.6418 17.9 41 18.2582 41 18.7V37.3C41 37.7418 40.6418 38.1 40.2 38.1H15.8C15.3582 38.1 15 37.7418 15 37.3V18.7C15 18.2582 15.3582 17.9 15.8 17.9Z"
      fill="white"
    />
    <path d="M17.5 20.5V35.5H21.5V27.5H23.5V35.5H27.5V20.5H23.5V25.5H21.5V20.5H17.5Z" fill="#0088CC" />
    <path d="M29.5 20.5V35.5H38.5V32.5H33.5V29.5H37.5V26.5H33.5V23.5H38.5V20.5H29.5Z" fill="#0088CC" />
  </svg>
)

const StarsLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.74L12 17.27L5.82 20.74L7 13.74L2 9L8.91 8.26L12 2Z"
      fill="#FFD700"
      stroke="#FFA500"
      strokeWidth="1"
    />
  </svg>
)

export default function GiftsBossGame() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<UserBalance>({ ton: 0, stars: 10 }) // Welcome bonus 10 stars
  const [cases, setCases] = useState<GameCase[]>([])
  const [filteredCases, setFilteredCases] = useState<GameCase[]>([])
  const [activeTab, setActiveTab] = useState("cases")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedCase, setSelectedCase] = useState<GameCase | null>(null)
  const [showCaseModal, setShowCaseModal] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [wonItem, setWonItem] = useState<GameItem | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [language, setLanguage] = useState<"en" | "ru" | "uz">("ru")
  const [inventory, setInventory] = useState<GameItem[]>([])
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showStarsModal, setShowStarsModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState(1)
  const [starsAmount, setStarsAmount] = useState(50)
  const [isNewUser, setIsNewUser] = useState(true)

  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const connected = !!wallet

  const translations = {
    en: {
      title: "Gifts Boss",
      balance: "Balance",
      cases: "Cases",
      inventory: "Inventory",
      profile: "Profile",
      settings: "Settings",
      openCase: "Open Case",
      opening: "Opening...",
      congratulations: "Congratulations!",
      youWon: "You won:",
      deposit: "Deposit TON",
      withdraw: "Withdraw",
      connectWallet: "Connect Wallet",
      buyStars: "Buy Stars",
      vipStatus: "VIP Status",
      level: "Level",
      free: "Free",
      limited: "Limited",
      mix: "Mix",
      nft: "NFT",
      allin: "All-in",
      all: "All",
      insufficientBalance: "Insufficient balance!",
      awesome: "Awesome!",
      value: "Value",
      welcomeBonus: "Welcome bonus +10 ⭐",
      depositTon: "Deposit TON",
      buyTelegramStars: "Buy Telegram Stars",
      enterAmount: "Enter amount",
      createInvoice: "Create Invoice",
      cancel: "Cancel",
    },
    ru: {
      title: "Подарки Босс",
      balance: "Баланс",
      cases: "Кейсы",
      inventory: "Инвентарь",
      profile: "Профиль",
      settings: "Настройки",
      openCase: "Открыть кейс",
      opening: "Открываем...",
      congratulations: "Поздравляем!",
      youWon: "Вы выиграли:",
      deposit: "Пополнить TON",
      withdraw: "Вывести",
      connectWallet: "Подключить кошелек",
      buyStars: "Купить звезды",
      vipStatus: "VIP статус",
      level: "Уровень",
      free: "Бесплатно",
      limited: "Ограниченно",
      mix: "Микс",
      nft: "НФТ",
      allin: "Все включено",
      all: "Все",
      insufficientBalance: "Недостаточно средств!",
      awesome: "Отлично!",
      value: "Стоимость",
      welcomeBonus: "Приветственный бонус +10 ⭐",
      depositTon: "Пополнить TON",
      buyTelegramStars: "Купить Telegram Stars",
      enterAmount: "Введите сумму",
      createInvoice: "Создать счет",
      cancel: "Отмена",
    },
    uz: {
      title: "Sovg'alar Boss",
      balance: "Balans",
      cases: "Qutular",
      inventory: "Inventar",
      profile: "Profil",
      settings: "Sozlamalar",
      openCase: "Qutini ochish",
      opening: "Ochilmoqda...",
      congratulations: "Tabriklaymiz!",
      youWon: "Siz yutdingiz:",
      deposit: "TON to'ldirish",
      withdraw: "Yechish",
      connectWallet: "Hamyonni ulash",
      buyStars: "Yulduzlar sotib olish",
      vipStatus: "VIP holat",
      level: "Daraja",
      free: "Bepul",
      limited: "Cheklangan",
      mix: "Aralash",
      nft: "NFT",
      allin: "Hammasi",
      all: "Hammasi",
      insufficientBalance: "Mablag' yetarli emas!",
      awesome: "Ajoyib!",
      value: "Qiymat",
      welcomeBonus: "Xush kelibsiz bonusi +10 ⭐",
      depositTon: "TON to'ldirish",
      buyTelegramStars: "Telegram Stars sotib olish",
      enterAmount: "Miqdorni kiriting",
      createInvoice: "Hisob yaratish",
      cancel: "Bekor qilish",
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
        // Check if user is new and show welcome bonus
        if (isNewUser) {
          setTimeout(() => {
            tg.showAlert(t.welcomeBonus)
            setIsNewUser(false)
          }, 1000)
        }
      } else {
        // Demo user for testing
        setUser({
          id: 123456789,
          first_name: "Demo",
          last_name: "User",
          username: "demouser",
        })
      }

      // Set theme colors
      document.documentElement.style.setProperty("--tg-theme-bg-color", "#0a0a0a")
      document.documentElement.style.setProperty("--tg-theme-text-color", "#ffffff")
    } else {
      // Demo user for testing outside Telegram
      setUser({
        id: 123456789,
        first_name: "Demo",
        last_name: "User",
        username: "demouser",
      })
    }

    loadCases()
    setIsLoading(false)
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, activeCategory])

  const filterCases = () => {
    if (activeCategory === "all") {
      setFilteredCases(cases)
    } else {
      setFilteredCases(cases.filter((c) => c.category === activeCategory))
    }
  }

  const loadCases = async () => {
    try {
      // Try to fetch from the API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("https://server.giftsbattle.com/cases/category_and_cases/", {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "GiftsBoss-Game/1.0",
        },
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      // Extract all cases from all categories
      const allCases: any[] = []
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((category: any) => {
          if (category.cases && Array.isArray(category.cases)) {
            category.cases.forEach((caseItem: any) => {
              allCases.push({
                ...caseItem,
                categoryName: category.name,
                categoryNameEng: category.name_eng,
              })
            })
          }
        })
      }

      console.log("All cases:", allCases)

      const formattedCases: GameCase[] = await Promise.all(
        allCases.slice(0, 20).map(async (caseData: any) => {
          // Use translit_name for API calls
          const caseName = caseData.translit_name || caseData.name || "unknown"

          // Load items for each case using translit_name
          let itemsData: any[] = []
          try {
            console.log(`Loading items for case: ${caseName}`)
            const itemsController = new AbortController()
            const itemsTimeoutId = setTimeout(() => itemsController.abort(), 8000)

            const itemsRes = await fetch(`https://server.giftsbattle.com/cases/${encodeURIComponent(caseName)}/`, {
              signal: itemsController.signal,
              headers: {
                Accept: "application/json",
                "User-Agent": "GiftsBoss-Game/1.0",
              },
            })
            clearTimeout(itemsTimeoutId)

            if (itemsRes.ok) {
              const itemsJson = await itemsRes.json()
              console.log(`Items for ${caseName}:`, itemsJson)

              // Handle the items response structure - the API returns items directly in the response
              if (itemsJson.items && Array.isArray(itemsJson.items)) {
                itemsData = itemsJson.items
              } else if (Array.isArray(itemsJson)) {
                itemsData = itemsJson
              } else {
                console.warn("Unexpected items structure:", itemsJson)
              }
            }
          } catch (err) {
            console.warn("Could not load items for case", caseName, err)
          }

          // Use server price directly - convert tickets_price to stars
          let caseStarsPrice = 50 // default
          if (caseData.tickets_price && caseData.tickets_price > 0) {
            // Use tickets_price directly as stars price
            caseStarsPrice = caseData.tickets_price
          } else if (caseData.price && caseData.price > 0) {
            // If no tickets_price, use price field directly
            caseStarsPrice = caseData.price
          }

          // Process items with server pricing
          const processedItems = itemsData.map((item: any, index: number) => {
            // Use server price directly for items
            let starValue = 50 // default
            if (item.price && item.price > 0) {
              // Use the server price directly as star value
              starValue = item.price
            } else if (item.price_ton && item.price_ton > 0) {
              // Convert TON price to stars (1 TON = 200 stars)
              starValue = Math.floor(item.price_ton * 200)
            }

            // Determine rarity based on percentage chance
            let rarity: "common" | "rare" | "epic" | "legendary" = "common"
            if (item.percent) {
              if (item.percent < 1) {
                rarity = "legendary"
              } else if (item.percent < 5) {
                rarity = "epic"
              } else if (item.percent < 15) {
                rarity = "rare"
              } else {
                rarity = "common"
              }
            }

            return {
              id: item.item_id || `${caseName}_${index}`,
              name: item.name || `Item ${index + 1}`,
              image: item.image ? `/api/images/proxy?url=${encodeURIComponent(item.image)}&name=${encodeURIComponent(item.name)}&id=${encodeURIComponent(item.item_id || '')}&rarity=${rarity}` : "",
              rarity: rarity,
              value: starValue,
              probability: item.percent ? item.percent / 100 : 0.25,
            }
          })

          // Add default items if none found
          if (processedItems.length === 0) {
            const defaultItems = [
              {
                id: `${caseName}_default_1`,
                name: "Common Gift",
                image: "",
                rarity: "common" as const,
                value: Math.floor(caseStarsPrice * 0.5),
                probability: 0.5,
              },
              {
                id: `${caseName}_default_2`,
                name: "Rare Prize",
                image: "",
                rarity: "rare" as const,
                value: Math.floor(caseStarsPrice * 1.2),
                probability: 0.3,
              },
              {
                id: `${caseName}_default_3`,
                name: "Epic Reward",
                image: "",
                rarity: "epic" as const,
                value: Math.floor(caseStarsPrice * 2),
                probability: 0.15,
              },
              {
                id: `${caseName}_default_4`,
                name: "Legendary Item",
                image: "",
                rarity: "legendary" as const,
                value: Math.floor(caseStarsPrice * 4),
                probability: 0.05,
              },
            ]
            processedItems.push(...defaultItems)
          }

          // Map category to our internal categories
          const getCategoryType = (categoryData: any) => {
            if (!categoryData || !categoryData.category_id) return "mix"

            switch (categoryData.category_id) {
              case "Fi2qyoOjP":
                return "free"
              case "Rj8HhFxPa":
                return "limited"
              case "Tf6QT0lsm":
              case "Jr9jQbSYq":
                return "nft"
              case "No5F34LaK":
                return "mix"
              case "Ju2e5dVmS":
                return "allin"
              case "Oq1B6mrTC":
                return "limited"
              default:
                return "mix"
            }
          }

          return {
            id: caseData.translit_name || caseData.name,
            name: caseData.name_eng || caseData.name,
            image: caseData.image ? `/api/images/proxy?url=${encodeURIComponent(caseData.image)}&name=${encodeURIComponent(caseData.name || '')}&id=${encodeURIComponent(caseData.translit_name || '')}&rarity=case` : "",
            price: caseStarsPrice,
            currency: "STARS",
            category: getCategoryType(caseData.category),
            items: processedItems,
          } satisfies GameCase
        }),
      )

      console.log("Formatted cases:", formattedCases)
      setCases(formattedCases)
    } catch (error) {
      console.error("Failed to load cases from API:", error)

      // Enhanced fallback demo cases with server-like pricing
      const fallbackCases: GameCase[] = [
        {
          id: "starter",
          name: "Starter Case",
          image: "https://picsum.photos/300/300?random=starter",
          price: 50,
          currency: "STARS",
          category: "free",
          items: [
            {
              id: "1",
              name: "Bronze Gift",
              image: "",
              rarity: "common",
              value: 25,
              probability: 0.5,
            },
            {
              id: "2",
              name: "Silver Gift",
              image: "",
              rarity: "rare",
              value: 60,
              probability: 0.3,
            },
            {
              id: "3",
              name: "Gold Gift",
              image: "",
              rarity: "epic",
              value: 100,
              probability: 0.15,
            },
            {
              id: "4",
              name: "Diamond Gift",
              image: "",
              rarity: "legendary",
              value: 200,
              probability: 0.05,
            },
          ],
        },
        {
          id: "premium",
          name: "Premium Case",
          image: "https://picsum.photos/300/300?random=premium",
          price: 150,
          currency: "STARS",
          category: "mix",
          items: [
            {
              id: "5",
              name: "Ruby Gem",
              image: "",
              rarity: "rare",
              value: 120,
              probability: 0.4,
            },
            {
              id: "6",
              name: "Emerald Crown",
              image: "",
              rarity: "epic",
              value: 300,
              probability: 0.35,
            },
            {
              id: "7",
              name: "Diamond Ring",
              image: "",
              rarity: "legendary",
              value: 600,
              probability: 0.25,
            },
          ],
        },
      ]

      setCases(fallbackCases)
    }
  }

  const handleTonDeposit = useCallback(async () => {
    if (!connected) {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert("Please connect your TON wallet first!")
      }
      return
    }

    setShowDepositModal(true)
  }, [connected])

  const handleCreateTonInvoice = async () => {
    if (!connected || depositAmount <= 0) return

    const depositId = Math.random().toString(36).substring(7)
    const amount = (depositAmount * 1000000000).toString() // Convert TON to nanotons

    try {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`Processing TON deposit of ${depositAmount} TON...`)
      }

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: "UQCykymqM_PybUwc569W4AJr9l3OxyFJX5l8coAJqOWLmxgk",
            amount: amount,
            payload: depositId,
          },
        ],
      })

      if (result) {
        // Update balance after successful transaction
        const starsToAdd = depositAmount * 50 // 1 TON = 50 Stars
        setBalance((prev) => ({
          ...prev,
          ton: prev.ton + depositAmount,
          stars: prev.stars + starsToAdd,
        }))
        
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`Deposit successful! +${starsToAdd} Stars added to your balance.`)
        }
        setShowDepositModal(false)
      }
    } catch (error: any) {
      console.error("Transaction failed:", error)
      let errorMessage = "Transaction failed. Please try again."
      
      if (error?.message?.includes("User rejected")) {
        errorMessage = "Transaction was cancelled."
      } else if (error?.message?.includes("insufficient")) {
        errorMessage = "Insufficient TON balance in your wallet."
      } else if (error?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(errorMessage)
      }
    }
  }

  const handleStarsPurchase = async () => {
    setShowStarsModal(true)
  }

  const handleCreateStarsInvoice = async () => {
    if (starsAmount <= 0 || !user) return

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp

      try {
        tg.showAlert(`Creating invoice for ${starsAmount} Telegram Stars...`)

        // Create invoice through our API
        const response = await fetch('/api/payment/stars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            amount: starsAmount,
            title: 'Telegram Stars Purchase',
            description: `Purchase ${starsAmount} Telegram Stars for GiftsBoss`,
          }),
        })

        const result = await response.json()

        if (result.success) {
          tg.showAlert(`Invoice created! Check your messages to complete the payment.`)
          setShowStarsModal(false)
        } else {
          tg.showAlert(`Failed to create invoice: ${result.error}`)
        }
      } catch (error) {
        console.error('Stars invoice creation error:', error)
        tg.showAlert("Failed to create invoice. Please try again.")
      }
    }
  }

  const handleCaseClick = (caseItem: GameCase) => {
    setSelectedCase(caseItem)
    setShowCaseModal(true)
  }

  const handleOpenCase = async (quantity: number) => {
    if (!selectedCase || !user) return

    const totalCost = selectedCase.price * quantity
    const canAfford = selectedCase.currency === "TON" ? balance.ton >= totalCost : balance.stars >= totalCost

    if (!canAfford) {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(t.insufficientBalance)
      }
      return
    }

    setIsOpening(true)

    // Deduct cost
    if (selectedCase.currency === "TON") {
      setBalance((prev) => ({ ...prev, ton: prev.ton - totalCost }))
    } else {
      setBalance((prev) => ({ ...prev, stars: prev.stars - totalCost }))
    }

    // Simulate opening animation
    setTimeout(() => {
      // Select random item based on probability
      const random = Math.random()
      let cumulativeProbability = 0
      let selectedItem = selectedCase.items[0]

      for (const item of selectedCase.items) {
        cumulativeProbability += item.probability
        if (random <= cumulativeProbability) {
          selectedItem = item
          break
        }
      }

      console.log("Won item:", selectedItem)

      setWonItem(selectedItem)
      setInventory((prev) => [...prev, selectedItem])
      setIsOpening(false)

      // Close modal after animation
      setTimeout(() => {
        setShowCaseModal(false)
        setShowResult(true)
      }, 1000)

      // Haptic feedback
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
      }
    }, 4000)
  }

  const closeResult = () => {
    setShowResult(false)
    setWonItem(null)
    setSelectedCase(null)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-yellow-500 mx-auto" />
          <p className="text-white text-lg">Loading Gifts Boss...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header - Optimized for mobile */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-2 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/gifts-boss-logo.jpg"
              alt="Gifts Boss"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
            />
            <div>
              <h1 className="text-sm font-bold text-black">{t.title}</h1>
              {user && <p className="text-xs text-gray-800">{user.first_name}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
              <TonLogo />
              <span className="font-bold text-white text-xs">{balance.ton.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
              <StarsLogo />
              <span className="font-bold text-white text-xs">{balance.stars}</span>
            </div>
          </div>
        </div>

        {/* Balance Actions - Simplified for mobile */}
        <div className="flex gap-1 mt-2">
          <div className="flex-1">
            <TonConnectButton className="!w-full !text-xs !h-8" />
          </div>
          <Button
            onClick={handleTonDeposit}
            disabled={!connected}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
          >
            <Wallet className="w-3 h-3 mr-1" />
            TON
          </Button>
          <Button
            onClick={handleStarsPurchase}
            size="sm"
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-xs h-8"
          >
            <StarsLogo />
            Stars
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-3 h-10">
            <TabsTrigger value="cases" className="flex flex-col gap-0 text-xs p-1">
              <Package className="w-3 h-3" />
              <span className="text-[9px]">{t.cases}</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex flex-col gap-0 text-xs p-1">
              <Gift className="w-3 h-3" />
              <span className="text-[9px]">{t.inventory}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-0 text-xs p-1">
              <User className="w-3 h-3" />
              <span className="text-[9px]">{t.profile}</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex flex-col gap-0 text-xs p-1">
              <Trophy className="w-3 h-3" />
              <span className="text-[9px]">Leaders</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col gap-0 text-xs p-1">
              <Settings className="w-3 h-3" />
              <span className="text-[9px]">{t.settings}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-3">
            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {["all", "free", "limited", "mix", "nft", "allin"].map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category)}
                  className={`whitespace-nowrap text-xs min-w-fit px-2 h-7 ${
                    activeCategory === category
                      ? "bg-yellow-600 text-black hover:bg-yellow-700"
                      : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {t[category as keyof typeof t] || category}
                </Button>
              ))}
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
                  onClick={() => handleCaseClick(caseItem)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <GameImage
                        src={caseItem.image || "/placeholder.svg"}
                        alt={caseItem.name}
                        className="w-full h-24 object-cover"
                        itemId={caseItem.id}
                        type="case"
                      />
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-purple-600 text-white text-[8px] px-1 py-0">
                          {caseItem.category.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="font-bold text-xs mb-1 line-clamp-1">{caseItem.name}</h3>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <StarsLogo />
                          <span className="font-bold text-xs">{caseItem.price}</span>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCaseClick(caseItem)
                        }}
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold py-1 text-xs h-6"
                      >
                        <Gift className="w-3 h-3 mr-1" />
                        {t.openCase}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCases.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No cases found in this category</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">{t.inventory}</h2>
                {inventory.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {inventory.map((item, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <GameImage
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded mb-2"
                          itemId={item.id}
                          rarity={item.rarity}
                          type="item"
                        />
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h4>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity.toUpperCase()}
                        </Badge>
                        <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                          {item.value} <StarsLogo />
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Open some cases to see your items here!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-black">
                    {user?.first_name?.[0] || "G"}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-gray-400 text-sm">@{user?.username || "user"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xl font-bold text-blue-400">{balance.ton.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">TON Balance</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xl font-bold text-yellow-400">{balance.stars}</p>
                      <p className="text-xs text-gray-400">Stars Balance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xl font-bold text-green-400">{inventory.length}</p>
                      <p className="text-xs text-gray-400">Items Won</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xl font-bold text-purple-400">5</p>
                      <p className="text-xs text-gray-400">Level</p>
                    </div>
                  </div>

                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    {t.vipStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </h2>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            rank === 1
                              ? "bg-yellow-500 text-black"
                              : rank === 2
                                ? "bg-gray-400 text-black"
                                : rank === 3
                                  ? "bg-orange-600 text-white"
                                  : "bg-gray-600 text-white"
                          }`}
                        >
                          {rank}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Player {rank}</p>
                          <p className="text-xs text-gray-400">Level {10 - rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-400 text-sm flex items-center gap-1">
                          {1000 - rank * 100} <StarsLogo />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-4">
                <h2 className="text-lg font-bold mb-4">{t.settings}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "en" | "ru" | "uz")}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                      <option value="uz">O'zbek</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Toggle
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sound Effects</span>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Toggle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* TON Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-blue-500">{t.depositTon}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-sm font-medium">
                {t.enterAmount} (TON)
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  onClick={() => setDepositAmount(Math.max(0.1, depositAmount - 0.1))}
                  size="sm"
                  variant="outline"
                  className="border-gray-600"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0.1, Number.parseFloat(e.target.value) || 0.1))}
                  className="bg-gray-700 border-gray-600 text-center"
                  min="0.1"
                  step="0.1"
                />
                <Button
                  onClick={() => setDepositAmount(depositAmount + 0.1)}
                  size="sm"
                  variant="outline"
                  className="border-gray-600"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">You will receive: {depositAmount * 50} ⭐ (1 TON = 50 ⭐)</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowDepositModal(false)} variant="outline" className="flex-1 border-gray-600">
                {t.cancel}
              </Button>
              <Button
                onClick={handleCreateTonInvoice}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={depositAmount <= 0}
              >
                {t.createInvoice}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stars Purchase Modal */}
      <Dialog open={showStarsModal} onOpenChange={setShowStarsModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-yellow-500">{t.buyTelegramStars}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="stars-amount" className="text-sm font-medium">
                {t.enterAmount} (⭐)
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  onClick={() => setStarsAmount(Math.max(10, starsAmount - 10))}
                  size="sm"
                  variant="outline"
                  className="border-gray-600"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  id="stars-amount"
                  type="number"
                  value={starsAmount}
                  onChange={(e) => setStarsAmount(Math.max(10, Number.parseInt(e.target.value) || 10))}
                  className="bg-gray-700 border-gray-600 text-center"
                  min="10"
                  step="10"
                />
                <Button
                  onClick={() => setStarsAmount(starsAmount + 10)}
                  size="sm"
                  variant="outline"
                  className="border-gray-600"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Quick amounts:
                <Button onClick={() => setStarsAmount(50)} size="sm" variant="ghost" className="text-xs mx-1">
                  50
                </Button>
                <Button onClick={() => setStarsAmount(100)} size="sm" variant="ghost" className="text-xs mx-1">
                  100
                </Button>
                <Button onClick={() => setStarsAmount(250)} size="sm" variant="ghost" className="text-xs mx-1">
                  250
                </Button>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowStarsModal(false)} variant="outline" className="flex-1 border-gray-600">
                {t.cancel}
              </Button>
              <Button
                onClick={handleCreateStarsInvoice}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black"
                disabled={starsAmount <= 0}
              >
                {t.createInvoice}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Case Opening Modal */}
      <CaseOpeningModal
        isOpen={showCaseModal}
        onClose={() => setShowCaseModal(false)}
        caseData={selectedCase}
        onOpenCase={handleOpenCase}
        balance={balance}
        isOpening={isOpening}
        wonItem={wonItem}
        language={language}
      />

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={closeResult}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-yellow-500">{t.congratulations}</DialogTitle>
          </DialogHeader>
          {wonItem && (
            <div className="text-center space-y-4 py-4">
              <div className="relative">
                <GameImage
                  src={wonItem.image || "/placeholder.svg"}
                  alt={wonItem.name}
                  className="w-24 h-24 mx-auto rounded-lg border-4 border-yellow-500 object-cover"
                  itemId={wonItem.id}
                  rarity={wonItem.rarity}
                  type="item"
                />
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRarityColor(wonItem.rarity)} flex items-center justify-center`}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold">{wonItem.name}</h3>
                <Badge className={`${getRarityColor(wonItem.rarity)} text-white text-xs`}>
                  {wonItem.rarity.toUpperCase()}
                </Badge>
                <p className="text-yellow-400 font-bold text-sm flex items-center justify-center gap-1">
                  {t.value}: {wonItem.value} <StarsLogo />
                </p>
              </div>

              <Button
                onClick={closeResult}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold text-sm"
              >
                {t.awesome}!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
