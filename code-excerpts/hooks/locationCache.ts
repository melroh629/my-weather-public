// 위치 캐시는 두 가지 부담을 같이 해결한다
//   1) WebView 진입마다 위치 권한 prompt가 뜨면 UX가 깨짐
//   2) 같은 좌표면 어차피 같은 격자(nx, ny)로 변환돼 날씨 응답 캐시도 재활용 가능
// TTL 30분은 "이동하지 않은 채 앱을 다시 여는 빈도" 기준 길게 잡으면 이동 후에도 옛 격자를 씀

export interface GeoLocation {
  lat: number
  lng: number
  nx: number
  ny: number
}

interface CachedLocationPayload {
  loc: GeoLocation
  savedAt: number
}

export const LOCATION_CACHE_KEY = 'my-weather-last-location'
export const LOCATION_CACHE_TTL = 30 * 60 * 1000

export function loadCachedLocation(now: number = Date.now()): GeoLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedLocationPayload
    if (now - parsed.savedAt > LOCATION_CACHE_TTL) return null
    return parsed.loc
  } catch {
    return null
  }
}

export function saveCachedLocation(loc: GeoLocation, now: number = Date.now()) {
  try {
    localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({ loc, savedAt: now } satisfies CachedLocationPayload),
    )
  } catch {
    // quota 에러는 무시 다음 진입 때 다시 시도
  }
}
