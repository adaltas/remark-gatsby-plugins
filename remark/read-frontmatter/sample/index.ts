import assert from "assert";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginParseFrontmatter from "../dist/index.js";

const { data } = unified()
  .use(parseMarkdown)
  .use(extractFrontmatter, ["yaml"])
  .use(pluginParseFrontmatter)
  .use(remark2rehype)
  .use(html)
  .processSync(
    `
---
title: Article
lang: fr
---
  `.trim(),
  );

// Output validation
assert.deepEqual(data, {
  title: "Article",
  lang: "fr",
});
