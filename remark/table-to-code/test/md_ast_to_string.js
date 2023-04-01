import { unified } from 'unified'
import parse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import md_ast_to_string from 'remark-table-to-code/md_ast_to_string'

describe('Convert an AST to a string', () => {
  it('simple', async () => {
    const { value } = await unified()
      .use(parse)
      .use(() => {
        return (tree) => {
          const node = {}
          node.type = 'code'
          node.value = JSON.stringify(md_ast_to_string(tree))
          return node
        }
      })
      .use(remark2rehype)
      .use(html)
      .process('hello')
    value.should.eql('<pre><code>"hello\\n"\n</code></pre>')
  })
})
