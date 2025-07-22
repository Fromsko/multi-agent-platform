"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Bot,
  Building2,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Globe,
  Sparkles,
  Rocket,
  Target,
  Star,
  Play,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // 自动轮播特性
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (user) {
    return null // 重定向中
  }

  const features = [
    {
      icon: Building2,
      title: "真实公司模拟",
      description: "完整的公司架构，从CEO到员工，每个Agent都有明确的职责分工",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "智能协作",
      description: "Agent之间自动协作，按照真实工作流程完成复杂项目",
      color: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "高效执行",
      description: "24/7不间断工作，大幅提升项目执行效率和质量",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Bot,
      title: "灵活配置",
      description: "自定义Agent角色、技能和工作流程，适应各种业务场景",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "安全可靠",
      description: "企业级安全保障，数据加密存储，权限精细控制",
      color: "text-red-600",
      bgColor: "bg-red-100",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Globe,
      title: "多场景支持",
      description: "支持软件开发、市场调研、内容创作等多种业务场景",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      gradient: "from-indigo-500 to-blue-500",
    },
  ]

  const stats = [
    { number: "10,000+", label: "活跃用户", icon: Users },
    { number: "50,000+", label: "AI Agent", icon: Bot },
    { number: "1,000+", label: "企业客户", icon: Building2 },
    { number: "99.9%", label: "服务可用性", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-hidden">
      {/* Header */}
      <header className="relative z-50 px-4 py-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AgentCorp
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              {["产品", "解决方案", "定价", "文档"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => router.push("/auth/login")}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                登录
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="btn-primary relative overflow-hidden group"
              >
                <span className="relative z-10">免费注册</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
                {["产品", "解决方案", "定价", "文档"].map((item) => (
                  <a key={item} href="#" className="block text-gray-600 hover:text-primary-600 font-medium">
                    {item}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="block w-full text-left text-gray-600 hover:text-primary-600 font-medium"
                  >
                    登录
                  </button>
                  <button onClick={() => router.push("/auth/register")} className="btn-primary w-full">
                    免费注册
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <motion.div
                  className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI驱动的未来工作方式</span>
                </motion.div>

                <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-gray-900">构建您的</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI 公司
                  </span>
                </h2>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  通过智能Agent模拟真实公司运营，让AI员工协作完成复杂项目。 从软件开发到市场调研，打造属于您的虚拟企业。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <motion.button
                  onClick={() => router.push("/auth/register")}
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">开始创建公司</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.button>

                <motion.button
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                    <Play className="w-5 h-5 text-primary-600 ml-1" />
                  </div>
                  <span className="font-medium">观看演示</span>
                </motion.button>
              </div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-gray-600 flex items-center justify-center sm:justify-start space-x-2">
                      <stat.icon className="w-4 h-4" />
                      <span>{stat.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ y }}
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-8 relative z-10"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI软件开发公司</h3>
                      <p className="text-gray-500 text-sm">5个Agent正在协作</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "产品经理AI", status: "规划中", color: "bg-blue-500" },
                      { name: "前端开发AI", status: "开发中", color: "bg-green-500" },
                      { name: "后端开发AI", status: "测试中", color: "bg-yellow-500" },
                    ].map((agent, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${agent.color} rounded-full animate-pulse`} />
                          <span className="font-medium text-gray-900">{agent.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{agent.status}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full opacity-20"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-20 h-20 bg-purple-300 rounded-full opacity-20"
            animate={{ scale: [1, 1.5, 1], rotate: [0, -180, -360] }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, delay: 4 }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Star className="w-4 h-4" />
              <span>核心优势</span>
            </motion.div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">为什么选择 AgentCorp？</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们提供最先进的AI Agent管理平台，让您轻松构建和管理虚拟公司
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`card hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  activeFeature === index ? "ring-2 ring-primary-500 shadow-xl" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onHoverStart={() => setActiveFeature(index)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                />

                <div className="relative z-10">
                  <motion.div
                    className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </motion.div>

                  <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                  <motion.div
                    className="mt-4 flex items-center text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <span className="text-sm font-medium">了解更多</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-primary-600 to-blue-700 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-white mb-4">数字说话</h3>
            <p className="text-xl text-primary-100">全球用户的信任选择</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-4xl font-bold text-gray-900 mb-4">准备好创建您的AI公司了吗？</h3>
            <p className="text-xl text-gray-600 mb-8">加入数千家企业，体验AI驱动的未来工作方式</p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.button
                onClick={() => router.push("/auth/register")}
                className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>免费开始</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                className="border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 font-bold py-4 px-8 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                联系销售
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">AgentCorp</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">构建智能AI公司，让Agent协作完成复杂项目，体验未来工作方式。</p>
              <div className="flex space-x-4">
                {["微信", "微博", "LinkedIn"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-sm">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <div className="space-y-2">
                {["Agent管理", "公司模拟", "工作流程", "API接口"].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <div className="space-y-2">
                {["帮助中心", "API文档", "社区论坛", "联系我们"].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 mb-4 md:mb-0">&copy; 2024 AgentCorp. 保留所有权利。</p>
            <div className="flex items-center space-x-6 text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">
                隐私政策
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                服务条款
              </a>
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookie政策
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: scrollYProgress.get() > 0.2 ? 1 : 0, scale: scrollYProgress.get() > 0.2 ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ChevronDown className="w-6 h-6 rotate-180" />
      </motion.button>
    </div>
  )
}
