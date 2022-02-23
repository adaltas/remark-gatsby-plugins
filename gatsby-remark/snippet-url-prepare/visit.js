
const visit = (ast, type=null, visitor, {index=0, ancestors=[]}={}) => {
  if(ast.children){
    ast.children.map( (child, i) => {
      visit(child, type, visitor, {
        index: i,
        ancestors: [...ancestors, ast]
      })
    })
  }
  if(type && ast.type !== type) return;
  visitor(ast, {
    ancestors: ancestors,
    depth: ancestors.length,
    index: index,
    parent: ancestors[ancestors.length-1]
  })
};

module.exports = visit;
