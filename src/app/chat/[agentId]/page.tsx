'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabase } from '@/hooks/useSupabase'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bot, Send, User, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  system_prompt: string
  model_config: {
    model: string
    temperature: number
    max_tokens: number
    top_p: number
  }
}


export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const supabase = useSupabase()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const agentId = params.agentId as string
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAgentAndMessages = useCallback(async () => {
    try {
      // Fetch agent details
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (agentError) {
        console.error('Error fetching agent:', agentError)
        router.push('/dashboard')
        return
      }

      setAgent(agentData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, agentId, router])

  // Use AI SDK's useChat hook for streaming chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: '/api/chat',
    body: {
      agentId
    },
    onFinish: async (message) => {
      // Save AI response to database
      await supabase
        .from('chat_messages')
        .insert({
          agent_id: agentId,
          role: 'assistant',
          content: message.content,
        })
    }
  })

  useEffect(() => {
    if (!user || !agentId) return
    fetchAgentAndMessages()
  }, [user, agentId, fetchAgentAndMessages])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Agent not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card flex-shrink-0">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg font-semibold truncate">{agent.name}</h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.model_config.model}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 space-y-2 sm:space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Chat with {agent.name} to get started
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user' 
                    ? 'flex-row-reverse space-x-reverse items-start' 
                    : 'items-end'
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.role === 'user' ? (
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
            
          
          {error && (
            <div className="flex justify-center px-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-2 max-w-full">
                <p className="text-destructive text-sm break-words">
                  Error: {error.message}
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t bg-card p-3 sm:p-4 flex-shrink-0 safe-bottom">
          <form onSubmit={handleFormSubmit} className="flex space-x-2 sm:space-x-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1 rounded-full text-base bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
            <Button 
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0 h-10 w-10 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}