# Environment Variables Setup

## Required Environment Variables

### NextAuth Configuration (Required)

Add the following to your `.env.local` file:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command to generate a secure secret:
openssl rand -base64 32
```

Or use any random string generator. This should be a long, random string.

### Google Gemini API Key (Required for AI Features)

Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### How to Get Gemini API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

### ImgBB API Key (Required for Image Storage)

Add the following to your `.env.local` file:

```env
IMGBB_API_KEY=your_imgbb_api_key_here
```

### How to Get ImgBB API Key:

1. Go to [ImgBB API](https://api.imgbb.com/)
2. Sign up or log in to your account
3. Navigate to "API" section
4. Copy your API key
5. Add it to your `.env.local` file

### OpenAI API Key (Required for AI Features)

Add the following to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### How to Get OpenAI API Key:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the generated API key
5. Add it to your `.env.local` file

**Note:** OpenAI charges per token usage. GPT-4 Vision costs approximately $0.01 per 1K tokens.

### Complete `.env.local` Example:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-long-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OpenAI (Primary AI Service)
OPENAI_API_KEY=sk-...your-actual-openai-key-here

# Google Gemini AI (Optional - Fallback)
GEMINI_API_KEY=AIzaSy...your-actual-key-here

# ImgBB Image Storage
IMGBB_API_KEY=your-imgbb-api-key-here
```

## Important Notes:

- Never commit `.env.local` to version control
- The Gemini API key is required for AI hairstyle generation
- Free tier includes generous usage limits
- For production, consider upgrading to paid tier for higher limits
