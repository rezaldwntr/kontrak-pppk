// api/drive/token.js
// Vercel Serverless Function — menangani OAuth2 token exchange & refresh
// Tidak menggunakan firebase-admin. Frontend (authenticated) yang menulis ke Firestore.

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const DEFAULT_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://kontrak-pppk.vercel.app/drive'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action || 'exchange'

  try {
    if (action === 'exchange') {
      const { code, redirectUri } = req.query
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

      // Kembalikan semua data ke frontend. Frontend yang menulis ke Firestore (sudah terautentikasi).
      return res.status(200).json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenExpiry: expiry,
        connectedEmail: userInfo.email || '',
        scope: tokenData.scope || '',
      })

    } else if (action === 'refresh') {
      // Frontend membaca refreshToken dari Firestore dan mengirimkannya ke sini
      const refreshToken = req.query.refreshToken
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
      const { refreshToken } = req.query
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