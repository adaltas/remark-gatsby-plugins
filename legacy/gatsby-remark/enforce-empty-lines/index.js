const path = require("path");
const fs = require("fs").promises;
const mm = require("micromatch");

const block = [
  "blockquote",
  "code",
  "heading",
  "html",
  "list",
  "paragraph",
  "thematicBreak",
];

const visit = (ast, visitor, { index = 0, ancestors = [] } = {}) => {
  if (ast.children) {
    ast.children.map((child, i) => {
      visit(child, visitor, {
        index: i,
        ancestors: [...ancestors, ast],
      });
    });
  }
  visitor(ast, {
    ancestors: ancestors,
    depth: ancestors.length,
    index: index,
    parent: ancestors[ancestors.length - 1],
  });
};

const has_parent = (ancestors, type) => {
  for (let ancestor of ancestors) {
    if (ancestor.type === type) {
      return true;
    }
  }
  return false;
};

module.exports = async (
  { markdownNode, markdownAST, reporter },
  { include = [] },
) => {
  const fileAbsolutePath =
    markdownNode.internal?.contentFilePath || // gatsby-plugin-mdx style
    markdownNode.fileAbsolutePath; // gatsby-transformer-remark style
  if (include.length > 0) {
    const filePath = fileAbsolutePath
      .split(process.cwd())
      .pop()
      .replace(/^\//, "");
    const isIncluded = mm.isMatch(filePath, include);
    if (!isIncluded) {
      return;
    }
  }
  if (!markdownNode.frontmatter.noEnforceEmptyLines) {
    const warnings = [];
    visit(markdownAST, (node, { ancestors, index, parent }) => {
      // Two consecutive paragraphs end up as in node with a `\n` inside
      if (node.type === "text") {
        const paragraphs = node.value.split("\n");
        if (paragraphs.length > 1) {
          paragraphs.slice(1).map((paragraph, i) => {
            warnings.push({
              line: i + 1 + node.position.start.line,
            });
          });
        }
      }
      if (!block.includes(node.type)) return;
      // Does not apply to first element
      if (index === 0) return;
      // Does not apply inside list
      if (node.type === "list" && has_parent(ancestors, "list")) {
        return;
      }
      // More relax inside list
      if (has_parent(ancestors, "list")) {
        return;
      }
      const sibling = parent.children[index - 1];
      const start = node.position.start.line;
      let end = sibling.position.end.line;
      // List include the extra line,
      // we need to search for the position of the last list item
      if (sibling.type === "list") {
        end = sibling.children[sibling.children.length - 1].position.end.line;
      }
      if (start - end === 1) {
        warnings.push({
          line: node.position.start.line,
        });
      }
    });
    if (warnings.length) {
      const fmlines = await countFrontMatterLines(fileAbsolutePath);
      const file = path.relative(".", fileAbsolutePath);
      warnings.map(({ line }) => {
        reporter.warn(
          `Use an empty line or 3 spaces between paragraphs to break the line in ${file}#${fmlines + line}`,
          new Error("Invalid Markdown Paragraph"),
        );
      });
    }
  }
};

const countFrontMatterLines = async (fileAbsolutePath) => {
  const content = await fs.readFile(fileAbsolutePath, "utf8");
  const lines = content.split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
  let count = 0;
  if (lines[0].trim().substr(0, 3) === "---") {
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        continue;
      } else if (lines[i].trim() === "---") {
        count = i + 1;
        break;
      }
    }
  }
  return count;
};
