import assert from "node:assert";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginToc from "../dist/index.js";

// Create a toc property
const { data } = await unified()
  .use(parseMarkdown)
  .use(pluginToc)
  .use(remark2rehype)
  .use(html).process(dedent`
  # Heading 1
  ## Heading 2
`);
// Validation
assert.deepEqual(data.toc, [
  { title: "Heading 1", depth: 1, anchor: "heading-1" },
  { title: "Heading 2", depth: 2, anchor: "heading-2" },
]);
