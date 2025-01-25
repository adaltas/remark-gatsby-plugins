import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginLinksAbsolute from "remark-links-absolute";
import format from "rehype-format";

describe("Normalize absolute links", function () {
  it("simple", async function () {
    const { value } = await unified()
      .use(parseMarkdown)
      .use(pluginLinksAbsolute, { baseURL: "http://www.adaltas.com" })
      .use(remark2rehype)
      .use(html)
      .use(format).process(dedent`
        [HTTP link](http://www.adaltas.com/some/path/)
        [absolute link](/some/path/)
      `);
    value.trim().should.eql(dedent`
      <p>
        <a href="http://www.adaltas.com/some/path/">HTTP link</a>
        <a href="http://www.adaltas.com/some/path/">absolute link</a>
      </p>
    `);
  });
});
