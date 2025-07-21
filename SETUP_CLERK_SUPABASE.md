# 🔐 Clerk + Supabase Integration Setup Guide

This guide walks you through setting up the official Clerk + Supabase integration for PersonaForge.

## 📋 Prerequisites

- Clerk account and application set up
- Supabase project created
- Node.js and npm installed

## 🎯 Step 1: Clerk JWT Template Configuration

### 1.1 Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your PersonaForge application
3. Navigate to **Configure → Sessions**
4. Click on **JWT Templates**

### 1.2 Create Supabase JWT Template
1. Click **"+ New template"**
2. Choose **"Supabase"** from the template options
3. Name it: `supabase`
4. Use the following configuration:

**Template Claims:**
```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "{{iss}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "phone": "{{user.primary_phone_number.phone_number}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "email": "{{user.primary_email_address.email_address}}",
    "email_verified": {{user.primary_email_address.verification.status == "verified"}},
    "phone_verified": {{user.primary_phone_number.verification.status == "verified"}},
    "sub": "{{user.id}}"
  },
  "role": "authenticated"
}
```

5. **Save** the template

## 🗄️ Step 2: Supabase Configuration

### 2.1 Get Supabase JWT Secret
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy the **JWT Secret** (you'll need this for Clerk)

### 2.2 Configure Supabase JWT Settings
1. In Supabase Dashboard, go to **Authentication → Settings**
2. Scroll to **JWT Settings**
3. Add Clerk as an additional JWT issuer:
   - **Issuer**: `https://your-clerk-frontend-api-url` (from Clerk Dashboard)
   - **JWKS URI**: `https://your-clerk-frontend-api-url/.well-known/jwks.json`

### 2.3 Update JWT Secret in Clerk
1. Back in Clerk Dashboard → JWT Templates → your `supabase` template
2. Click **Advanced**
3. Set **Signing Key**: Use your Supabase JWT Secret
4. **Save** the changes

## 🔗 Step 3: Clerk Webhook Setup

### 3.1 Create Webhook in Clerk
1. In Clerk Dashboard, go to **Configure → Webhooks**
2. Click **"+ Add Endpoint"**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
4. **Events to listen for**:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
5. **Save** and copy the **Webhook Secret**

### 3.2 Configure Environment Variables
Add to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Provider API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-your_key
OPENAI_API_KEY=sk-proj-your_key
GOOGLE_API_KEY=your_google_key
```

## 🚀 Step 4: Database Migration

### 4.1 Run the Supabase Migration
```bash
# If using Supabase CLI
supabase db push

# Or copy the SQL from supabase/migrations/20250720000001_clerk_integration.sql
# and run it in your Supabase SQL Editor
```

### 4.2 Verify Database Setup
1. Check that these tables were created:
   - `public.users`
   - `public.agents` 
   - `public.chat_messages`
2. Verify Row Level Security (RLS) is enabled on all tables
3. Check that the `auth.uid()` function was created

## ✅ Step 5: Test the Integration

### 5.1 Test User Registration
1. Start your development server: `npm run dev`
2. Navigate to `/sign-up`
3. Create a new user account
4. Check Supabase Dashboard → Authentication → Users
5. Verify the user appears in both `auth.users` and `public.users`

### 5.2 Test JWT Token Generation
1. Sign in to your application
2. Open browser DevTools → Network tab
3. Perform an action that calls Supabase (like viewing dashboard)
4. Check that requests include `Authorization: Bearer <jwt_token>` headers

### 5.3 Test Row Level Security
1. Create an agent in the dashboard
2. Check Supabase Dashboard → Table Editor → agents
3. Verify the agent was created with the correct `user_id`
4. Test that you can only see your own agents

## 🔧 Step 6: Production Deployment

### 6.1 Update Webhook URL
1. In Clerk Dashboard → Webhooks
2. Update endpoint URL to your production domain
3. Test webhook delivery

### 6.2 Environment Variables
1. Set all environment variables in your production platform
2. Ensure Supabase project is in production mode
3. Update any hardcoded URLs to production domains

## 🛠️ Troubleshooting

### Common Issues

**JWT Token Invalid**
- Verify JWT template name matches `template: 'supabase'` in code
- Check that Supabase JWT secret matches Clerk configuration
- Ensure user is signed in when making requests

**User Not Created in Supabase**
- Check webhook is configured and firing
- Verify webhook secret in environment variables
- Check Vercel/deployment logs for webhook errors

**RLS Policy Blocking Queries**
- Verify `auth.uid()` function exists and returns correct user ID
- Check that policies use `auth.uid() = user_id`
- Ensure JWT token contains correct `sub` claim

**Build Errors**
- Run `npm run build` to check for TypeScript errors
- Verify all environment variables are set
- Check that database types match actual schema

### Debug Commands

```bash
# Check environment variables
cat .env.local

# Test build
npm run build

# Check webhook endpoint locally
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase + Clerk Guide](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT.io Debugger](https://jwt.io/) - For debugging JWT tokens

---

🎉 **Congratulations!** Your Clerk + Supabase integration is now set up and ready for secure, scalable authentication in PersonaForge!