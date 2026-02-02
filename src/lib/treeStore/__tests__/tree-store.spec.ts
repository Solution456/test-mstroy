import { beforeEach, describe, expect, it, vi } from 'vitest'

import TreeStore from '../tree-store'
import type { TreeStoreNode } from '../types'

describe('TreeStore', () => {
  let store: TreeStore

  const createInitialItems = (): TreeStoreNode[] => [
    { id: 1, parentId: null, label: 'Root 1' },
    { id: 2, parentId: null, label: 'Root 2' },
    { id: 3, parentId: 1, label: 'Child 1.1' },
    { id: 4, parentId: 1, label: 'Child 1.2' },
    { id: 5, parentId: 3, label: 'Child 1.1.1' },
    { id: 6, parentId: 3, label: 'Child 1.1.2' },
    { id: 7, parentId: 4, label: 'Child 1.2.1' },
    { id: 8, parentId: 2, label: 'Child 2.1' }
  ]

  beforeEach(() => {
    store = new TreeStore(createInitialItems())
  })

  describe('constructor', () => {
    it('should create store with initial items', () => {
      expect(store.getAll()).toHaveLength(8)
    })

    it('should create store with empty array', () => {
      const emptyStore = new TreeStore([])
      expect(emptyStore.getAll()).toHaveLength(0)
    })

    it('should not mutate original array', () => {
      const originalItems = createInitialItems()
      const originalLength = originalItems.length

      new TreeStore(originalItems)
      originalItems.push({ id: 999, parentId: null, label: 'New Root' })

      expect(store.getAll()).toHaveLength(originalLength)
    })
  })

  describe('getAll', () => {
    it('should return all items', () => {
      const allItems = store.getAll()
      expect(allItems).toHaveLength(8)
    })

    it('should return empty array for empty store', () => {
      const emptyStore = new TreeStore([])
      expect(emptyStore.getAll()).toEqual([])
    })
  })

  describe('getItem', () => {
    it('should return item by id', () => {
      const item = store.getItem(1)

      expect(item).not.toBeNull()
      expect(item?.id).toBe(1)
      expect(item?.label).toBe('Root 1')
    })

    it('should return null for non-existent id', () => {
      expect(store.getItem(999)).toBeNull()
    })

    it('should work with string ids', () => {
      const stringIdStore = new TreeStore([
        { id: 'a', parentId: null, label: 'Root A' },
        { id: 'b', parentId: 'a', label: 'Child B' }
      ])

      expect(stringIdStore.getItem('a')?.label).toBe('Root A')
      expect(stringIdStore.getItem('b')?.parentId).toBe('a')
    })
  })

  describe('getChildren', () => {
    it('should return direct children only', () => {
      const children = store.getChildren(1)

      expect(children).toHaveLength(2)
      expect(children.map((c) => c.id)).toEqual(expect.arrayContaining([3, 4]))
    })

    it('should return empty array for leaf node', () => {
      expect(store.getChildren(5)).toHaveLength(0)
    })

    it('should return empty array for non-existent id', () => {
      expect(store.getChildren(999)).toHaveLength(0)
    })

    it('should return empty array for root nodes', () => {
      expect(store.getChildren(null as any)).toHaveLength(0)
    })
  })

  describe('getAllChildren', () => {
    it('should return all descendants recursively', () => {
      const allChildren = store.getAllChildren(1)

      expect(allChildren).toHaveLength(5)
      expect(allChildren.map((c) => c.id)).toEqual(
        expect.arrayContaining([3, 4, 5, 6, 7])
      )
    })

    it('should return empty array for leaf node', () => {
      expect(store.getAllChildren(5)).toHaveLength(0)
    })

    it('should return empty array for non-existent id', () => {
      expect(store.getAllChildren(999)).toHaveLength(0)
    })

    it('should return children in BFS order', () => {
      const allChildren = store.getAllChildren(1)

      const ids = allChildren.map((c) => c.id)
      const indexOf3 = ids.indexOf(3)
      const indexOf4 = ids.indexOf(4)
      const indexOf5 = ids.indexOf(5)

      expect(indexOf3).toBeLessThan(indexOf5)
      expect(indexOf4).toBeLessThan(indexOf5)
    })

    it('should handle deep nesting', () => {
      const deepStore = new TreeStore([
        { id: 1, parentId: null, label: 'Root 1' },
        { id: 2, parentId: 1, label: 'Child 1.1' },
        { id: 3, parentId: 2, label: 'Child 1.1.1' },
        { id: 4, parentId: 3, label: 'Child 1.1.1.1' },
        { id: 5, parentId: 4, label: 'Child 1.1.1.1.1' }
      ])

      const allChildren = deepStore.getAllChildren(1)
      expect(allChildren).toHaveLength(4)
    })
  })

  describe('getParent', () => {
    it('should return parent item', () => {
      const parent = store.getParent(3)

      expect(parent).not.toBeNull()
      expect(parent?.id).toBe(1)
    })

    it('should return null for root item', () => {
      expect(store.getParent(1)).toBeNull()
    })

    it('should return null for non-existent id', () => {
      expect(store.getParent(999)).toBeNull()
    })
  })

  describe('getAllParents', () => {
    it('should return all ancestors including self', () => {
      const allParents = store.getAllParents(5)

      expect(allParents).toHaveLength(3)
      expect(allParents.map((p) => p.id)).toEqual([5, 3, 1])
    })

    it('should return only self for root item', () => {
      const allParents = store.getAllParents(1)

      expect(allParents).toHaveLength(1)
      expect(allParents[0].id).toBe(1)
    })

    it('should return empty array for non-existent id', () => {
      expect(store.getAllParents(999)).toHaveLength(0)
    })

    it('should return path from node to root', () => {
      const path = store.getAllParents(7)

      expect(path.map((p) => p.id)).toEqual([7, 4, 1])
    })
  })

  describe('addItem', () => {
    it('should add new item to store', () => {
      store.addItem({ id: 9, parentId: 1, label: 'New Child' })

      expect(store.getItem(9)).not.toBeNull()
      expect(store.getAll()).toHaveLength(9)
    })

    it('should add item to parent children list', () => {
      store.addItem({ id: 9, parentId: 1, label: 'New Child' })

      expect(store.getChildren(1)).toHaveLength(3)
      expect(store.getChildren(1).map((c) => c.id)).toContain(9)
    })

    it('should add root item (parentId: null)', () => {
      store.addItem({ id: 10, parentId: null, label: 'New Root' })

      expect(store.getItem(10)).not.toBeNull()
      expect(store.getAll()).toHaveLength(9)
    })

    it('should warn and skip when adding item with existing id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.addItem({ id: 1, parentId: null, label: 'Duplicate' })

      expect(warnSpy).toHaveBeenCalledWith('Item with id 1 already exists')
      expect(store.getAll()).toHaveLength(8)
      expect(store.getItem(1)?.label).toBe('Root 1') // Original unchanged

      warnSpy.mockRestore()
    })

    it('should warn and skip when parent does not exist', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.addItem({ id: 10, parentId: 999, label: 'Orphan' })

      expect(warnSpy).toHaveBeenCalledWith(
        'Parent item with id 999 does not exist'
      )
      expect(store.getItem(10)).toBeNull()

      warnSpy.mockRestore()
    })

    it('should handle adding to newly created parent', () => {
      store.addItem({ id: 9, parentId: null, label: 'New Root' })
      store.addItem({ id: 10, parentId: 9, label: 'Child of New Root' })

      expect(store.getChildren(9)).toHaveLength(1)
      expect(store.getChildren(9)[0].id).toBe(10)
    })
  })

  describe('removeItem', () => {
    it('should remove item from store', () => {
      store.removeItem(5)

      expect(store.getItem(5)).toBeNull()
      expect(store.getAll()).toHaveLength(7)
    })

    it('should remove all descendants', () => {
      store.removeItem(3)

      expect(store.getItem(3)).toBeNull()
      expect(store.getItem(5)).toBeNull()
      expect(store.getItem(6)).toBeNull()
      expect(store.getAll()).toHaveLength(5)
    })

    it('should update parent children list', () => {
      store.removeItem(3)

      const children = store.getChildren(1)
      expect(children).toHaveLength(1)
      expect(children[0].id).toBe(4)
    })

    it('should remove item from mapChildren', () => {
      store.removeItem(3)

      expect(store.getChildren(3)).toHaveLength(0)
    })

    it('should warn when removing non-existent item', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.removeItem(999)

      expect(warnSpy).toHaveBeenCalledWith('Item with id 999 does not exist')
      expect(store.getAll()).toHaveLength(8)

      warnSpy.mockRestore()
    })

    it('should handle removing root item with children', () => {
      store.removeItem(1)

      expect(store.getItem(1)).toBeNull()
      expect(store.getItem(3)).toBeNull()
      expect(store.getItem(4)).toBeNull()
      expect(store.getItem(5)).toBeNull()
      expect(store.getAll()).toHaveLength(2)
    })

    it('should not affect sibling branches', () => {
      store.removeItem(3)

      expect(store.getItem(4)).not.toBeNull()
      expect(store.getItem(7)).not.toBeNull()
      expect(store.getItem(2)).not.toBeNull()
      expect(store.getItem(8)).not.toBeNull()
    })
  })

  describe('updateItem', () => {
    it('should update item properties', () => {
      store.updateItem({ id: 1, parentId: null, label: 'Updated Root' })

      expect(store.getItem(1)?.label).toBe('Updated Root')
    })

    it('should change item parent', () => {
      store.updateItem({ id: 3, parentId: 2, label: 'Moved Child' })

      expect(store.getParent(3)?.id).toBe(2)
      expect(store.getChildren(1)).toHaveLength(1)
      expect(store.getChildren(2)).toHaveLength(2)
    })

    it('should move children along with parent', () => {
      store.updateItem({ id: 3, parentId: 2, label: 'Moved Child' })

      const allChildren = store.getAllChildren(2)
      expect(allChildren.map((c) => c.id)).toEqual(
        expect.arrayContaining([3, 5, 6, 8])
      )
    })

    it('should warn when updating non-existent item', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.updateItem({ id: 999, parentId: null, label: 'Ghost' })

      expect(warnSpy).toHaveBeenCalledWith('Item with id 999 does not exist')

      warnSpy.mockRestore()
    })

    it('should warn when new parent does not exist', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.updateItem({ id: 3, parentId: 999, label: 'Invalid Parent' })

      expect(warnSpy).toHaveBeenCalledWith(
        'Parent item with id 999 does not exist'
      )
      expect(store.getParent(3)?.id).toBe(1) // Unchanged

      warnSpy.mockRestore()
    })

    it('should detect and prevent circular reference (parent to child)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Try to make node 1 a child of node 5 (which is descendant of 1)
      store.updateItem({ id: 1, parentId: 5, label: 'Circular' })

      expect(warnSpy).toHaveBeenCalledWith('Circular reference detected')
      expect(store.getItem(1)?.parentId).toBeNull() // Unchanged

      warnSpy.mockRestore()
    })

    it('should detect circular reference (parent to grandchild)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.updateItem({ id: 1, parentId: 7, label: 'Circular' })

      expect(warnSpy).toHaveBeenCalledWith('Circular reference detected')

      warnSpy.mockRestore()
    })

    it('should allow moving to sibling branch', () => {
      // Move node 3 under node 4 (sibling)
      store.updateItem({ id: 3, parentId: 4, label: 'Moved to Sibling' })

      expect(store.getParent(3)?.id).toBe(4)
      expect(store.getChildren(4)).toHaveLength(2)
    })

    it('should allow moving to different tree', () => {
      // Move node 3 under node 2 (different root)
      store.updateItem({ id: 3, parentId: 2, label: 'Moved to Tree 2' })

      expect(store.getParent(3)?.id).toBe(2)
      expect(store.getAllChildren(1).map((c) => c.id)).not.toContain(3)
    })

    it('should preserve reference to the same object', () => {
      const originalItem = store.getItem(1)
      store.updateItem({ id: 1, parentId: null, label: 'Updated' })
      const updatedItem = store.getItem(1)

      expect(originalItem).toBe(updatedItem)
    })
  })

  describe('removeItemFromChildren', () => {
    it('should remove child from parent children list', () => {
      expect(store.getChildren(1)).toHaveLength(2)

      store.removeItemFromChildren(1, 3)

      expect(store.getChildren(1)).toHaveLength(1)
      expect(store.getChildren(1)[0].id).toBe(4)
    })

    it('should handle non-existent parent gracefully', () => {
      expect(() => store.removeItemFromChildren(999, 1)).not.toThrow()
    })

    it('should handle non-existent child gracefully', () => {
      expect(() => store.removeItemFromChildren(1, 999)).not.toThrow()
      expect(store.getChildren(1)).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const singleStore = new TreeStore([
        { id: 1, parentId: null, label: 'Root' }
      ])

      expect(singleStore.getAll()).toHaveLength(1)
      expect(singleStore.getChildren(1)).toHaveLength(0)
      expect(singleStore.getAllChildren(1)).toHaveLength(0)
      expect(singleStore.getParent(1)).toBeNull()
      expect(singleStore.getAllParents(1)).toHaveLength(1)
    })
  })
})
