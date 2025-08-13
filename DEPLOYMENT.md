# Deployment Guide

## Backend Deployment (Render)

✅ **COMPLETED** - Backend deployed to: https://library-management-system-3ilo.onrender.com

## Frontend Deployment (Vercel)

### Prerequisites

1. Make sure your code is pushed to GitHub
2. Have a Vercel account

### Steps to Deploy

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your `library-management-system-frontend` repository

2. **Configure Environment Variables:**
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variable:
     ```
     Key: NEXT_PUBLIC_API_BASE_URL
     Value: https://library-management-system-3ilo.onrender.com/api
     ```

3. **Deploy:**
   - Vercel will automatically deploy your application
   - The build command and other settings are configured in `vercel.json`

### Important Notes

- The frontend will automatically use the production API URL when deployed
- For local development, you can switch back to `http://localhost:5000/api` in your `.env.local`
- Make sure your backend on Render allows CORS requests from your Vercel domain

### Files Modified for Deployment

1. **`.env.local`** - Updated to use production API URL
2. **`.env.example`** - Created as template for environment variables
3. **`vercel.json`** - Created Vercel configuration
4. **`next.config.js`** - Updated image domains and environment handling

### CORS Configuration (Backend)

Make sure your backend on Render allows CORS requests from your Vercel domain. In your backend CORS configuration, you should allow:

- `https://your-frontend-domain.vercel.app`
- Or use a wildcard `*` for development (not recommended for production)

### Custom Domain (Optional)

After deployment, you can:

1. Add a custom domain in Vercel project settings
2. Update CORS settings on your backend to include the custom domain
