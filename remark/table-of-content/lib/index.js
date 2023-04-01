import { visit } from 'unist-util-visit'
import slugify from '@sindresorhus/slugify'
import { mutate } from 'mixme'

export default function remarkToc({
  depth_min = 1,
  depth_max = 3,
  property = ['toc'],
} = {}) {
  if (typeof property === 'string'){
    property = [property]
  }
  return function (tree, vfile) {
    const toc = []
    visit(tree, 'heading', function (node) {
      if (node.depth < depth_min || node.depth > depth_max) return
      toc.push({
        title: node.children[0].value,
        depth: node.depth,
        anchor: slugify(node.children[0].value),
      })
    })
    let mount = vfile
    for(let i = 0; i < property.length - 1; i++){
      const prop = property[i];
      if(!mount[prop]){
        mount[prop] = {}
      }
      mount = mount[prop]
    }
    mount[property[property.length - 1]] = toc
  }
}
