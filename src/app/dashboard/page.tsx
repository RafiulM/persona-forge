'use client'

import { useUser } from '@clerk/nextjs'
import { useSupabase } from '@/hooks/useSupabase'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2, Bot, Sparkles, MessageCircle, Settings } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  system_prompt: string
  avatar_url: string | null
  model_config: {
    model: string
    temperature?: number
    max_tokens?: number
    top_p?: number
  }
  created_at: string
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching agents:', error)
          setError('Failed to load agents')
        } else {
          setAgents(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchAgents()
    }
  }, [user, isLoaded, supabase])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}!
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Agent</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Your AI Agents</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create and manage your personalized AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Loading agents...</span>
              </div>
            ) : agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="relative mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center">
                    <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No AI Agents Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md text-center leading-relaxed">
                  Create your first AI agent to get started. Define its personality, choose a model, and start chatting!
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/agents/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Agent
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Takes less than 2 minutes to set up
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate mb-1">
                            {agent.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {agent.system_prompt.length > 60
                              ? `${agent.system_prompt.substring(0, 60)}...`
                              : agent.system_prompt}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Settings className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">
                            {agent.model_config.model}
                          </span>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="h-8 px-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Link href={`/chat/${agent.id}`}>
                            <MessageCircle className="w-4 h-4 mr-1.5" />
                            Chat
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}