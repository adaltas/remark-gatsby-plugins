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

describe("option `extract_hash`", function () {
  it("default is `true`", async function () {
    const space = " ";
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
          # Heading 1 #my-header-1
          ## Heading 2 #my-header-2
        `);
    data.should.eql({
      toc: [
        { title: "Heading 1", depth: 1, anchor: "my-header-1" },
        { title: "Heading 2", depth: 2, anchor: "my-header-2" },
      ],
    });
  });

  it("disabled if false", async function () {
    const space = " ";
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc, { extract_hash: false })
      .use(remark2rehype)
      .use(html).process(dedent`
            # Heading 1 #my-header-1
            ## Heading 2 #my-header-2
          `);
    data.should.eql({
      toc: [
        {
          title: "Heading 1 #my-header-1",
          depth: 1,
          anchor: "heading-1-my-header-1",
        },
        {
          title: "Heading 2 #my-header-2",
          depth: 2,
          anchor: "heading-2-my-header-2",
        },
      ],
    });
  });

  it("trim around title and anchor", async function () {
    const space = " ";
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
            # Heading 1 ${space} #my-header-1
            ## Heading 2 #my-header-2	${space}
          `);
    data.should.eql({
      toc: [
        { title: "Heading 1", depth: 1, anchor: "my-header-1" },
        { title: "Heading 2", depth: 2, anchor: "my-header-2" },
      ],
    });
  });
});
