import { type Plugin } from "unified";
import { type Text } from "mdast";

import { visit } from "unist-util-visit";

const linksAbsolute: Plugin = function () {
  return (tree) => {
    return visit(tree, "text", (node: Text) => {
      // Replace spaces with non-breaking space
      // check cases like: " \u00a0:", " :", "  :")
      node.value = node.value.replace(
        /( |[ \u00a0]{2,})([:;?!…])(?= |$|\*+)/g,
        (m) => "\u00a0" + m.substring(m.length - 1, m.length),
      );
    });
  };
};

export default linksAbsolute;
