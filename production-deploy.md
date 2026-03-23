# 🚀 MAGIC QR: PRODUCTION DEPLOYMENT CHECKLIST

Follow these steps to take your SaaS live on **Vercel**.

## 1. Environment Variables
Add these to your **Vercel Project Settings > Environment Variables**:

| Variable | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://ilxupjirtfxbvucvqpxm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_wsdswBBsUehOhx3gUAnuXg_Ex_L3uz9` |
| `VITE_GEMINI_API_KEY` | `AIzaSyBuHvtmtQOcKjpkPXUkFTN8qiAte91XAlI` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyBN4v6T2MeOZO7KNtouwWMINksCNSPEv-Q` |

## 2. Supabase Settings
- [ ] **Google OAuth**: Ensure Authorized Redirect URIs include `https://your-vercel-domain.vercel.app/auth/v1/callback`.
- [ ] **RLS Policies**: Confirm `fix-services-rls.sql` has been executed.

## 3. Build Command
- **Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 4. Verification Flow
1. **Google Signup** → Redirects to `/onboard`.
2. **Step 1 (Find Business)** → Use Google Places search.
3. **Step 2 (Services)** → Add 2-3 services (Verify AI descriptions works).
4. **Step 3 (QR Code)** → Click "Generate" and download the PNG.
5. **Final Step** → Navigate to Dashboard and verify data persistence.

## 5. Post-Launch
- Run `preload-satguru.sql` to have your showcase business ready for demos.
