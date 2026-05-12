import type { VercelRequest, VercelResponse } from '@vercel/node'

// 클라이언트는 authKey 없이 호출하고, 여기서 서버측 env로 주입
// 같은 (nx, ny, base_date, base_time) 조합이 여러 유저에 공유되므로 성공 응답에 한해 CDN 캐싱

const UPSTREAM = 'https://apihub.kma.go.kr'
const STRIP_PREFIX = '/api/kma'
const ALLOWED_ORIGINS = new Set([
  // 운영 도메인은 별도 관리
  'http://localhost:7001',
  'http://127.0.0.1:7001',
])

function applyCors(req: VercelRequest, res: VercelResponse) {
  const origin =
    typeof req.headers.origin === 'string' ? req.headers.origin.replace(/\/+$/, '') : ''
  const extraOrigin = process.env.APP_PUBLIC_ORIGIN?.replace(/\/+$/, '')

  res.setHeader('access-control-allow-methods', 'GET,OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type, authorization')
  res.setHeader('vary', 'Origin')

  if (origin && (ALLOWED_ORIGINS.has(origin) || origin === extraOrigin)) {
    res.setHeader('access-control-allow-origin', origin)
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }

  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  const authKey = process.env.KMA_AUTH_KEY || ''
  if (!authKey) {
    res.status(500).json({ error: 'Missing KMA auth key' })
    return
  }

  const host = req.headers.host ?? 'localhost'
  const reqUrl = new URL(`http://${host}${req.url ?? ''}`)
  const suffix = reqUrl.pathname.replace(STRIP_PREFIX, '')
  const targetUrl = new URL(UPSTREAM + suffix)

  reqUrl.searchParams.forEach((v, k) => {
    if (k === 'authKey' || k === 'path') return
    targetUrl.searchParams.set(k, v)
  })
  targetUrl.searchParams.set('authKey', authKey)

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: { accept: 'application/json, text/plain, */*' },
    })
    res.status(upstream.status)
    res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json')
    // 성공만 캐싱 실패는 즉시 재시도되도록 no-store.
    const cacheHeader = upstream.ok
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'no-store'
    res.setHeader('cache-control', cacheHeader)
    res.send(await upstream.text())
  } catch (err) {
    res.status(502).json({ error: 'Upstream fetch failed', detail: String(err) })
  }
}
