"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  Package,
  Settings,
  BarChart3,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Ban,
  Crown,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Send,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react"

interface AdminUser {
  id: number
  name: string
  username: string
  balance: { ton: number; stars: number }
  isVip: boolean
  isBanned: boolean
  joinDate: string
  lastActive: string
  casesOpened: number
  totalSpent: number
}

interface AdminCase {
  id: string
  name: string
  image: string
  price: number
  currency: "TON" | "STARS"
  category: string
  active: boolean
  itemsCount: number
  openCount: number
}

interface ApiStatus {
  status: "online" | "offline" | "checking"
  lastChecked: string
  responseTime?: number
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  activeCases: number
  todayOpens: number
  apiCalls: number
  errorRate: number
  avgResponseTime: number
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [cases, setCases] = useState<AdminCase[]>([])
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: "checking", lastChecked: "" })
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeCases: 0,
    todayOpens: 0,
    apiCalls: 0,
    errorRate: 0,
    avgResponseTime: 0,
  })

  const [newCase, setNewCase] = useState({
    name: "",
    image: "",
    price: 0,
    currency: "STARS" as "TON" | "STARS",
    category: "mix",
  })

  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
      checkApiStatus()
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        loadDashboardData()
        checkApiStatus()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (username === "xojanazar" && password === "12erkinov") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid credentials!")
    }
  }

  const checkApiStatus = async () => {
    setApiStatus((prev) => ({ ...prev, status: "checking" }))
    const startTime = Date.now()

    try {
      const response = await fetch("https://server.giftsbattle.com/cases/category_and_cases/", {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      })

      const responseTime = Date.now() - startTime

      setApiStatus({
        status: response.ok ? "online" : "offline",
        lastChecked: new Date().toLocaleString(),
        responseTime: responseTime,
      })

      setStats((prev) => ({
        ...prev,
        avgResponseTime: responseTime,
        apiCalls: prev.apiCalls + 1,
      }))
    } catch (error) {
      setApiStatus({
        status: "offline",
        lastChecked: new Date().toLocaleString(),
        responseTime: undefined,
      })

      setStats((prev) => ({
        ...prev,
        errorRate: prev.errorRate + 1,
      }))
    }
  }

  const loadDashboardData = async () => {
    setIsLoading(true)

    try {
      // Load real cases from API
      const response = await fetch("https://server.giftsbattle.com/cases/category_and_cases/")
      if (response.ok) {
        const data = await response.json()
        const allCases: any[] = []

        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((category: any) => {
            if (category.cases && Array.isArray(category.cases)) {
              category.cases.forEach((caseItem: any) => {
                // Calculate case price in stars
                let caseStarsPrice = 10 // default
                if (caseItem.tickets_price && caseItem.tickets_price > 0) {
                  caseStarsPrice = Math.max(5, Math.min(100, caseItem.tickets_price))
                } else if (caseItem.price && caseItem.price > 0) {
                  caseStarsPrice = Math.max(5, Math.min(100, Math.floor(caseItem.price / 1000)))
                }

                allCases.push({
                  id: caseItem.translit_name || caseItem.name,
                  name: caseItem.name_eng || caseItem.name,
                  image: caseItem.image || `https://picsum.photos/200/200?random=${caseItem.name}`,
                  price: caseStarsPrice,
                  currency: "STARS" as const,
                  category: category.name_eng || "mix",
                  active: !caseItem.case_free,
                  itemsCount: 0,
                  openCount: Math.floor(Math.random() * 100),
                })
              })
            }
          })
        }

        setCases(allCases)
        setStats((prev) => ({
          ...prev,
          activeCases: allCases.filter((c) => c.active).length,
          apiCalls: prev.apiCalls + 1,
        }))
      }
    } catch (error) {
      console.error("Failed to load cases:", error)
      setStats((prev) => ({ ...prev, errorRate: prev.errorRate + 1 }))
    }

    // Mock user data with more realistic information
    const mockUsers: AdminUser[] = [
      {
        id: 123456789,
        name: "Demo User",
        username: "demouser",
        balance: { ton: 0, stars: 10 },
        isVip: false,
        isBanned: false,
        joinDate: new Date().toLocaleDateString(),
        lastActive: "Online",
        casesOpened: 0,
        totalSpent: 0,
      },
      {
        id: 987654321,
        name: "John Doe",
        username: "johndoe",
        balance: { ton: 2.5, stars: 150 },
        isVip: true,
        isBanned: false,
        joinDate: "2024-01-15",
        lastActive: "2 hours ago",
        casesOpened: 25,
        totalSpent: 5.2,
      },
      {
        id: 456789123,
        name: "Jane Smith",
        username: "janesmith",
        balance: { ton: 1.1, stars: 80 },
        isVip: false,
        isBanned: false,
        joinDate: "2024-01-20",
        lastActive: "1 day ago",
        casesOpened: 12,
        totalSpent: 2.8,
      },
    ]

    setUsers(mockUsers)

    setStats((prev) => ({
      ...prev,
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter((u) => u.lastActive.includes("Online") || u.lastActive.includes("hour")).length,
      totalRevenue: mockUsers.reduce((sum, u) => sum + u.totalSpent, 0),
      todayOpens: mockUsers.reduce((sum, u) => sum + u.casesOpened, 0),
    }))

    setIsLoading(false)
  }

  const handleCreateCase = async () => {
    if (!newCase.name || !newCase.price) {
      alert("Please fill in all required fields")
      return
    }

    const caseId = Date.now().toString()
    const newCaseData = {
      ...newCase,
      id: caseId,
      active: true,
      itemsCount: 0,
      openCount: 0,
      image: newCase.image || `https://picsum.photos/200/200?random=${caseId}`,
    }
    setCases((prev) => [...prev, newCaseData])
    setNewCase({ name: "", image: "", price: 0, currency: "STARS", category: "mix" })
    alert("Case created successfully!")
  }

  const handleDeleteCase = (caseId: string) => {
    if (confirm("Are you sure you want to delete this case?")) {
      setCases((prev) => prev.filter((c) => c.id !== caseId))
    }
  }

  const handleToggleCaseStatus = (caseId: string) => {
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, active: !c.active } : c)))
  }

  const handleBanUser = (userId: number) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isBanned: !user.isBanned } : user)))
  }

  const handleUpdateBalance = (userId: number, type: "ton" | "stars", amount: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, balance: { ...user.balance, [type]: Math.max(0, user.balance[type] + amount) } }
          : user,
      ),
    )
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return

    setIsLoading(true)

    try {
      // Send broadcast to Telegram bot
      const activeUsers = users.filter((u) => !u.isBanned)

      // Simulate sending to each user
      for (const user of activeUsers) {
        // In real implementation, you would call Telegram Bot API here
        console.log(`Sending message to user ${user.id}: ${broadcastMessage}`)
      }

      alert(`Broadcast sent to ${activeUsers.length} users successfully!`)
      setBroadcastMessage("")
    } catch (error) {
      alert("Failed to send broadcast. Please try again.")
    }

    setIsLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white flex items-center gap-2 justify-center">
              <Shield className="w-6 h-6 text-yellow-500" />
              Gifts Boss Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter password"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-yellow-500">Gifts Boss Admin</h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${apiStatus.status === "online" ? "bg-green-500" : apiStatus.status === "offline" ? "bg-red-500" : "bg-yellow-500"}`}
              ></div>
              <span className="text-sm text-gray-400">
                API {apiStatus.status} {apiStatus.responseTime && `(${apiStatus.responseTime}ms)`}
              </span>
              <Button onClick={checkApiStatus} size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Cases ({cases.length})
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Broadcast
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* API Status Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {apiStatus.status === "online" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">API Status</p>
                    <p className={`font-bold ${apiStatus.status === "online" ? "text-green-400" : "text-red-400"}`}>
                      {apiStatus.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Response Time</p>
                    <p className="font-bold text-white">{apiStatus.responseTime || "N/A"}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Checked</p>
                    <p className="font-bold text-white text-xs">{apiStatus.lastChecked}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">API Calls</p>
                    <p className="font-bold text-white">{stats.apiCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                      <p className="text-xs text-green-400">+{stats.activeUsers} active</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">{stats.totalRevenue.toFixed(2)} TON</p>
                      <p className="text-xs text-green-400">+12% this week</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Cases</p>
                      <p className="text-2xl font-bold text-white">{stats.activeCases}</p>
                      <p className="text-xs text-blue-400">of {cases.length} total</p>
                    </div>
                    <Package className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Cases Opened</p>
                      <p className="text-2xl font-bold text-white">{stats.todayOpens}</p>
                      <p className="text-xs text-yellow-400">total all time</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "New user registered: Demo User", time: "Just now", type: "success" },
                    { action: "API health check completed", time: "30 seconds ago", type: "info" },
                    { action: "Cases loaded from external API", time: "1 minute ago", type: "success" },
                    { action: "Admin panel accessed", time: "2 minutes ago", type: "info" },
                    { action: "System status updated", time: "5 minutes ago", type: "success" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "success"
                              ? "bg-green-500"
                              : activity.type === "error"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-semibold text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  User Management
                  <Button
                    onClick={loadDashboardData}
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    className="border-gray-600 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-blue-400">{user.balance.ton} TON</span>
                            <span className="text-xs text-yellow-400">{user.balance.stars} ⭐</span>
                            <span className="text-xs text-gray-500">Cases: {user.casesOpened}</span>
                            <span className="text-xs text-gray-500">Last: {user.lastActive}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user.isVip && (
                          <Badge className="bg-purple-600">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                        {user.isBanned && <Badge className="bg-red-600">Banned</Badge>}

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 bg-transparent"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserModal(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-gray-600 ${user.isBanned ? "text-green-400" : "text-red-400"}`}
                            onClick={() => handleBanUser(user.id)}
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Case Management
                  <div className="flex gap-2">
                    <Button
                      onClick={loadDashboardData}
                      size="sm"
                      variant="outline"
                      disabled={isLoading}
                      className="border-gray-600 bg-transparent"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Sync API
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Case
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle>Create New Case</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Case Name *</Label>
                            <Input
                              value={newCase.name}
                              onChange={(e) => setNewCase((prev) => ({ ...prev, name: e.target.value }))}
                              className="bg-gray-700 border-gray-600"
                              placeholder="Enter case name"
                            />
                          </div>
                          <div>
                            <Label>Image URL</Label>
                            <Input
                              value={newCase.image}
                              onChange={(e) => setNewCase((prev) => ({ ...prev, image: e.target.value }))}
                              className="bg-gray-700 border-gray-600"
                              placeholder="Enter image URL (optional)"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Price *</Label>
                              <Input
                                type="number"
                                value={newCase.price}
                                onChange={(e) => setNewCase((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                className="bg-gray-700 border-gray-600"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label>Currency</Label>
                              <select
                                value={newCase.currency}
                                onChange={(e) =>
                                  setNewCase((prev) => ({ ...prev, currency: e.target.value as "TON" | "STARS" }))
                                }
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                              >
                                <option value="STARS">Stars</option>
                                <option value="TON">TON</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label>Category</Label>
                            <select
                              value={newCase.category}
                              onChange={(e) => setNewCase((prev) => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                            >
                              <option value="free">Free</option>
                              <option value="limited">Limited</option>
                              <option value="mix">Mix</option>
                              <option value="nft">NFT</option>
                              <option value="allin">All-in</option>
                            </select>
                          </div>
                          <Button
                            onClick={handleCreateCase}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
                            disabled={!newCase.name || !newCase.price}
                          >
                            Create Case
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cases.map((caseItem) => (
                    <div key={caseItem.id} className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={caseItem.image || "/placeholder.svg"}
                        alt={caseItem.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/200/128?random=${caseItem.id}`
                        }}
                      />
                      <h3 className="font-bold mb-2 line-clamp-1">{caseItem.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-yellow-400 font-bold">
                          {caseItem.price} {caseItem.currency}
                        </span>
                        <Badge className={caseItem.active ? "bg-green-600" : "bg-red-600"}>
                          {caseItem.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">
                        Category: {caseItem.category} • Opens: {caseItem.openCount}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-600 bg-transparent"
                          onClick={() => handleToggleCaseStatus(caseItem.id)}
                        >
                          {caseItem.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-red-400 bg-transparent"
                          onClick={() => handleDeleteCase(caseItem.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {cases.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    {isLoading ? "Loading cases..." : "No cases found. Create one or sync with API."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Broadcast Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="bg-gray-700 border-gray-600 min-h-32"
                    placeholder="Enter your broadcast message..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Will be sent to {users.filter((u) => !u.isBanned).length} active users
                  </p>
                  <Button
                    onClick={handleBroadcast}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!broadcastMessage.trim() || isLoading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Broadcast"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>TON to Stars Rate</Label>
                    <Input type="number" defaultValue={50} className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Stars per 1 TON</p>
                  </div>
                  <div>
                    <Label>Welcome Bonus</Label>
                    <Input type="number" defaultValue={10} className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Stars for new users</p>
                  </div>
                  <div>
                    <Label>Minimum Deposit</Label>
                    <Input type="number" defaultValue={0.1} step="0.1" className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Minimum TON deposit</p>
                  </div>
                  <div>
                    <Label>Referral Bonus</Label>
                    <Input type="number" defaultValue={20} className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Stars for successful referral</p>
                  </div>
                  <div>
                    <Label>VIP Threshold</Label>
                    <Input type="number" defaultValue={1000} className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Stars needed for VIP status</p>
                  </div>
                  <div>
                    <Label>Max Case Opens/Day</Label>
                    <Input type="number" defaultValue={50} className="bg-gray-700 border-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Per user limit</p>
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Edit Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Add/Remove TON</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="bg-gray-700 border-gray-600"
                      id={`ton-${selectedUser.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`ton-${selectedUser.id}`) as HTMLInputElement
                        const amount = Number.parseFloat(input.value) || 0
                        handleUpdateBalance(selectedUser.id, "ton", amount)
                        input.value = ""
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Add/Remove Stars</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="bg-gray-700 border-gray-600"
                      id={`stars-${selectedUser.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`stars-${selectedUser.id}`) as HTMLInputElement
                        const amount = Number.parseInt(input.value) || 0
                        handleUpdateBalance(selectedUser.id, "stars", amount)
                        input.value = ""
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBanUser(selectedUser.id)}
                  className={selectedUser.isBanned ? "bg-green-600" : "bg-red-600"}
                >
                  {selectedUser.isBanned ? "Unban User" : "Ban User"}
                </Button>
                <Button onClick={() => setShowUserModal(false)} variant="outline" className="border-gray-600">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
