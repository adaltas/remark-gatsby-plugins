import { get } from "../lib/index.js";
import should from "should";

describe("Utils `get`", function () {
  // Note, get is not yet used by the library

  it("valid path - level 1", async function () {
    get({ a: "value" }, ["a"]).should.eql("value");
  });

  it("valid path - level 3 - value string", async function () {
    get({ a: { b: { c: "value" } } }, ["a", "b", "c"]).should.eql("value");
  });

  it("valid path - level 3 - value `false`", async function () {
    get({ a: { b: { c: false } } }, ["a", "b", "c"]).should.eql(false);
  });

  it("get missing path - level 3 - relax", async function () {
    should(get({}, ["a", "b", "c"])).eql(undefined);
  });

  it("get missing path - level 3 - strict", async function () {
    (() => get({}, ["a", "b", "c"], true)).should.throw(
      "REMARK_TABLE_OF_CONTENT: property does not exists in strict mode.",
    );
  });
});
