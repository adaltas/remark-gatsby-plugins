import dedent from "dedent";
import os from "os";
import { exec } from "child_process";
import fs from "fs/promises";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginPublicImages, { hash } from "remark-public-images";

describe("Public images", function () {
  it("simple", async function () {
    const tmpdir = `${os.tmpdir()}/remark_public_images`;
    const config = {
      // repo_local was target
      repo_local: `${tmpdir}/local`,
      // repo_public was repository
      repo_public: `${tmpdir}/public`,
      base_url: "https://domain.com/repo/master/",
      reset: true,
      source: `${tmpdir}/article/index.md`,
    };
    const content = "![Image 1](./image_1.png)";
    const content_image_1 = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs";
    await new Promise((resolve, reject) => {
      exec(
        dedent`
        rm -r ${tmpdir}
        mkdir ${tmpdir}
        mkdir ${tmpdir}/article
        mkdir ${tmpdir}/public
        cd ${tmpdir}/public
        git init --bare --initial-branch=main
      `,
        (err) => (err ? reject(err) : resolve()),
      );
    });
    await fs.writeFile(`${tmpdir}/article/index.md`, content, "ascii");
    await fs.writeFile(
      `${tmpdir}/article/image_1.png`,
      content_image_1,
      "base64",
    );
    const { value, images } = await unified()
      .use(parseMarkdown)
      .use(pluginPublicImages, config)
      .use(remark2rehype)
      .use(html)
      .process(await fs.readFile(config.source));
    images.should.eql([
      {
        url: "./image_1.png",
        alt: "Image 1",
        target: `${hash(config.source)}/image_1.png`,
      },
    ]);
    value.should.eql(
      [
        "<p>",
        `<img src="https://domain.com/repo/master/${hash(config.source)}/image_1.png" alt="Image 1">`,
        "</p>",
      ].join(""),
    );
  });
});
