import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginReadFrontmatter from "remark-read-frontmatter";
import nbsp from "../lib/index.js";

describe("Insert non-breaking spaces", function () {
  it("replace spaces", async function () {
    const { value } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(remark2rehype)
      .use(nbsp)
      .use(html).process(dedent`
        ---
        lang: fr
        ---

        Bonjour !
      `);
    value.should.eql("<p>Bonjour\u00a0!</p>");
  });
});
