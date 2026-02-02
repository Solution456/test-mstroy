import Queue from '../queue/queue'

import type { TreeStoreClass, TreeStoreNode, TreeStoreNodeId } from './types'

import type { MaybeNull } from '@/shared/types'

export default class TreeStore implements TreeStoreClass {
  private items: TreeStoreNode[] = []
  private mapItems: Map<TreeStoreNodeId, TreeStoreNode> = new Map()
  private mapChildren: Map<TreeStoreNodeId, TreeStoreNode[]> = new Map()

  constructor(initialItems: TreeStoreNode[]) {
    this.items = [...initialItems]

    this.generateMap()
  }

  generateMap() {
    this.mapItems.clear()

    for (const item of this.items) {
      this.mapItems.set(item.id, item)

      if (!item.parentId) continue
      const hasParentIdInMap = this.mapChildren.has(item.parentId)
      if (!hasParentIdInMap) {
        this.mapChildren.set(item.parentId, [])
      }
      this.mapChildren.get(item.parentId)!.push(item)
    }
  }

  removeItemFromChildren(parentId: TreeStoreNodeId, id: TreeStoreNodeId) {
    const children = this.mapChildren.get(parentId)
    if (children) {
      const index = children.findIndex((child) => child.id === id)
      if (index !== -1) {
        children.splice(index, 1)
      }
    }
  }

  getAll(): TreeStoreNode[] {
    return this.items
  }

  getItem(id: TreeStoreNodeId): MaybeNull<TreeStoreNode> {
    return this.mapItems.get(id) || null
  }

  getChildren(id: TreeStoreNodeId): TreeStoreNode[] {
    return this.mapChildren.get(id) || []
  }

  getAllChildren(id: TreeStoreNodeId): TreeStoreNode[] {
    const initialChildren = this.getChildren(id)
    const result: TreeStoreNode[] = []
    if (!initialChildren.length) return result

    const stack = new Queue<TreeStoreNode>(initialChildren)
    while (!stack.isEmpty()) {
      const current = stack.dequeue()

      if (!current) continue
      result.push(current)

      const currentChildren = this.getChildren(current.id)

      if (currentChildren.length) stack.enqueue(currentChildren)
    }

    return result
  }

  getParent(id: TreeStoreNodeId): MaybeNull<TreeStoreNode> {
    const item = this.getItem(id)
    if (!item || !item.parentId) return null
    return this.getItem(item.parentId)
  }

  getAllParents(id: TreeStoreNodeId): TreeStoreNode[] {
    const result: TreeStoreNode[] = []
    const currentItem = this.getItem(id)

    if (!currentItem) return result

    result.push(currentItem)

    let currentParent = this.getParent(id)

    while (currentParent) {
      result.push(currentParent)
      currentParent = this.getParent(currentParent.id)
    }

    return result
  }

  addItem(item: TreeStoreNode) {
    if (this.mapItems.has(item.id))
      return console.warn(`Item with id ${item.id} already exists`)

    if (item.parentId && !this.mapItems.has(item.parentId))
      return console.warn(`Parent item with id ${item.parentId} does not exist`)

    this.items.push(item)

    this.mapItems.set(item.id, item)

    if (item.parentId) {
      const hasParentIdInMap = this.mapChildren.has(item.parentId)
      if (!hasParentIdInMap) {
        this.mapChildren.set(item.parentId, [])
      }
      this.mapChildren.get(item.parentId)!.push(item)
    }
  }

  removeItem(id: TreeStoreNodeId) {
    const item = this.getItem(id)

    if (!item) return console.warn(`Item with id ${id} does not exist`)

    const itemsToRemove = [item, ...this.getAllChildren(id)]
    const idsToRemove = new Set(itemsToRemove.map((item) => item.id))

    this.items = this.items.filter((item) => !idsToRemove.has(item.id))

    this.removeItemFromChildren(item.parentId!, id)

    for (const id of idsToRemove) {
      this.mapItems.delete(id)
      this.mapChildren.delete(id)
    }
  }

  updateItem(item: TreeStoreNode) {
    const existingItem = this.getItem(item.id)

    if (!existingItem)
      return console.warn(`Item with id ${item.id} does not exist`)

    const isParentChanged =
      item.parentId && existingItem.parentId !== item.parentId

    if (isParentChanged && item.parentId && !this.mapItems.has(item.parentId))
      return console.warn(`Parent item with id ${item.parentId} does not exist`)

    if (isParentChanged) {
      const des = this.getAllChildren(item.id)

      const isCircular = des.some((child) => child.id === item.parentId)

      if (isCircular) return console.warn(`Circular reference detected`)
    }

    const oldParentId = existingItem.parentId
    Object.assign(existingItem, item)

    if (isParentChanged) {
      this.removeItemFromChildren(oldParentId!, existingItem.id)

      if (!this.mapChildren.has(item.parentId!)) {
        this.mapChildren.set(item.parentId!, [])
      }
      this.mapChildren.get(item.parentId!)!.push(existingItem)
    }
  }
}
