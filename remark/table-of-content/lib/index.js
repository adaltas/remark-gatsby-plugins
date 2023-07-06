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
      const title = node.children
      .filter((child) => child.type === 'text' || child.type === 'strong' || child.type === 'emphasis' || child.type === 'inlineCode')
      .map((child) => {
          // when the text is bold or italic, the node.children[0] is not a text node but a strong or emphasis node
          // so we need to check the type of the node.children[0] to get the text value
          if (child.type === 'strong' || child.type === 'emphasis') {
            // case strong AND emphasis (***italic bold***) : the node.children[0] as an embedded node with the type strong or emphasis
            if (child.children[0].type === 'strong' || child.children[0].type === 'emphasis') {
              return child.children[0].children[0].value;
            }
            return child.children[0].value;
          } 
          // but for inlineCode and text node, the value is directly in the child.value
          return child.value;
        })
        .join('');
      if (!title) return;
      toc.push({
        title: title,
        depth: node.depth,
        anchor: slugify(title),
      });
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
