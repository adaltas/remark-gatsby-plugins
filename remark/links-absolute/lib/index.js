
import { visit } from 'unist-util-visit'

export default function linksAbsolute (options) {
  return (tree, file) =>
    visit(tree, 'link', (node) => {
      if(options.baseURL && /^\//.test(node.url)){
        node.url = new URL(node.url, options.baseURL).href
      }
    })
  }
