import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactionRecord } from '../score/score'

// 같은 (date, hour) 슬롯이 PK. 한 시간 단위로 good/bad/태그를 덮어쓴다
// useReactions는 Firestore 동기화·로컬 캐시·낙관적 업데이트를 묶은 훅으로, 시그니처만 노출
interface UseReactionsResult {
  reactions: ReactionRecord[]
  upsertReaction: (r: ReactionRecord) => Promise<void>
  removeReaction: (key: { date: string; hour: number }) => Promise<void>
}
declare function useReactions(): UseReactionsResult

export type Reaction = 'good' | 'bad' | null

function reportReactionWriteFailure(action: string, err: unknown) {
  console.error(`[useWeatherReaction] ${action} failed:`, err)
}

function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function useWeatherReaction() {
  // 정시/자정 경계를 넘으면 새 슬롯으로 이동해야 해서 1분 인터벌로 갱신
  const [now, setNow] = useState(() => ({ today: getToday(), hour: new Date().getHours() }))

  useEffect(() => {
    const id = setInterval(() => {
      const next = { today: getToday(), hour: new Date().getHours() }
      setNow((prev) => (prev.today === next.today && prev.hour === next.hour ? prev : next))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const { today, hour } = now
  const { reactions, upsertReaction, removeReaction } = useReactions()

  const currentSlot = useMemo(
    () => reactions.find((r) => r.date === today && r.hour === hour) ?? null,
    [reactions, today, hour],
  )
  const todayReaction: Reaction = currentSlot?.reaction ?? null
  const todayTags = currentSlot?.tags ?? []
  const reactionCount = reactions.length

  const react = useCallback(
    (
      reaction: 'good' | 'bad',
      weather: { temp: number; humidity: number; windSpeed: number; rainType: string },
      pm25: number,
    ) => {
      // 같은 시각에 reaction을 뒤집으면 기존 태그는 무효(긍/부정 의미가 반대라서)
      const prev = currentSlot
      const nextTags = prev && prev.reaction === reaction ? (prev.tags ?? []) : []
      const record: ReactionRecord = {
        date: today,
        hour,
        reaction,
        ...weather,
        pm25,
        ...(nextTags.length > 0 ? { tags: nextTags } : {}),
      }
      void upsertReaction(record).catch((err) => reportReactionWriteFailure('upsertReaction', err))
    },
    [today, hour, currentSlot, upsertReaction],
  )

  const clearReaction = useCallback(() => {
    if (!currentSlot) return
    void removeReaction({ date: today, hour }).catch((err) =>
      reportReactionWriteFailure('removeReaction', err),
    )
  }, [today, hour, currentSlot, removeReaction])

  const setTodayTags = useCallback(
    (tags: string[]) => {
      if (!currentSlot) return
      const next: ReactionRecord = {
        ...currentSlot,
        tags: tags.length > 0 ? tags : undefined,
      }
      void upsertReaction(next).catch((err) => reportReactionWriteFailure('setTodayTags', err))
    },
    [currentSlot, upsertReaction],
  )

  return { todayReaction, todayTags, react, clearReaction, setTodayTags, reactionCount }
}
