import each from 'each'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const __dirname = new URL('.', import.meta.url).pathname
const dir = path.resolve(__dirname, '../samples')
const samples = fs.readdirSync(dir)

describe('Samples', function () {
  each(samples, true, (sample) => {
    if (!/\.js$/.test(sample)) return
    it(`Sample ${sample}`, function (callback) {
      exec(`node ${path.resolve(dir, sample)}`, (err) => callback(err))
    })
  })
})
