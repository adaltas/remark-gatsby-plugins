import { type Plugin } from "unified";
import Slugger from "github-slugger";
import { type Root, type Heading } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import * as acorn from "acorn";
import { is_object_literal } from "mixme";

interface TableOfContentOptions {
  depth_min?: number;
  depth_max?: number;
  property?: string[];
  prefix?: string;
}

interface DataTocItem {
  title: string;
  depth: number;
  anchor: string;
}

type DataToc = DataTocItem[];

export type { DataToc };

const remarkToc: Plugin<[TableOfContentOptions?], Root> = function ({
  depth_min = 1,
  depth_max = 3,
  property = ["toc"],
  prefix = "",
} = {}) {
  const slugs = new Slugger();
  if (typeof property === "string") {
    property = [property];
  }
  return function (tree, vfile) {
    const toc: DataToc = [];
    visit(tree, "heading", function (node: Heading) {
      if (node.depth < depth_min || node.depth > depth_max) return;
      const title = toString(node.children);
      if (!title) return;
      // MDX annotation
      // - Search for [`... { ... }`](https://github.com/bradlc/mdx-annotations/blob/main/index.js#L26) in markdown block elements
      // - Place the annotation in `node.hProperties.annotation`
      // - [Parse](https://github.com/bradlc/mdx-annotations/blob/main/index.js#L134) the annotation with [acorn](https://github.com/acornjs/acorn/blob/master/acorn/src/acorn.d.ts)
      let anchor: string = "";
      if (node.data?.hProperties?.annotation) {
        const annotation = (
          acorn.parse("(" + node.data?.hProperties?.annotation + ")", {
            ecmaVersion: "latest",
          }).body[0] as acorn.ExpressionStatement
        ).expression as acorn.ObjectExpression;
        for (const property of annotation.properties) {
          if (
            ((property as acorn.Property).key as acorn.Identifier).name === "id"
          ) {
            anchor =
              "" + ((property as acorn.Property).value as acorn.Literal).value;
          }
        }
      }
      // Default is to slugify the title
      if (anchor === "") {
        anchor = slugs.slug(title);
      }
      toc.push({
        title: title,
        depth: node.depth,
        anchor: prefix + anchor,
      });
    });
    set(vfile.data, property, toc, false);
  };
};

export default remarkToc;

interface Obj {
  [key: string]: Obj | unknown;
}

const get = (obj: Obj, keys: string[], strict = false) => {
  for (const key of keys) {
    // const value = obj[key];
    // if (typeof value !== "object" || value == null) continue;
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj = obj[key] as Obj;
    } else if (!strict) {
      return undefined;
    } else {
      throw Error(
        "REMARK_TABLE_OF_CONTENT: property does not exists in strict mode.",
      );
    }
  }
  return obj;
};

const set = (obj: Obj, keys: string[], value: unknown, overwrite = false) => {
  if (obj === null || typeof obj !== "object") {
    throw Error("REMARK_TABLE_OF_CONTENT: argument is not an object.");
  }
  for (let i = 0; i < keys.length; i++) {
    const last = i === keys.length - 1;
    const key = keys[i];
    if (!last) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Move into the child
        if (is_object_literal(obj[key])) {
          obj = obj[key] as Obj;
        } else {
          // Never overwrite a parent
          throw Error(
            "REMARK_TABLE_OF_CONTENT: cannot overwrite parent property.",
          );
        }
      } else {
        // Create the parent property
        obj[key] = {};
        obj = obj[key] as Obj;
      }
    } else {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Move into the child
        if (overwrite) {
          obj[key] = value;
        } else {
          // do nothing and preserve the origin value
        }
      } else {
        // Create the parent property
        obj[key] = value;
      }
    }
  }
};

export { get, set };
