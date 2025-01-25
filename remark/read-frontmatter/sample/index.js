const assert = require("assert");
const unified = require("unified");
const parseMarkdown = require("remark-parse");
const remark2rehype = require("remark-rehype");
const html = require("rehype-stringify");
const extractFrontmatter = require("remark-frontmatter");
const pluginParseFrontmatter = require("../lib");

const { data } = unified()
  .use(parseMarkdown)
  .use(extractFrontmatter, ["yaml"])
  .use(pluginParseFrontmatter)
  .use(remark2rehype)
  .use(html)
  .processSync([`---`, `title: 'Article'`, `lang: fr`, `---`].join("\n"));
// Test output
assert.deepEqual(data, {
  title: "Article",
  lang: "fr",
});
