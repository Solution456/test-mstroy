<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'

import type { TreeStoreNode } from './lib/treeStore/types'
import AgTable from './shared/components/table/AgTable.vue'

const initialData: TreeStoreNode[] = [
  {
    id: 1,
    parentId: null,
    label: 'item 1'
  },
  {
    id: '91064cee',
    parentId: 1,
    label: 'item 2'
  },
  {
    id: 3,
    parentId: 1,
    label: 'item 3'
  },
  {
    id: 4,
    parentId: '91064cee',
    label: 'item 4'
  },
  {
    id: 5,
    parentId: '91064cee',
    label: 'item 5'
  },
  {
    id: 6,
    parentId: '91064cee',
    label: 'item 6'
  },
  {
    id: 7,
    parentId: 4,
    label: 'item 7'
  },
  {
    id: 8,
    parentId: 4,
    label: 'item 8'
  }
]

const headers: ColDef[] = [
  {
    rowGroupIndex: -1,
    headerName: '№ п/п',
    pinned: 'left',
    maxWidth: 80,
    valueGetter: 'node.rowIndex + 1'
  },
  {
    headerName: 'Наименование',
    field: 'label',
    width: 150
  }
]
</script>

<template>
  <div class="container min-h-full main">
    <div class="table-container">
      <AgTable
        :data="initialData"
        :column-defs="headers"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.table-container {
  width: 100%;
  height: 500px;
}

.main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.min-h-full {
  min-height: 100vh;
}
</style>
