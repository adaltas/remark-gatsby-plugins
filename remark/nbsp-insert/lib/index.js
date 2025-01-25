// import path from "path";
// import mm from "micromatch";

import { visit } from "unist-util-visit";

export default function linksAbsolute() {
  return (tree) => {
    return visit(tree, "text", (node) => {
      // Replace spaces with non-breaking space (check cases like: " \u00a0:", " :", "  :")
      node.value = node.value.replace(
        /( |[ \u00a0]{2,})([:;?!…])(?= |$|\*+)/g,
        (m) => "\u00a0" + m.substring(m.length - 1, m.length),
      );
    });
  };
}
