import { Plugin } from 'unified';
import { Root } from 'mdast';

interface ReadFrontmatterOptions {
    format?: string;
    property?: string;
}
declare const readFrontmatter: Plugin<[ReadFrontmatterOptions?], Root>;

export { readFrontmatter as default };
