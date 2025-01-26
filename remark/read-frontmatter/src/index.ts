import { type Plugin } from "unified";
import yaml from "js-yaml";
import toml from "smol-toml";
import { Root, Data, Literal } from "mdast";
import { VFile } from "vfile";

interface ReadFrontmatterOptions {
  property?: string;
}

interface Toml extends Literal {
  type: "toml";
  data?: Data;
}
declare module "mdast" {
  interface RootContentMap {
    // TOML node registration
    toml: Toml;
  }
}

const readFrontmatter: Plugin<[ReadFrontmatterOptions?], Root> = function ({
  property = undefined,
} = {}) {
  return (ast: Root, vfile: VFile) => {
    // Extract frontmatter
    for (const child of ast.children) {
      // Frontmatter object deserialization
      let data: Record<string, unknown>;
      switch (child.type) {
        case "yaml":
          data = yaml.load(child.value) as Record<string, unknown>;
          break;
        case "toml":
          data = toml.parse(child.value) as Record<string, unknown>;
          console.log(child, data);
          break;
        default:
          continue;
      }
      // Frontmatter object insertion
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
