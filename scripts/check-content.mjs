import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
const json = name => JSON.parse(readFileSync(`src/content/${name}.json`, 'utf8'))
const source = readFileSync('docs/requirements.txt', 'utf8').replace(/^\uFEFF/, '')
const lines = source.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
const homeZh = json('home.zh'), homeEn = json('home.en')
const faqZh = json('faq.zh'), faqEn = json('faq.en')
const flatten = blocks => blocks.flatMap(b => b.type === 'p' ? [b.text] : b.type === 'list' ? b.items.map(i => i.text) : [])
const expectedHome = lines.slice(lines.indexOf('简介：') + 1, lines.indexOf('章节标题：Publications'))
  .filter(s => !s.startsWith('此处插入') && !s.startsWith('章节标题：'))
  .map(s => s.startsWith('小节标题：') ? s.slice(5) : s)
const actualHome = [...flatten(homeZh.intro), homeZh.tagline, ...homeZh.sections.flatMap(s => [s.title, ...flatten(s.blocks)])]
assert.deepEqual(actualHome, expectedHome, 'Chinese home text must match the supplied request, in order.')
const expectedFaq = lines.slice(lines.indexOf('以下为完整正文：') + 1, lines.indexOf('七、图片展示'))
  .filter(s => !s.startsWith('以下原文作为') && !s.startsWith('“网站可先') && !s.startsWith('不得虚构') && !s.startsWith('此处插入'))
  .map(s => /^\d．/.test(s) ? s.slice(2) : s)
assert.deepEqual(faqZh.flatMap(q => [q.title, ...flatten(q.blocks)]), expectedFaq, 'Chinese FAQ must preserve every paragraph/list item in order.')
assert.equal(faqZh.length, 9)
assert.equal(faqEn.length, 9)
assert.equal(homeZh.intro.length, homeEn.intro.length)
assert.equal(homeZh.sections.length, homeEn.sections.length)
assert.deepEqual(homeZh.citations, homeEn.citations)
assert.equal(homeZh.citations.length, 2)
for (let i = 0; i < 9; i++) {
  assert.deepEqual(faqZh[i].blocks.map(b => b.type), faqEn[i].blocks.map(b => b.type), `English FAQ ${i + 1}: preserve paragraph/list/image structure.`)
  for (let j = 0; j < faqZh[i].blocks.length; j++) {
    if (faqZh[i].blocks[j].type === 'list') assert.equal(faqZh[i].blocks[j].items.length, faqEn[i].blocks[j].items.length)
  }
}
for (const faq of [faqZh, faqEn]) {
  const index = faq[4].blocks.findIndex(b => b.type === 'image')
  assert(index > 0 && index === faq[4].blocks.length - 2, 'Theory figure must precede the applicability paragraph.')
  assert.equal(faq[3].editorialNotes.length, 1)
}
function checkEmphasis(blocks) {
  for (const b of blocks) {
    if (b.type === 'list') checkEmphasis(b.items)
    if (b.emphasis) assert(b.text.includes(b.emphasis), `Missing emphasis text: ${b.emphasis}`)
  }
}
for (const faq of [faqZh, faqEn]) faq.forEach(q => checkEmphasis(q.blocks))
for (const home of [homeZh, homeEn]) home.sections.forEach(s => checkEmphasis(s.blocks))
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex')
const contentOnly = process.argv.includes('--content-only')
if (!contentOnly) {
  for (const name of ['生产试井分析技术标志.png', 'petroscopy.png', 'data1.png', 'data2.png']) {
    assert.equal(digest(`../pictures/${name}`), digest(`public/pictures/${name}`), `${name} must remain unchanged.`)
  }
}
console.log(`PASS: Chinese source fidelity, 9 bilingual FAQs, translation structure, figure position, hidden editorial notes and emphasis. Original asset checksums: ${contentOnly ? 'SKIPPED (--content-only; no source-material access)' : 'PASS'}.`)
