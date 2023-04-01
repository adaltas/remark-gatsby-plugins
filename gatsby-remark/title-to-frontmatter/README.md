
# Package `gatsby-remark-title-to-frontmatter`

This package is a Gatsby module to move the title from the Markdown content to the frontmatter object.

This give the developer access to the title property to place it anywhere inside the page layout the way he want.

It supports CommonJS and ES modules.

It searches for the first heading of level 1 and create two frontmatter properties, `title` and `titleHTML`.

The title property is a text version cleaned from any HTML syntax.

## Usage

Install the package:

```bash
npm install gatsby-remark-title-to-frontmatter
```

Open your `gatsby-config.js` file and register the plugin:

```js
export default {
  siteMetadata: {
    title: 'Gatsby website',
  },
  plugins: [{
      // Gatsby plugins registration goes here
    }, {
      resolve: `gatsby-transformer-remark`,
      options: {
        // Remark configuration goes here
        plugins: [{
          resolve: 'gatsby-remark-title-to-frontmatter',
          options: {
            include: [
              '**/*.md', // an include glob to match against
            ],
          },
        }],
      },
    }
  ],
}
```
