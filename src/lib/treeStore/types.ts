import { MaybeNull } from "@/shared/types"

export type TreeStoreNodeId = string | number
export type TreeStoreNodeLabel = string

export type TreeStoreNode {
  id:  TreeStoreNodeId
  parentId: MaybeNull<TreeStoreNodeId>
  label: TreeStoreNodeLabel
}

export interface TreeStoreClass {
  getAll: () => TreeStoreNode[]
  getItem: (id: TreeStoreNodeId) => MaybeNull<TreeStoreNode>
  getChildren: (id: TreeStoreNodeId) => TreeStoreNode[]
  getAllChildren: (id: TreeStoreNodeId) => TreeStoreNode[]
  getAllParents: (id: TreeStoreNodeId) => TreeStoreNode[]
  addItem: (item: TreeStoreNode) => void
  removeItem: (id: TreeStoreNodeId) => void
  updateItem: (item: TreeStoreNode) => void
}
