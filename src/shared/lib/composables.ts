import { ref, watch, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

/**
 * Debounced ref that updates after a delay
 */
export function useDebouncedRef<T>(value: T, delay = 300): Ref<T> {
  const debouncedValue = ref(value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout>

  watch(
    () => value,
    (newValue) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return debouncedValue
}

/**
 * Detect if element is being touched/swiped
 */
export function useSwipe(
  target: Ref<HTMLElement | null>,
  options?: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    threshold?: number
  }
) {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = options || {}

  let startX = 0
  let startY = 0

  useEventListener(target, 'touchstart', (e: TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      startX = touch.clientX
      startY = touch.clientY
    }
  })

  useEventListener(target, 'touchend', (e: TouchEvent) => {
    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // Only trigger if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
  })
}

/**
 * Vibration feedback for touch interactions
 */
export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  function vibrate(pattern: number | number[] = 10): void {
    if (isSupported) {
      navigator.vibrate(pattern)
    }
  }

  function light(): void {
    vibrate(10)
  }

  function medium(): void {
    vibrate(25)
  }

  function heavy(): void {
    vibrate(50)
  }

  function success(): void {
    vibrate([10, 50, 10])
  }

  function error(): void {
    vibrate([50, 50, 50])
  }

  return {
    isSupported,
    vibrate,
    light,
    medium,
    heavy,
    success,
    error
  }
}

/**
 * Format relative time (e.g., "vor 2 Stunden")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'gerade eben'
  } else if (diffMinutes < 60) {
    return `vor ${diffMinutes} Minute${diffMinutes > 1 ? 'n' : ''}`
  } else if (diffHours < 24) {
    return `vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`
  } else if (diffDays < 7) {
    return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
  } else {
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    })
  }
}
