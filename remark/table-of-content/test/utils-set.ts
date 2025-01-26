import "should";
import { set } from "../src/index.js";

describe("Utils `set`", function () {
  it("valid path - property not yet defined - level 1", async function () {
    const input = {};
    set(input, ["a"], "value");
    input.should.eql({ a: "value" });
  });

  it("valid path - property not yet defined - level 3", async function () {
    const input = {};
    set(input, ["a", "b", "c"], "value");
    input.should.eql({ a: { b: { c: "value" } } });
  });

  it("fail to overwrite parent path", async function () {
    const input = { a: { b: true } };
    (() => set(input, ["a", "b", "c"], "value")).should.throw(
      "REMARK_TABLE_OF_CONTENT: cannot overwrite parent property.",
    );
  });

  it("value exists - level 3 - overwrite false", async function () {
    const input = { a: { b: { c: true } } };
    set(input, ["a", "b", "c"], "value");
    input.should.eql({ a: { b: { c: true } } });
  });

  it("value exists - level 3 - overwrite true", async function () {
    const input = { a: { b: { c: true } } };
    set(input, ["a", "b", "c"], "value", true);
    input.should.eql({ a: { b: { c: "value" } } });
  });
});
