import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginReadFrontmatter from "remark-read-frontmatter";
import pluginToc from "../src/index.js";

describe("option `prefix`", function () {
  it("user value", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc, { prefix: "user-" })
      .use(remark2rehype)
      .use(html).process(dedent`
          # Heading 1
          ## Heading 2
        `);
    data.should.eql({
      toc: [
        { title: "Heading 1", depth: 1, anchor: "user-heading-1" },
        { title: "Heading 2", depth: 2, anchor: "user-heading-2" },
      ],
    });
  });
});
