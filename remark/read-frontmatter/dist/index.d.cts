import { Plugin } from 'unified';
import { Literal, Data, Root } from 'mdast';

interface ReadFrontmatterOptions {
    property?: string;
    override?: boolean;
}
interface Toml extends Literal {
    type: "toml";
    data?: Data;
}
declare module "mdast" {
    interface RootContentMap {
        toml: Toml;
    }
}
declare const readFrontmatter: Plugin<[ReadFrontmatterOptions?], Root>;

export { readFrontmatter as default };
