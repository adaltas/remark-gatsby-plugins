/// <reference path="./mdx-annotations.d.ts" />
import "should";
import dedent from "dedent";
import { mdxAnnotations } from "mdx-annotations";
import { type Data } from "vfile";
import pluginToc, { type DataToc } from "../src/index.js";
import { compile } from "@mdx-js/mdx";

interface DataWithToc extends Data {
  toc: DataToc;
}

describe("Option `extract_annotations`", function () {
  it("default is `true`", async function () {
    const result = await compile(
      dedent`
      # Heading 1
      ## Heading 2 {{ id: 'my-heading-2' }}
    `,
      {
        remarkPlugins: [mdxAnnotations.remark, [pluginToc, {}]],
        rehypePlugins: [mdxAnnotations.rehype],
        recmaPlugins: [mdxAnnotations.recma],
      },
    );
    (result.data as DataWithToc).toc.should.eql([
      { title: "Heading 1", depth: 1, anchor: "heading-1" },
      { title: "Heading 2", depth: 2, anchor: "my-heading-2" },
    ]);
  });

  it.only("disabled if `false`", async function () {
    const result = await compile(
      dedent`
        # Heading 1
        ## Heading 2 {{ id: 'my-heading-2' }}
      `,
      {
        remarkPlugins: [
          mdxAnnotations.remark,
          [pluginToc, { extract_annotations: false }],
        ],
        rehypePlugins: [mdxAnnotations.rehype],
        recmaPlugins: [mdxAnnotations.recma],
      },
    );
    (result.data as DataWithToc).toc.should.eql([
      { title: "Heading 1", depth: 1, anchor: "heading-1" },
      {
        title: "Heading 2",
        depth: 2,
        anchor: "heading-2",
      },
    ]);
  });
});
