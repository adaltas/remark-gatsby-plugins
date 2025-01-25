import dedent from 'dedent'
import { unified } from 'unified'
import markdown from 'remark-parse'
import gfm from 'remark-gfm'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import pluginTableToCode from 'remark-table-to-code'

describe('Markdown table to AST', function () {
  it('simple', async function () {
    const { value } = await unified()
      .use(markdown)
      .use(gfm)
      .use(pluginTableToCode)
      .use(remark2rehype)
      .use(html).process(dedent`
        | 123 | b  |
        |-----|----|
        | 1   | ab |
      `)
    value.should.eql(dedent`
      <pre><code>| 123 | b  |
      | --- | -- |
      | 1   | ab |
      </code></pre>
    `)
  })
})
