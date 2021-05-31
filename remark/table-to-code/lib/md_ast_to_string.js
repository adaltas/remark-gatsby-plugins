
const unified = require('unified');
const stringify = require('remark-stringify');
const gfm = require('remark-gfm');

module.exports = (ast, settings) =>
  unified()
  .use(stringify)
  .use(gfm)
  .data('settings', settings || {})
  .stringify(ast)
