// api/drive/token.js
// Vercel Serverless Function — menangani OAuth2 token exchange & refresh secara aman

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const DEFAULT_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://kontrak-pppk.vercel.app/drive'

const ALLOWED_ORIGINS = [
  'https://kontrak-pppk.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
]

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin) || (origin.startsWith('https://') && origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://kontrak-pppk.vercel.app')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') return res.status(204).end()

  let body = {}
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }

  const action = body.action || req.query.action || 'exchange'

  try {
    if (action === 'exchange') {
      const code = body.code || req.query.code
      const redirectUri = body.redirectUri || req.query.redirectUri
      if (!code) return res.status(400).json({ error: 'Missing code parameter' })

      const finalRedirectUri = redirectUri || DEFAULT_REDIRECT_URI

      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: finalRedirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokenData = await tokenRes.json()
      if (tokenData.error) return res.status(400).json({ error: tokenData.error_description || tokenData.error })

      const expiry = Date.now() + (tokenData.expires_in * 1000)

      // Dapatkan info user (email)
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      const userInfo = await userInfoRes.json()

      return res.status(200).json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenExpiry: expiry,
        connectedEmail: userInfo.email || '',
        scope: tokenData.scope || '',
      })

    } else if (action === 'refresh') {
      const refreshToken = body.refreshToken || req.query.refreshToken
      if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refreshToken parameter' })
      }

      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      })

      const tokenData = await tokenRes.json()

      if (tokenData.error) {
        return res.status(401).json({
          error: tokenData.error_description || tokenData.error,
          invalidGrant: tokenData.error === 'invalid_grant',
        })
      }

      const expiry = Date.now() + (tokenData.expires_in * 1000)

      return res.status(200).json({
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
        tokenExpiry: expiry,
        scope: tokenData.scope || '',
      })

    } else if (action === 'revoke') {
      const refreshToken = body.refreshToken || req.query.refreshToken
      if (refreshToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, {
          method: 'POST',
        }).catch(() => {})
      }
      return res.status(200).json({ success: true })

    } else if (action === 'config') {
      return res.status(200).json({
        clientId: CLIENT_ID || '',
      })
    } else {
      return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (err) {
    console.error('Drive token handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}