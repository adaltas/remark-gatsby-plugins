
const path = require('path')
const visit = require('unist-util-visit')

module.exports = (options) =>
  (tree, file) =>
    visit(tree, 'link', (node) => {
      if(options.baseURL && /^\//.test(node.url)){
        node.url = path.join(options.baseURL, node.url)
      }
    })
