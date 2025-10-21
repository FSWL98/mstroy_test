import { describe, it, expect, beforeEach } from 'vitest';
import TreeStore from './TreeStore.ts'
import { type TreeItem } from '../types/types.ts'

const testItems: TreeItem[] = [
    { id: 1, parent: null, label: 'Айтем 1' },
    { id: '91064cee', parent: 1, label: 'Айтем 2' },
    { id: 3, parent: 1, label: 'Айтем 3' },
    { id: 4, parent: '91064cee', label: 'Айтем 4' },
    { id: 5, parent: '91064cee', label: 'Айтем 5' },
    { id: 6, parent: '91064cee', label: 'Айтем 6' },
    { id: 7, parent: 4, label: 'Айтем 7' },
    { id: 8, parent: 4, label: 'Айтем 8' }
];

describe('TreeStore', () => {
    let treeStore: TreeStore;

    beforeEach(() => {
        treeStore = new TreeStore(testItems);
    });

    describe('getAll', () => {
        it('should return all items', () => {
            const result = treeStore.getAll();
            expect(result).toEqual(testItems);
            expect(result).toHaveLength(8);
        });
    });

    describe('getItem', () => {
        it('should return item by both numeric and string id', () => {
            expect(treeStore.getItem(1)).toEqual(testItems[0]);
            expect(treeStore.getItem('91064cee')).toEqual(testItems[1]);
        });

        it('should return undefined for non-existing id', () => {
            expect(treeStore.getItem(2)).toBeUndefined();
        });
    });

    describe('getChildren', () => {
        it('should return direct children', () => {
            expect(treeStore.getChildren(1)).toEqual([testItems[1], testItems[2]]);
            expect(treeStore.getChildren('91064cee')).toEqual([testItems[3], testItems[4], testItems[5]]);
        });

        it('should return empty array for no children', () => {
            expect(treeStore.getChildren(5)).toEqual([]);
        });
    });

    describe('getAllChildren', () => {
        it('should return all children', () => {
            const result = treeStore.getAllChildren(1);
            expect(result).toHaveLength(7);
            expect(result).toEqual(testItems.slice(1, 8));
        });

        it('should return empty array for leaf node', () => {
            expect(treeStore.getAllChildren(5)).toEqual([]);
        });
    });

    describe('getAllParents', () => {
        it('should return all parents including self', () => {
            expect(treeStore.getAllParents(5)).toEqual([
                testItems[4],
                testItems[1],
                testItems[0]
            ]);
        });

        it('should return only self for root node', () => {
            expect(treeStore.getAllParents(1)).toEqual([testItems[0]]);
        });

        it('should return empty array for non-existing node', () => {
            expect(treeStore.getAllParents(2)).toEqual([]);
        })
    });

    describe('addItem', () => {
        it('should add new item', () => {
            const newItem: TreeItem = { id: 9, parent: null, label: 'Айтем 9' };
            treeStore.addItem(newItem);

            expect(treeStore.getItem(9)).toEqual(newItem);
            expect(treeStore.getAll()).toHaveLength(9);
        });
    });

    describe('removeItem', () => {
        it('should remove item and its children', () => {
            treeStore.removeItem(4);

            expect(treeStore.getItem(4)).toBeUndefined();
            expect(treeStore.getItem(7)).toBeUndefined();
            expect(treeStore.getItem(8)).toBeUndefined();
            expect(treeStore.getChildren('91064cee')).toEqual([testItems[4], testItems[5]]);
            expect(treeStore.getAll()).toHaveLength(5);
        });
    });

    describe('updateItem', () => {
        it('should update item properties', () => {
            const updatedItem: TreeItem = { id: '91064cee', parent: 1, label: 'Измененный айтем' };
            treeStore.updateItem(updatedItem);

            expect(treeStore.getItem('91064cee')?.label).toBe('Измененный айтем');
        });

        it('should handle parent change', () => {
            const updatedItem: TreeItem = { id: 3, parent: 4, label: 'Айтем 3' };
            treeStore.updateItem(updatedItem);

            expect(treeStore.getChildren(1)).not.toContainEqual(updatedItem);
            expect(treeStore.getChildren(4)).toContainEqual(updatedItem);
        });
    });
});