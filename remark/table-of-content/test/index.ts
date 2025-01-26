import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginToc from "../src/index.js";

describe("Extract table of content", function () {
  it("default", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
      `);
    data.toc?.should.eql([
      { title: "Heading 1", depth: 1, anchor: "heading-1" },
      { title: "Heading 2", depth: 2, anchor: "heading-2" },
      { title: "Heading 3", depth: 3, anchor: "heading-3" },
    ]);
  });

  it("heading with styling", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ## Heading 2 *italic*
        ## Heading 2 **bold**
        ## Heading 2 ***italic bold***
        ## Heading 2 \`code();\`
        ### Heading 3
        ### Heading 3 *italic*
        ### Heading 3 **bold**
        ### Heading 3 ***italic bold***
        ### Heading 3 \`code();\`
        #### Heading 4
      `);
    data.toc?.should.eql([
      { title: "Heading 1", depth: 1, anchor: "heading-1" },
      { title: "Heading 2", depth: 2, anchor: "heading-2" },
      { title: "Heading 2 italic", depth: 2, anchor: "heading-2-italic" },
      { title: "Heading 2 bold", depth: 2, anchor: "heading-2-bold" },
      {
        title: "Heading 2 italic bold",
        depth: 2,
        anchor: "heading-2-italic-bold",
      },
      { title: "Heading 2 code();", depth: 2, anchor: "heading-2-code" },
      { title: "Heading 3", depth: 3, anchor: "heading-3" },
      { title: "Heading 3 italic", depth: 3, anchor: "heading-3-italic" },
      { title: "Heading 3 bold", depth: 3, anchor: "heading-3-bold" },
      {
        title: "Heading 3 italic bold",
        depth: 3,
        anchor: "heading-3-italic-bold",
      },
      { title: "Heading 3 code();", depth: 3, anchor: "heading-3-code" },
    ]);
  });
});
