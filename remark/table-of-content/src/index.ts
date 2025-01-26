import { type Plugin } from "unified";
import slugify from "@sindresorhus/slugify";
import { type Root, type Heading } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { is_object_literal } from "mixme";

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

export type { DataToc };

const remarkToc: Plugin<[TableOfContentOptions?], Root> = function ({
  depth_min = 1,
  depth_max = 3,
  property = ["toc"],
} = {}) {
  if (typeof property === "string") {
    property = [property];
  }
  return function (tree, vfile) {
    // if(get(vfile.data, property) === false) {
    //   return
    // }
    const toc: DataToc = [];
    visit(tree, "heading", function (node: Heading) {
      if (node.depth < depth_min || node.depth > depth_max) return;
      const title = toString(node.children);
      // const title = node.children
      //   .filter(
      //     (child) =>
      //       child.type === "text" ||
      //       child.type === "strong" ||
      //       child.type === "emphasis" ||
      //       child.type === "inlineCode",
      //   )
      //   .map((child: Emphasis | InlineCode | Strong | Text) => {
      //     // when the text is bold or italic, the node.children[0] is not a text node but a strong or emphasis node
      //     // so we need to check the type of the node.children[0] to get the text value
      //     if (child.type === "strong" || child.type === "emphasis") {
      //       // case strong AND emphasis (***italic bold***) : the node.children[0] as an embedded node with the type strong or emphasis
      //       if (
      //         child.children[0].type === "strong" ||
      //         child.children[0].type === "emphasis"
      //       ) {
      //         return child.children[0].children[0].value;
      //       }
      //       return child.children[0].value;
      //     }
      //     // but for inlineCode and text node, the value is directly in the child.value
      //     return child.value;
      //   })
      //   .join("");
      if (!title) return;
      toc.push({
        title: title,
        depth: node.depth,
        anchor: slugify(title),
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
