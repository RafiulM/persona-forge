import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, Zap, Sparkles, Bot, Users, Shield } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/common/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-blue-50 dark:from-violet-950/20 dark:via-background dark:to-blue-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,182,193,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,182,193,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(144,238,144,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_80%,rgba(144,238,144,0.1),transparent_50%)]" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed" />
      <div className="absolute bottom-32 left-20 w-28 h-28 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow" />
      
      <div className="relative z-10">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6 backdrop-blur-sm bg-background/80 border-b border-border/50">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="relative">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-transform group-hover:scale-110" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PersonaForge
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" className="hover:bg-primary/10 transition-colors">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="sm:size-default bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16 relative">
          {/* Hero badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 group hover:bg-primary/15 transition-colors">
            <Sparkles className="h-4 w-4 text-primary mr-2 animate-pulse" />
            <span className="text-sm font-medium text-primary">✨ Build AI Agents That Understand You</span>
            <Bot className="h-4 w-4 text-primary ml-2 group-hover:animate-bounce" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
              Create Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              AI Agent
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            PersonaForge empowers you to build <span className="text-primary font-semibold">highly personalized AI agents</span> with custom personalities 
            and tailored communication styles. Define unique system prompts to create digital personas 
            that understand your specific needs and context.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                Start Building Free
                <span className="ml-2 text-xl">→</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm transition-all duration-300 group"
            >
              <MessageSquare className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Watch Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 sm:mt-16 opacity-60">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <Card className="h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-4 relative z-10">
              <div className="relative inline-block">
                <Brain className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">Custom Personalities</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Define unique AI behaviors, communication styles, and expertise areas for each agent.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-4 relative z-10">
              <div className="relative inline-block">
                <Zap className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">Smart Configuration</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Fine-tune model parameters like temperature and token limits for optimal performance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-4 relative z-10">
              <div className="relative inline-block">
                <MessageSquare className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Engage with your agents through streaming conversations with persistent history.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-4 relative z-10">
              <div className="relative inline-block">
                <Bot className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">Multiple Models</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Choose from GPT-4, Claude, Gemini, and other leading AI models for optimal performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="relative text-center bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-16 border-2 border-primary/10 overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-600/5 opacity-50" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-600/20 to-transparent rounded-full translate-x-20 translate-y-20 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-card-foreground to-primary bg-clip-text text-transparent">
                Ready to build your AI agent?
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
              Join <span className="font-bold text-primary">10,000+</span> users who are already creating personalized AI experiences. 
              Start building your perfect digital companion today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base sm:text-lg px-10 sm:px-16 py-4 sm:py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group/btn"
                >
                  <Bot className="mr-2 h-5 w-5 group-hover/btn:animate-bounce" />
                  Get Started Free
                  <span className="ml-2 text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground font-medium">
                ✨ No credit card required
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-t from-muted/50 to-background border-t border-border/50 py-12 sm:py-16 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6 group">
            <div className="relative">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PersonaForge
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 font-medium">
            Build the future of personalized AI interactions.
          </p>
          
          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Status: Operational</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Made with ❤️ for AI enthusiasts
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              © 2024 PersonaForge
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
