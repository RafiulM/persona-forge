-- PersonaForge Database Schema with Clerk Integration
-- Run this in your Supabase SQL Editor

-- Create users table (automatically populated via Clerk webhook)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user_id from auth.jwt()->>'sub'
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  avatar_url TEXT,
  model_config JSONB NOT NULL DEFAULT '{
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 1000,
    "top_p": 1
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies using Clerk JWT

-- Users can only see/modify their own user record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING ((auth.jwt()->>'sub')::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING ((auth.jwt()->>'sub')::text = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK ((auth.jwt()->>'sub')::text = id);

-- Users can only see/modify their own agents
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can create own agents" ON agents
  FOR INSERT WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can delete own agents" ON agents
  FOR DELETE USING ((auth.jwt()->>'sub')::text = user_id);

-- Users can only see/modify chat messages for their own agents
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (
    (auth.jwt()->>'sub')::text = user_id OR 
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = chat_messages.agent_id 
      AND agents.user_id = (auth.jwt()->>'sub')::text
    )
  );

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    (auth.jwt()->>'sub')::text = user_id AND
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = chat_messages.agent_id 
      AND agents.user_id = (auth.jwt()->>'sub')::text
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON agents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some example data (optional)
-- Note: Replace 'your-clerk-user-id' with actual Clerk user ID after setup
/*
INSERT INTO users (id, email) VALUES 
  ('user_example123', 'demo@personaforge.com')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (user_id, name, system_prompt, model_config) VALUES 
  (
    'user_example123', 
    'Helpful Assistant', 
    'You are a helpful and friendly AI assistant. Always be polite and provide accurate information.',
    '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}'::jsonb
  ),
  (
    'user_example123',
    'Code Reviewer', 
    'You are an expert code reviewer. Analyze code for best practices, security issues, and performance optimizations. Be constructive and educational in your feedback.',
    '{"model": "claude-3-sonnet", "temperature": 0.3, "max_tokens": 1500}'::jsonb
  );
*/