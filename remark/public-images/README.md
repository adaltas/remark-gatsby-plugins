
# Remark Public images

Upload every image present on the markdown article into a public GIT repository and update the `src` image attribute to reflect the new public URL.

## Options

- `base_url` ()\
  Base public Git URL use to view raw data file.
- `location` ()\
  Convert the image path into a path inside the local repository.
- `repo_public` ()\
  Address of the remote repository, user must have read/write access.
- `reset` (boolean, `false`)\
  Reset the Git commit history if repository already exists
- `source` ()\
  Location of the original markdown document.
- `repo_local` ()\
  Address of the local Git directory.

## Exemple

```js
{

  "plugin": require('remark-public_images'),
  "settings": {
    "target": `${require('os').homedir()}/.medium_git`,
    "repository": 'https://github.com/adaltas/website_pub.git',
    "base_url": 'https://raw.githubusercontent.com/adaltas/website_pub/master/',
    "reset": true,
    "source": params.source,
    "location": ({options, node}) => {
      const dir = path.relative(
        "#{process.cwd()}/content", path.dirname(options.source))
      return path.join(dir, node.url)
    }
  }
}
```
