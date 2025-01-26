import "should";
import * as fs from "node:fs";
import * as path from "node:path";
import { exec } from "child_process";

const __dirname = new URL(".", import.meta.url).pathname;
const dir = path.resolve(__dirname, "../samples");
const samples = fs.readdirSync(dir);

describe("Samples", function () {
  for (const sample of samples) {
    // if (!/\.js$/.test(sample)) return;
    it(`Sample ${sample}`, function (callback) {
      exec(`node ${path.resolve(dir, sample)}`, (err) => callback(err));
    });
  }
});
