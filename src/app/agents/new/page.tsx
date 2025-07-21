'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabase } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Bot, Loader2, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

interface ModelConfig {
  model: string
  temperature: number
  max_tokens: number
  top_p: number
}

const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable OpenAI model' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster and more efficient' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and cost-effective' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google&apos;s advanced model' },
]

const EXAMPLE_PROMPTS = [
  {
    title: 'Helpful Assistant',
    prompt: 'You are a helpful, friendly, and knowledgeable AI assistant. Always be polite, provide accurate information, and ask clarifying questions when needed.'
  },
  {
    title: 'Creative Writer',
    prompt: 'You are a creative writing assistant specializing in storytelling, poetry, and narrative development. Help users craft compelling stories with vivid descriptions and engaging characters.'
  },
  {
    title: 'Code Reviewer',
    prompt: 'You are an expert software engineer and code reviewer. Analyze code for best practices, security vulnerabilities, performance optimizations, and maintainability. Provide constructive feedback and suggestions.'
  },
  {
    title: 'Business Advisor',
    prompt: 'You are a knowledgeable business consultant with expertise in strategy, operations, and growth. Provide practical advice and insights to help businesses succeed.'
  },
]

export default function NewAgentPage() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = useSupabase()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
  })
  
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
  })

  const totalSteps = 3

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0
      case 2:
        return formData.system_prompt.trim().length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to create an agent')
      return
    }

    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: formData.name.trim(),
          system_prompt: formData.system_prompt.trim(),
          model_config: modelConfig,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating agent:', error)
        alert('Failed to create agent. Please try again.')
        return
      }

      // Redirect to the new agent's chat page
      router.push(`/chat/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExamplePrompt = (prompt: string) => {
    setFormData(prev => ({ ...prev, system_prompt: prompt }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Name Your Agent</h2>
              <p className="text-muted-foreground">
                Give your AI agent a memorable name
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Label htmlFor="name" className="text-base font-medium">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Writing Assistant, Code Helper, Business Advisor"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 h-12 text-base"
                autoFocus
                maxLength={100}
              />
              {formData.name.trim().length > 0 && (
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Great! Your agent has a name.
                </p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Define Personality</h2>
              <p className="text-muted-foreground">
                Describe how your agent should behave and respond
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <Label htmlFor="system_prompt" className="text-base font-medium">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  placeholder="Describe your agent's personality, expertise, and communication style..."
                  value={formData.system_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                  rows={6}
                  className="mt-2 text-base resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    Be specific about tone, expertise, and how the agent should communicate.
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formData.system_prompt.length}/500
                  </span>
                </div>
                {formData.system_prompt.trim().length > 20 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Perfect! Your agent has a personality.
                  </p>
                )}
              </div>

              {/* Quick Examples */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Start Examples</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {EXAMPLE_PROMPTS.slice(0, 2).map((example) => (
                    <Button
                      key={example.title}
                      type="button"
                      variant="outline"
                      className="h-auto p-3 text-left justify-start text-sm w-full"
                      onClick={() => handleExamplePrompt(example.prompt)}
                    >
                      <div className="min-w-0 w-full">
                        <div className="font-medium truncate">{example.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {example.prompt.substring(0, 60)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Configure & Review</h2>
              <p className="text-muted-foreground">
                Choose the AI model and review your agent
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">AI Model</Label>
                <Select
                  value={modelConfig.model}
                  onValueChange={(value) => setModelConfig(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.slice(0, 3).map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="text-left w-full">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Creativity</Label>
                  <span className="text-sm text-muted-foreground font-mono">{modelConfig.temperature}</span>
                </div>
                <Slider
                  value={[modelConfig.temperature]}
                  onValueChange={([value]) => setModelConfig(prev => ({ ...prev, temperature: value }))}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower values make responses more focused, higher values more creative.
                </p>
              </div>

              {/* Agent Summary */}
              <div className="border-t pt-6 mt-8">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Agent Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium truncate ml-2 max-w-[200px]">{formData.name || 'Unnamed Agent'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{AVAILABLE_MODELS.find(m => m.id === modelConfig.model)?.name || modelConfig.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creativity:</span>
                    <span className="font-medium">{modelConfig.temperature}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">Create New Agent</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-2 mb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : i + 1 === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded-full ${
                    i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="transition-all duration-300 ease-in-out">
              {renderStep()}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceedFromStep(currentStep)}
              className="flex items-center"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canProceedFromStep(currentStep)}
              className="flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Agent
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}