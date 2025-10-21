interface TreeItem {
    id: number | string;
    parent: number | string | null;
    label: string;
}

export { type TreeItem };