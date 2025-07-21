# PersonaForge Setup Guide - Clerk + Supabase Integration

## 🎯 Architecture Overview
PersonaForge integrates **Clerk authentication** with **Supabase database** following the official Clerk documentation for seamless user management and data security.

## ✅ Completed Setup
Your environment variables are already configured! Now you need to complete the integration:

## 🔧 Remaining Steps

### 1. Configure Clerk JWT Template for Supabase
In your Clerk Dashboard:

1. Go to **"Configure" → "JWT Templates"**
2. Click **"New template"** 
3. Select **"Supabase"** as the template type
4. Name it `supabase`
5. The template will auto-configure with the correct claims

### 2. Run Database Migration
In your **Supabase SQL Editor**:

1. Copy the entire contents of `supabase-schema.sql` 
2. Paste into SQL Editor
3. Click **"Run"** to create:
   - `users`, `agents`, `chat_messages` tables
   - Row Level Security policies  
   - Indexes and triggers
   - Clerk JWT integration

### 3. Set Up Clerk Webhook (Optional but Recommended)
In your **Clerk Dashboard**:

1. Go to **"Configure" → "Webhooks"**
2. Click **"Add Endpoint"**  
3. Set URL: `http://localhost:3002/api/webhooks/clerk` (or your production URL)
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the **"Signing Secret"** 
6. Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_your_secret_here`

### 4. Configure Supabase Auth (If Needed)
In your **Supabase Dashboard**:

1. Go to **"Authentication" → "Providers"**
2. Scroll to **"Auth0"** (or third-party providers)
3. If you see Clerk integration, configure it with your Clerk domain

## 🗂️ What's Already Built

### Database Schema
- **Row Level Security** using Clerk JWT tokens
- **Auto user_id detection** from `auth.jwt()->>'sub'`
- **Cascade deletions** for data cleanup
- **Optimized indexes** for performance

### Authentication Integration  
- **Clerk-Supabase client** for frontend (`useSupabase` hook)
- **Server-side client** for API routes
- **Webhook handler** for user synchronization
- **Protected dashboard** with user data display

### Components Ready
- **Dashboard** shows user's agents and handles loading states
- **Navigation** with Clerk UserButton
- **Landing page** updated for simplified approach

## 🚀 Test Your Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Visit `http://localhost:3002`
   - Click "Get Started" to sign up
   - Verify you're redirected to the dashboard
   - Check that your name appears in the welcome message

3. **Test Database Connection**:
   - Dashboard should load without errors showing "Your AI Agents"
   - Check Supabase dashboard for your user record in `users` table
   - Any connection errors will appear in the dashboard

4. **Verify Integration**:
   - Sign out and sign back in
   - Dashboard should remember you and show consistent data
   - Check browser console for any errors

## 🎯 What's Next

Once your setup is complete and tested, you can:

1. **Create Agent Creation Form** - Build the multi-step form for creating AI agents
2. **Implement Chat Interface** - Add real-time streaming chat with AI models  
3. **Add Agent Management** - Edit, delete, and organize agents
4. **Integrate AI Models** - Connect OpenAI, Anthropic, and Google APIs

## 🚨 Troubleshooting

### Common Issues:

1. **"Failed to load agents" error**:
   - Check that you've run the database migration
   - Verify Clerk JWT template is named `supabase`
   - Check browser console for specific errors

2. **Infinite loading on dashboard**:
   - Verify environment variables are correct
   - Check that Supabase URL and keys are valid
   - Ensure you're signed in to Clerk

3. **User not appearing in Supabase**:
   - Set up the Clerk webhook (Step 3)
   - Or manually insert your user into the `users` table

The integration follows the official Clerk + Supabase pattern for secure, scalable authentication! 🔒
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Visit `http://localhost:3002`
   - Click "Get Started" to sign up
   - Verify you're redirected to the dashboard

3. **Test Database Connection**:
   - Check the dashboard loads without errors
   - Look for your user in Supabase dashboard

## 🗂️ Simplified Database Schema

**3 Tables Only:**
- `users` - Store Clerk user data
- `agents` - Store AI agents with system prompts
- `chat_messages` - Store conversation history

**Key Features:**
- **System Prompt Customization**: Each agent has a unique personality/behavior
- **Model Selection**: Choose from GPT-4, Claude, Gemini
- **Parameter Tuning**: Adjust temperature, max tokens, top_p
- **Chat History**: Persistent conversations per agent
- **Row Level Security**: Users only see their own data

## 🎯 What's Next

Once your setup is complete, you can:
1. Create agent creation forms
2. Build the chat interface
3. Integrate AI model APIs
4. Add agent management features

The simplified approach makes PersonaForge faster to build and easier to maintain while still providing powerful customization through system prompts!