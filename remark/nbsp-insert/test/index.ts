import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import nbsp from "../src/index.js";

describe("Insert non-breaking spaces", function () {
  it("replace one space", async function () {
    const { value } = await unified()
      .use(parseMarkdown)
      .use(remark2rehype)
      .use(nbsp)
      .use(html).process(dedent`
        Bonjour !
      `);
    value.should.eql("<p>Bonjour\u00a0!</p>");
  });

  it("replace multipole space", async function () {
    const { value } = await unified()
      .use(parseMarkdown)
      .use(remark2rehype)
      .use(nbsp)
      .use(html).process(dedent`
        Bonjour   !
      `);
    value.should.eql("<p>Bonjour\u00a0!</p>");
  });
});
