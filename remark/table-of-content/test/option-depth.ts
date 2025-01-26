import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginToc from "../src/index.js";

describe("Options `depth_min` and `depth_max`", function () {
  it("`depth_min` option", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(pluginToc, { depth_min: 2 })
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
      `);
    data.toc?.should.eql([
      { title: "Heading 2", depth: 2, anchor: "heading-2" },
      { title: "Heading 3", depth: 3, anchor: "heading-3" },
    ]);
  });

  it("`depth_max` option", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(pluginToc, { depth_max: 5 })
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
        ##### Heading 5
        ###### Heading 6
      `);
    data.toc?.should.eql([
      { title: "Heading 1", depth: 1, anchor: "heading-1" },
      { title: "Heading 2", depth: 2, anchor: "heading-2" },
      { title: "Heading 3", depth: 3, anchor: "heading-3" },
      { title: "Heading 4", depth: 4, anchor: "heading-4" },
      { title: "Heading 5", depth: 5, anchor: "heading-5" },
    ]);
  });
});
