declare module "mdx-annotations" {
  import type { Plugin } from "unified";
  interface MdxAnnotations {
    remark: Plugin;
    rehype: Plugin;
    recma: Plugin;
  }
  const mdxAnnotations: MdxAnnotations;
  export { mdxAnnotations };
}
