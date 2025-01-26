import { Plugin } from 'unified';
import { Root } from 'mdast';

interface TableOfContentOptions {
    depth_min?: number;
    depth_max?: number;
    property?: string[];
}
interface DataTocItem {
    title: string;
    depth: number;
    anchor: string;
}
type DataToc = DataTocItem[];

declare const remarkToc: Plugin<[TableOfContentOptions?], Root>;

interface Obj {
    [key: string]: Obj | unknown;
}
declare const get: (obj: Obj, keys: string[], strict?: boolean) => Obj | undefined;
declare const set: (obj: Obj, keys: string[], value: unknown, overwrite?: boolean) => void;

export { type DataToc, remarkToc as default, get, set };
