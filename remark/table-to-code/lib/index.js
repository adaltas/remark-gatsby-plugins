import { visit } from "unist-util-visit";
import md_ast_to_string from "./md_ast_to_string.js";

export default function tableToCode() {
  return (tree) =>
    visit(tree, "table", (node) => {
      const value = md_ast_to_string(node);
      node.type = "code";
      node.lang = null;
      node.meta = null;
      node.value = value.trim();
      node.children = null;
      return null;
    });
}
