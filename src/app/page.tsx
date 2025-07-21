import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/common/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">PersonaForge</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="sm:size-default">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Create Your Perfect
            <span className="text-primary"> AI Agent</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            PersonaForge empowers you to build highly personalized AI agents with custom personalities 
            and tailored communication styles. Define unique system prompts to create digital personas 
            that understand your specific needs and context.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                Start Building
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Custom Personalities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Define unique AI behaviors, communication styles, and expertise areas for each agent.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-4">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Smart Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Fine-tune model parameters like temperature and token limits for optimal performance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-4">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Engage with your agents through streaming conversations with persistent history.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-4">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Multiple Models</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Choose from GPT-4, Claude, Gemini, and other leading AI models for optimal performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 border">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3 sm:mb-4">
            Ready to build your AI agent?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
            Join thousands of users who are already creating personalized AI experiences.
          </p>
          <Link href="/sign-up" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">PersonaForge</span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Build the future of personalized AI interactions.
          </p>
        </div>
      </footer>
    </div>
  )
}
