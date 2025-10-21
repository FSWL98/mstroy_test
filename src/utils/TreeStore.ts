import { type TreeItem } from '../types/types.ts';

class TreeStore {
    private items: TreeItem[] = [];
    private itemsMap: Map<number | string, TreeItem>;
    private childrenMap: Map<number | string | null, TreeItem[]>;

    constructor(itemsList: TreeItem[]) {
        this.items = itemsList;
        this.itemsMap = new Map();
        this.childrenMap = new Map();

        itemsList.forEach((item: TreeItem) => {
            this.itemsMap.set(item.id, item);

            if (item.parent && !this.childrenMap.has(item.parent)) {
                this.childrenMap.set(item.parent, []);
            }
        });

        itemsList.forEach((item: TreeItem) => {
            const child = this.childrenMap.get(item.parent);
            if (child) {
                child.push(item);
            }
        })
    }

    getAll(): TreeItem[] {
        return this.items;
    }

    getItem(id: number | string): TreeItem | undefined {
        return this.itemsMap.get(id);
    }

    getChildren(id: number | string): TreeItem[] {
        return this.childrenMap.get(id) || [];
    }

    getAllChildren(id: number | string): TreeItem[] {
        const result: TreeItem[] = [];
        const idQueue: (number | string)[] = [id];

        let curId = idQueue.shift();

        while (curId) {
            const children = this.getChildren(curId);

            children.forEach(child => {
                result.push(child);
                idQueue.push(child.id);
            });

            curId = idQueue.shift();
        }

        return result;
    }

    getAllParents(id: number | string): TreeItem[] {
        let item = this.itemsMap.get(id);

        if (!item) {
            return [];
        }

        const result: TreeItem[] = [item];

        while (item && item.parent) {
            const parent = this.itemsMap.get(item.parent);
            if (parent) {
                result.push(parent);
                item = parent;
            }
        }

        return result;
    }

    addItem(item: TreeItem): void {
        this.items.push(item);
        this.itemsMap.set(item.id, item);


        if (!this.childrenMap.has(item.parent)) {
            this.childrenMap.set(item.parent, []);
        }

        this.childrenMap.get(item.parent)?.push(item);
    }

    removeItem(id: number | string): void {
        const item = this.itemsMap.get(id);

        if (!item) {
            return;
        }

        const itemsToDelete = [item, ...this.getAllChildren(id)];

        this.items = this.items.filter(item => !itemsToDelete.includes(item));

        itemsToDelete.forEach((item: TreeItem) => {
            this.itemsMap.delete(item.id);

            const parent = this.childrenMap.get(item.parent);
            if (parent) {
                const childIndex = parent.findIndex(el => el.id === item.id);
                if (childIndex > -1) {
                    parent.splice(childIndex, 1);
                }
            }

            this.childrenMap.delete(item.id);
        })
    }

    updateItem(updatedItem: TreeItem): void {
        const item = this.itemsMap.get(updatedItem.id);

        if (!item) {
            return;
        }

        const index = this.items.findIndex(el => el.id === updatedItem.id);
        if (index > -1) {
            this.items[index] = updatedItem;
        }

        this.itemsMap.set(updatedItem.id, updatedItem);

        if (updatedItem.parent !== item.parent) {
            const oldParent = this.childrenMap.get(item.parent);

            if (oldParent) {
                const index = oldParent.findIndex(el => el.id === updatedItem.id);
                if (index > -1) {
                    oldParent.splice(index, 1);
                }
            }

            if (!this.childrenMap.has(updatedItem.parent)) {
                this.childrenMap.set(updatedItem.parent, []);
            }

            this.childrenMap.get(updatedItem.parent)?.push(updatedItem);
        }
    }

    getDataPath(id: number | string): string[] {
        const parents = this.getAllParents(id);
        return parents
            .map(item => item.id.toString())
            .reverse();
    };
}

export default TreeStore;