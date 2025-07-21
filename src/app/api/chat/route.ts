import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('API Request body:', body) // Debug log
    
    // Extract data from AI SDK format
    const { messages, agentId } = body
    
    if (!messages || !Array.isArray(messages) || messages.length === 0 || !agentId) {
      return NextResponse.json(
        { error: 'Missing messages or agentId' },
        { status: 400 }
      )
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    // Fetch agent details - using service role, so we need to manually check ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get model provider and configuration
    const modelConfig = agent.model_config
    let model

    // Configure the appropriate model based on agent settings
    if (modelConfig.model.startsWith('gpt-')) {
      model = openai(modelConfig.model)
    } else if (modelConfig.model.startsWith('claude-')) {
      model = anthropic(modelConfig.model)
    } else if (modelConfig.model.startsWith('gemini-')) {
      model = google(modelConfig.model)
    } else {
      // Default to GPT-4 if model not recognized
      model = openai('gpt-4')
    }

    // Create the stream response using messages from AI SDK
    const result = await streamText({
      model,
      system: agent.system_prompt,
      messages: messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.max_tokens,
      topP: modelConfig.top_p,
    })

    // Save user message to database
    await supabase
      .from('chat_messages')
      .insert({
        agent_id: agentId,
        role: 'user',
        content: latestMessage.content,
      })

    // Return streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}