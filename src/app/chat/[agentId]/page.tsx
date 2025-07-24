'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabase } from '@/hooks/useSupabase'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bot, Send, User, Loader2, Copy, RotateCcw, Trash2, MoreVertical, Clock } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

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

interface ChatMessage {
  id: string
  agent_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [, setLoadingHistory] = useState(true)

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

      // Fetch chat history
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
      } else {
        setChatHistory(messagesData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setLoadingHistory(false)
    }
  }, [supabase, agentId, router])

  // Use AI SDK's useChat hook for streaming chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload
  } = useChat({
    api: '/api/chat',
    body: {
      agentId
    },
    initialMessages: chatHistory.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(msg.created_at)
    })),
    onFinish: async (message) => {
      // Save AI response to database
      const { data } = await supabase
        .from('chat_messages')
        .insert({
          agent_id: agentId,
          role: 'assistant',
          content: message.content,
        })
        .select()
        .single()

      // Update local chat history
      if (data) {
        setChatHistory(prev => [...prev, data])
      }
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Save user message to database before sending
    const userMessage = {
      agent_id: agentId,
      role: 'user' as const,
      content: input
    }

    const { data } = await supabase
      .from('chat_messages')
      .insert(userMessage)
      .select()
      .single()

    if (data) {
      setChatHistory(prev => [...prev, data])
    }

    handleSubmit(e)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const regenerateResponse = (messageIndex: number) => {
    // Find the last user message before this assistant message
    const userMessages = messages.filter((_, index) => index < messageIndex && messages[index].role === 'user')
    if (userMessages.length > 0) {
      reload()
    }
  }

  const clearChat = async () => {
    try {
      // Delete all messages for this agent
      await supabase
        .from('chat_messages')
        .delete()
        .eq('agent_id', agentId)

      // Clear local state
      setChatHistory([])
      
      // Reload to clear the AI SDK messages
      window.location.reload()
      
      toast.success('Chat cleared')
    } catch {
      toast.error('Failed to clear chat')
    }
  }

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearChat} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex space-x-2 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user' 
                    ? 'flex-row-reverse space-x-reverse items-start' 
                    : 'items-start'
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.role === 'user' ? (
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              code: ({ className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '')
                                const isInline = !match
                                return !isInline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md text-sm"
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center space-x-2 px-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className="flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Clock className="h-3 w-3 mr-1" />
                        {msg.createdAt ? formatTime(msg.createdAt) : 'Now'}
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(msg.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => regenerateResponse(index)}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
            
          
          {isLoading && (
            <div className="flex justify-start px-4">
              <div className="flex space-x-2 max-w-[85%] sm:max-w-[75%]">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-muted">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="bg-muted rounded-2xl px-3 py-2 sm:px-4 sm:py-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
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