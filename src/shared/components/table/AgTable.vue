<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import {
  ClientSideRowModelModule,
  type ColDef,
  type GridApi,
  ModuleRegistry,
  type RowGroupingDisplayType
} from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import { AgGridVue } from 'ag-grid-vue3'

import TreeStore from '@/lib/treeStore/tree-store'
import type { TreeStoreNode } from '@/lib/treeStore/types'
import type { MaybeNull } from '@/shared/types'

const props = withDefaults(
  defineProps<{
    data: any[]
    columnDefs: ColDef[]
    groupDisplayType?: RowGroupingDisplayType
    groupDefaultExpanded?: number
  }>(),
  {
    groupDisplayType: 'multipleColumns',
    groupDefaultExpanded: 1
  }
)

const ts = new TreeStore(props.data)

const rowData = ref<TreeStoreNode[]>()

function getRowDataPath(data: TreeStoreNode) {
  const parents = ts.getAllParents(data.id)

  return parents.map((p) => p.id).toReversed()
}

const defaultColDef: ColDef = {
  flex: 1,
  resizable: false,
  sortable: false,
  filter: false
}

const gridApi = shallowRef<MaybeNull<GridApi>>(null)
function onGridReady(params: { api: GridApi }) {
  updateGridData()
  gridApi.value = params.api
  params.api.sizeColumnsToFit()
}

function updateGridData() {
  rowData.value = [...ts.getAll()]
}

const autoGroupColumnDef: ColDef<TreeStoreNode> = {
  headerName: 'Категория',
  flex: 1,
  rowGroupIndex: 1,
  cellRendererParams: {
    suppressCount: true
  },
  valueGetter: (params: any) => {
    if (!params.data) return ''
    const children = ts.getChildren(params.data.id)
    return children.length > 0 ? 'Группа' : 'Элемент'
  }
}
ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])
</script>

<template>
  <AgGridVue
    style="width: 100%; height: 100%"
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :row-data="data"
    :get-data-path="getRowDataPath"
    :tree-data="true"
    :default-col-def="defaultColDef"
    :group-default-expanded="-1"
    :auto-group-column-def="autoGroupColumnDef"
    @grid-ready="onGridReady"
  />
</template>
