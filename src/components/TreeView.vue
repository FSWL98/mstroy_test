<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue';
import {
  CellStyleModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  RenderApiModule,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
  EventApiModule,
  ValidationModule,
  type FirstDataRenderedEvent
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { type TreeItem } from '../types/types.ts';
import TreeStore from '../utils/TreeStore/TreeStore.ts';

import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([
  CellStyleModule,
  ClientSideRowModelModule,
  ClientSideRowModelApiModule,
  RenderApiModule,
  TreeDataModule,
  EventApiModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const initialItems: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' }
];

const treeStore = new TreeStore(initialItems);
const rowData = ref<TreeItem[]>(treeStore.getAll());

const gridApi = shallowRef<GridApi | null>(null);
const defaultColDef = ref<ColDef>({
  flex: 10,
});

const columnDefs = ref<ColDef[]>(
    [
      {
        headerName: '№ п/п',
        field: 'rowNumber',
        width: 80,
        valueGetter: (params) => {
          const rowNumber = rowNumberMap.value.get(params.data.id);
          return rowNumber !== undefined ? rowNumber : '';
        },
        pinned: 'left',
        cellStyle: (params) => {
          return {
            fontWeight: params.node.allChildrenCount ? 'bold' : 'normal',
          }
        },
      },
      {
        headerName: 'Наименование',
        field: 'label',
        width: 300,
        cellStyle: (params) => {
          return {
            fontWeight: params.node.allChildrenCount ? 'bold' : 'normal',
          }
        },
      }
    ]
)

const rowNumberMap = ref<Map<string | number, number>>(new Map());

const updateRowNumbers = () => {
  if (!gridApi.value) return;

  const newRowNumberMap = new Map<string | number, number>();
  let currentNumber = 1;

  gridApi.value.forEachNodeAfterFilterAndSort((node) => {
    if (node.data) {
      newRowNumberMap.set(node.data.id, currentNumber++);
    }
  });

  rowNumberMap.value = newRowNumberMap;

  gridApi.value.refreshCells({
    columns: ['rowNumber'],
    force: true
  });
};

const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Категория',
  field: 'category',
  width: 300,
  valueGetter: (params) => {
    return params.node && params.node.allChildrenCount ? 'Группа' : 'Элемент';
  },
  cellStyle: (params) => {
    return {
      fontWeight: params.node.allChildrenCount ? 'bold' : 'normal',
    }
  },
  cellRendererParams: {
    suppressCount: true,
  },
});

const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;

  params.api.addEventListener('rowGroupOpened', updateRowNumbers);
};

const onFirstDataRendered = () => {
  // Инициализируем нумерацию после первой отрисовки
  nextTick(() => {
    updateRowNumbers();
  });
};

const getDataPath = (data: TreeItem): string[] => {
  return treeStore.getDataPath(data.id);
};
</script>

<template>
  <div style="height: 600px">
    <ag-grid-vue
        style="width: 100%; height: 100%;"
        @grid-ready="onGridReady"
        :defaultColDef="defaultColDef"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :autoGroupColumnDef="autoGroupColumnDef"
        :treeData="true"
        :getDataPath="getDataPath"
        @first-data-rendered="onFirstDataRendered"
    >
    </ag-grid-vue>
  </div>
</template>

<style scoped>

</style>