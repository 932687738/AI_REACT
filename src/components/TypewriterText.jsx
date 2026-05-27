import { useEffect, useRef, useState } from 'react'

const BASE_INTERVAL_MS = 28
const CATCH_UP_CHARS = 2
const MAX_CHARS_PER_TICK = 14

/**
 * 将流式文本以打字机方式逐字展示；流结束后会加速补齐剩余内容。
 * 用于知识库、智能体、项目经理等聊天模式的助手回复。
 */
export default function TypewriterText({
  text = '',
  active = false,
  className = 'bubble__text',
  onReveal,
}) {
  const [displayedText, setDisplayedText] = useState(() => (active ? '' : text))
  const displayedLengthRef = useRef(active ? 0 : text.length)
  const timerRef = useRef(null)

  useEffect(() => {
    function tick() {
      const targetLength = text.length
      const currentLength = displayedLengthRef.current
      const backlog = targetLength - currentLength

      if (backlog <= 0) {
        if (!active) {
          timerRef.current = null
          return
        }

        timerRef.current = window.setTimeout(tick, BASE_INTERVAL_MS)
        return
      }

      const backlogBoost = Math.floor(backlog / 36)
      const step = active
        ? Math.min(MAX_CHARS_PER_TICK, CATCH_UP_CHARS + backlogBoost)
        : Math.min(MAX_CHARS_PER_TICK, backlog)

      const nextLength = Math.min(targetLength, currentLength + step)
      displayedLengthRef.current = nextLength
      setDisplayedText(text.slice(0, nextLength))
      onReveal?.()

      const delay = active && backlog > 24 ? 10 : BASE_INTERVAL_MS
      timerRef.current = window.setTimeout(tick, delay)
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    if (!active && text.length <= displayedLengthRef.current) {
      setDisplayedText(text)
      displayedLengthRef.current = text.length
      return undefined
    }

    timerRef.current = window.setTimeout(tick, 0)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, active, onReveal])

  const showCursor = active || displayedText.length < text.length

  return (
    <div className={className}>
      {displayedText}
      {showCursor ? <span className="stream-cursor" /> : null}
    </div>
  )
}
