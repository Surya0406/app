
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_AdaGwpIfJPP-Ami-90Cd3WfmF23CwKL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from command line**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project and deploy.

3. **Set Environment Variable**:
   - Go to your project settings on [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your Gemini API key value
   - Redeploy the application

4. **Deploy with production settings**:
   ```bash
   vercel --prod
   ```

**Alternative: Deploy via GitHub Integration**
- Push your code to GitHub
- Import your repository on [Vercel](https://vercel.com/new)
- Add the `GEMINI_API_KEY` environment variable in project settings
- Vercel will automatically deploy on every push

### Option 2: Deploy to Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variable**:
   - Go to your site settings on [Netlify Dashboard](https://app.netlify.com)
   - Navigate to Site settings → Environment variables
   - Add `GEMINI_API_KEY` with your Gemini API key value
   - Redeploy the application

**Alternative: Deploy via GitHub Integration**
- Push your code to GitHub
- Import your repository on [Netlify](https://app.netlify.com/add-new-site)
- Add the `GEMINI_API_KEY` environment variable in site settings
- Netlify will automatically deploy on every push

### Build for Production

To build the project locally:
```bash
npm run build
```

The production-ready files will be in the `dist` directory.
