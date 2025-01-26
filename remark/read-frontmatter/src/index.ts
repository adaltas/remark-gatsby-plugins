import { type Plugin } from "unified";
import yaml from "js-yaml";
import { Root } from "mdast";
import { VFile } from "vfile";

interface ReadFrontmatterOptions {
  format?: string;
  property?: string;
}

const readFrontmatter: Plugin<[ReadFrontmatterOptions?], Root> = function ({
  // format = "yaml",
  property = undefined,
} = {}) {
  return (ast: Root, vfile: VFile) => {
    // Extract frontmatter
    for (const child of ast.children) {
      if (child.type !== "yaml") continue;
      const data = yaml.load(child.value) as Record<string, unknown>;
      if (property) {
        vfile.data[property] = {
          ...(vfile.data[property] || {}),
          ...data,
        };
      } else {
        vfile.data = {
          ...vfile.data,
          ...data,
        };
      }
    }
    return;
  };
};

export default readFrontmatter;
