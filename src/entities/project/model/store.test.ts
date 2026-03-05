import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from './store'

describe('useProjectStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty projects', () => {
    const store = useProjectStore()
    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should provide projectsByCategory computed', () => {
    const store = useProjectStore()
    const grouped = store.projectsByCategory

    expect(grouped.shelter).toEqual([])
    expect(grouped.fire).toEqual([])
    expect(grouped.tools).toEqual([])
    expect(grouped.custom).toEqual([])
  })

  it('should provide projectsByStatus computed', () => {
    const store = useProjectStore()
    const grouped = store.projectsByStatus

    expect(grouped.planned).toEqual([])
    expect(grouped.in_progress).toEqual([])
    expect(grouped.completed).toEqual([])
  })
})
