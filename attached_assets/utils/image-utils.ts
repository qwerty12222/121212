// Utility functions for handling game images

export const getItemImageFallback = (itemName: string, itemId: string, rarity: string) => {
  // Create themed placeholders based on item properties
  const rarityColors = {
    common: "808080", // Gray
    rare: "4169E1", // Royal Blue
    epic: "8A2BE2", // Blue Violet
    legendary: "FFD700", // Gold
  }

  const color = rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common

  // Use a service that can generate themed images
  const seed = itemId || itemName.replace(/\s+/g, "-").toLowerCase()

  // Try different placeholder services for variety
  const services = [
    `https://picsum.photos/seed/${seed}/150/150`,
    `https://source.unsplash.com/150x150/?${getImageTheme(itemName)}`,
    `https://picsum.photos/150/150?random=${seed}`,
  ]

  return services[Math.floor(Math.random() * services.length)]
}

export const getImageTheme = (itemName: string): string => {
  const name = itemName.toLowerCase()

  // Map item names to appropriate themes for better fallback images
  if (name.includes("diamond") || name.includes("gem")) return "diamond,jewelry,precious"
  if (name.includes("gold") || name.includes("golden")) return "gold,luxury,shiny"
  if (name.includes("silver")) return "silver,metal,shiny"
  if (name.includes("crown") || name.includes("royal")) return "crown,royal,luxury"
  if (name.includes("ring")) return "ring,jewelry,wedding"
  if (name.includes("watch")) return "watch,luxury,time"
  if (name.includes("coin")) return "coin,money,gold"
  if (name.includes("crystal")) return "crystal,gem,clear"
  if (name.includes("treasure")) return "treasure,chest,gold"
  if (name.includes("gift") || name.includes("present")) return "gift,present,box"
  if (name.includes("candy") || name.includes("lollipop") || name.includes("lol pop")) return "candy,sweet,colorful"
  if (name.includes("flower") || name.includes("sakura")) return "flower,nature,pink"
  if (name.includes("hat") || name.includes("helmet")) return "hat,fashion,style"
  if (name.includes("bear") || name.includes("toy")) return "toy,cute,soft"
  if (name.includes("magic") || name.includes("spell")) return "magic,fantasy,mystical"
  if (name.includes("evil") || name.includes("dark")) return "dark,mystery,gothic"
  if (name.includes("angel") || name.includes("celestial")) return "angel,light,heavenly"
  if (name.includes("voodoo") || name.includes("doll")) return "doll,mystical,dark"
  if (name.includes("cigar") || name.includes("vintage")) return "vintage,classic,luxury"
  if (name.includes("eye")) return "eye,mystical,vision"
  if (name.includes("witch")) return "witch,magic,halloween"
  if (name.includes("jack") || name.includes("box")) return "box,surprise,toy"
  if (name.includes("bunny") || name.includes("rabbit")) return "bunny,cute,soft"
  if (name.includes("cat") || name.includes("kitty")) return "cat,cute,pet"
  if (name.includes("helmet") || name.includes("neko")) return "helmet,armor,protection"

  // Default themes for generic items
  return "luxury,treasure,shiny"
}

export const isTelegramSticker = (url: string): boolean => {
  return url.includes(".tgs") || url.includes("telegram") || url.endsWith(".tgs")
}

export const getCaseImageFallback = (caseName: string, caseId: string) => {
  const seed = caseId || caseName.replace(/\s+/g, "-").toLowerCase()
  return `https://picsum.photos/seed/case-${seed}/300/300`
}

// Function to check if image URL is valid and accessible
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  if (url.includes("placeholder.svg")) return false
  if (isTelegramSticker(url)) return false
  return true
}

// Function to get the best fallback image for an item
export const getBestFallbackImage = (itemName: string, itemId: string, rarity: string): string => {
  const theme = getImageTheme(itemName)
  const seed = itemId || itemName.replace(/\s+/g, "-").toLowerCase()

  // Return a high-quality themed image
  return `https://source.unsplash.com/150x150/?${theme}`
}
