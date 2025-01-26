import { type Plugin } from "unified";
import yaml from "js-yaml";
import toml from "smol-toml";
import { type Root, type Data, type Literal } from "mdast";
import { type VFile } from "vfile";

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
    // TOML node registration
    toml: Toml;
  }
}

const readFrontmatter: Plugin<[ReadFrontmatterOptions?], Root> = function ({
  property = undefined,
  override = false,
} = {}) {
  return (tree: Root, vfile: VFile) => {
    // Extract frontmatter
    for (const child of tree.children) {
      // Frontmatter object deserialization
      let data: Record<string, unknown>;
      switch (child.type) {
        case "yaml":
          data = yaml.load(child.value) as Record<string, unknown>;
          break;
        case "toml":
          data = toml.parse(child.value) as Record<string, unknown>;
          break;
        default:
          continue;
      }
      // Frontmatter object insertion
      if (property) {
        if (override) {
          vfile.data[property] = data;
        } else {
          vfile.data[property] = {
            ...(vfile.data[property] || {}),
            ...data,
          };
        }
      } else {
        if (override) {
          vfile.data = data;
        } else {
          vfile.data = {
            ...vfile.data,
            ...data,
          };
        }
      }
    }
    return;
  };
};

export default readFrontmatter;
