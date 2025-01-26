import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginReadFrontmatter from "remark-read-frontmatter";
import pluginToc, { DataToc } from "../src/index.js";
import { Data } from "mdast";

describe("option `property`", function () {
  it("multi-level property", async function () {
    type DataWithToc = Data & {
      parent: {
        toc: DataToc;
      };
    };
    const { data } = (await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc, { property: ["parent", "toc"] })
      .use(remark2rehype)
      .use(html).process(dedent`
          # Heading 1
          ## Heading 2
        `)) as unknown as { data: DataWithToc };
    data.parent.should.eql({
      toc: [
        { title: "Heading 1", depth: 1, anchor: "heading-1" },
        { title: "Heading 2", depth: 2, anchor: "heading-2" },
      ],
    });
  });

  it("preserve value if fontmatter contains `toc: false`", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
          ---
          toc: false
          ---
          # Heading 1
          ## Heading 2
        `);
    data.should.eql({
      toc: false,
    });
  });
});
