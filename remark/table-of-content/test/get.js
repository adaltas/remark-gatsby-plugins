import { get } from '../lib/index.js'

describe('Utils `get`', () => {
  // Note, get is not yet used by the library
  
  it('valid path - level 1', async () => {
    get({ a: 'value' }, ['a']).should.eql('value')
  })

  it('valid path - level 3 - value string', async () => {
    get({ a: { b: { c: 'value' } } }, ['a', 'b', 'c']).should.eql('value')
  })

  it('valid path - level 3 - value `false`', async () => {
    get({ a: { b: { c: false } } }, ['a', 'b', 'c']).should.eql(false)
  })

  it('get missing path - level 3 - relax', async () => {
    should(get({}, ['a', 'b', 'c'])).eql(undefined)
  })

  it('get missing path - level 3 - strict', async () => {
    ;(() => get({}, ['a', 'b', 'c'], true)).should.throw(
      'REMARK_TABLE_OF_CONTENT: property does not exists in strict mode.'
    )
  })
})
