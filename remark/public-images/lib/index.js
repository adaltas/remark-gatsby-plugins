import crypto from "crypto";
import { visit } from "unist-util-visit";
import { exec } from "child_process";
import path from "node:path";

export const hash = (str) =>
  crypto.createHash("md5").update(str, "utf8").digest("hex");

export default function publicImages(options = {}) {
  // Normalization
  if (!options.repo_local)
    throw Error(
      'Required Property: public_images require the "repo_local" option',
    );
  if (!options.repo_public)
    throw Error(
      'Required Property: public_images require the "repo_public" option',
    );
  if (!options.base_url)
    throw Error(
      'Required Property: public_images require the "base_url" option',
    );
  if (!options.source)
    throw Error('Required Property: public_images require the "source" option');
  options.source = path.resolve(process.cwd(), options.source);
  if (!options.location)
    options.location = ({ options, node }) =>
      path.join(hash(options.source), node.url);
  return async (ast, vfile) => {
    const images = [];
    vfile.images = images;
    const res = visit(ast, "image", (node) => {
      if (!/\.png$/.test(node.url)) return;
      const image = {
        // Relative path inside markdown
        url: node.url,
        alt: node.alt,
        // Relative location of image in local and remote repositories
        target: options.location({ options: options, node: node }),
      };
      node.url = new URL(image.target, options.base_url).href;
      images.push(image);
    });
    await new Promise((resolve, reject) => {
      exec(
        [
          `set -e`,
          `[ -d ${options.repo_local} ] || mkdir -p ${options.repo_local}`,
          `cd ${options.repo_local}`,
          `[ -d ${options.repo_local}/.git ] || git init`,
          `git remote get-url origin || git remote add origin ${options.repo_public}`,
          // Pull in case the remote repo contains changes
          `git show-ref --verify --quiet refs/heads/master && git pull origin master`,
          `if [ ! -f .gitignore ]; then`,
          `cat <<-GITIGNORE >.gitignore`,
          `.*`,
          `!.gitignore`,
          `GITIGNORE`,
          `  git add .gitignore`,
          `  git commit -m "ignore hidden files"`,
          `  git push origin master`,
          `fi`,
          `# Reset if option is activated and if there is more than the first initial commit`,
          `reset=$([ ! -z '${options.reset ? "1" : ""}' ] && [ \`git rev-list HEAD --count\` -gt '1' ] && echo '1' || echo '')`,
          `if [ ! -z "$reset" ]; then`,
          `  git reset --hard HEAD~1`,
          `fi`,
          images
            .map((image) =>
              [
                `mkdir -p ${path.dirname(image.target)}`,
                `cp ${path.join(path.dirname(options.source), image.url)} ${image.target}`,
                `git add ${image.target}`,
              ].join("\n"),
            )
            .join("\n"),
          `if [ ! -z "$(git status --porcelain)" ]; then`,
          `  git commit -m 'upload new images'`,
          `fi`,
          `force=$([ ! -z "$reset" ] && echo '-f' || echo '')`,
          `git push $force origin master`,
        ].join("\n"),
        (err) => (err ? reject(err) : resolve()),
      );
    });
    return res;
  };
}
