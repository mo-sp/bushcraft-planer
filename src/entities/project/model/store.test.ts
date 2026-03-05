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

  it('should provide allCategories computed', () => {
    const store = useProjectStore()
    const categories = store.allCategories

    expect(categories.construction).toBe('Bauprojekte')
    expect(categories.exploration).toBe('Erkundung')
    expect(categories.tools).toBe('Werkzeuge & Ausrüstung')
  })

  it('should provide projectsByStatus computed', () => {
    const store = useProjectStore()
    const grouped = store.projectsByStatus

    expect(grouped.planned).toEqual([])
    expect(grouped.in_progress).toEqual([])
    expect(grouped.completed).toEqual([])
  })
})
