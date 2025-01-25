import { unified } from "unified";
import stringify from "remark-stringify";
import gfm from "remark-gfm";

export default function mdAstToString(ast, settings) {
  return unified()
    .use(stringify)
    .use(gfm)
    .data("settings", settings || {})
    .stringify(ast);
}
