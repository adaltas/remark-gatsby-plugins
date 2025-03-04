import * as hast from 'hast';
import { Plugin } from 'unified';
import { Root } from 'mdast';

interface TableOfContentOptions {
    depth_min?: number;
    depth_max?: number;
    property?: string[];
    no_annotations?: boolean;
    no_hash?: boolean;
    prefix?: string;
}
interface DataTocItem {
    title: string;
    depth: number;
    anchor: string;
}
type DataToc = DataTocItem[];

declare module "hast" {
    interface Properties {
        annotation?: string;
    }
}
declare module "mdast" {
    interface Data {
        hProperties?: hast.Properties;
    }
}
declare const remarkToc: Plugin<[TableOfContentOptions?], Root>;

interface Obj {
    [key: string]: Obj | unknown;
}
declare const get: (obj: Obj, keys: string[], strict?: boolean) => Obj | undefined;
declare const set: (obj: Obj, keys: string[], value: unknown, overwrite?: boolean) => void;

export { type DataToc, remarkToc as default, get, set };
