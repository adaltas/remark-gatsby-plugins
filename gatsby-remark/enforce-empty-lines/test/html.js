
const dedent = require('dedent')
const Remark = require('remark')
const enforceEmptyLine = require('..')

describe('enforce-empty-lines html', async () => {
  it('require an empty line', async () => {
    const messages = []
    await enforceEmptyLine({
      markdownNode: {
        fileAbsolutePath: __filename,
        frontmatter: {}
      },
      markdownAST: (new Remark()).parse(dedent`
        <div>html</div>
        paragraph
      `),
      reporter: {
        warn: (message) =>  messages.push(message)
      }
    }, {})
    // HTML require an empty line,
    // in the example above,
    // only one node of type html is created,
    // there is no paragraph node
    messages.length.should.eql(0)
  })
  it('require an empty line before', async () => {
    const messages = []
    await enforceEmptyLine({
      markdownNode: {
        fileAbsolutePath: __filename,
        frontmatter: {}
      },
      markdownAST: (new Remark()).parse(dedent`
      * list
        
      <html/>
      `),
      reporter: {
        warn: (message) => messages.push(message)
      }
    }, {})
    messages.length.should.eql(0)
  })

})
