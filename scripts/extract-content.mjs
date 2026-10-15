// One-time import from the supplied UTF-8 request, preserving Chinese text verbatim.
// Usage: node scripts/extract-content.mjs <request.txt>
import { readFileSync, writeFileSync } from 'node:fs'
const source = readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, '')
const lines = source.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
const p = (text, emphasis) => ({ type: 'p', text, ...(emphasis ? { emphasis } : {}) })
const homeStart = lines.indexOf('简介：') + 1
const aboutStart = lines.indexOf('章节标题：About VPTA')
const pubStart = lines.indexOf('章节标题：Publications')
const home = {
  title: '生产试井分析（VPTA）',
  intro: lines.slice(homeStart, aboutStart).filter(s => !s.startsWith('此处插入') && s !== '用生产数据，读懂油藏脉动。').map(s => p(s)),
  tagline: '用生产数据，读懂油藏脉动。', sections: [],
  citations: lines.slice(pubStart + 1, pubStart + 3),
}
let section
for (const line of lines.slice(aboutStart + 1, pubStart)) {
  if (line.startsWith('小节标题：')) { section = { title: line.slice(5), blocks: [] }; home.sections.push(section) }
  else section.blocks.push(p(line))
}
const emphases = [
  'VPTA 是一种显式反褶积方法',
  '响应提取—综合诊断—直线段分析—参数解释',
  'RTA 可视为 VPTA 在边界控制流条件下的特例',
]
for (const section of home.sections) for (const block of section.blocks) {
  for (const phrase of emphases) if (block.text.includes(phrase)) block.emphasis = phrase
}
const faqStart = lines.indexOf('以下为完整正文：') + 1
const faqEnd = lines.indexOf('七、图片展示')
const faq = []
const listLabels = ['整理生产资料。', '恢复压力响应。', '开展综合诊断。', '检验特征直线。', '计算并核查参数。', '定产条件下，回到 PTA。', '拟稳态边界控制流条件下，得到 RTA 的等效关系。', '输入资料是否一致。', '诊断特征是否相互支持。', '特征直线是否稳定。', '结果是否依赖特定处理选择。', '物理解释是否一致。', '是否得到独立检验。']
const shortTitles = ['为什么需要 VPTA？', '相对于 RTA 的优势', '分析流程与价值', '显式求解与快速计算', '与 PTA、RTA 的关系', '数据要求', '流动段与模型假设', '工况波动与数据噪声', '结果可信度']
let question
for (const line of lines.slice(faqStart, faqEnd)) {
  if (/^\d．/.test(line)) { question = { title: line.slice(2), shortTitle: shortTitles[faq.length], blocks: [] }; faq.push(question); continue }
  if (line.startsWith('以下原文作为') || line.startsWith('不得虚构')) continue
  if (line.startsWith('“网站可先')) { question.editorialNotes = [line]; continue }
  if (line.startsWith('此处插入pictures')) { question.blocks.push({ type: 'image', asset: 'theory' }); continue }
  const label = listLabels.find(s => line.startsWith(s))
  if (label) {
    let list = question.blocks.at(-1)
    if (list?.type !== 'list') { list = { type: 'list', items: [] }; question.blocks.push(list) }
    list.items.push(p(line, label))
  } else {
    const isFirst = question.blocks.length === 0
    const sentence = line.slice(0, line.indexOf('。') + 1)
    const valueEmphasis = line.startsWith('这一顺序的价值在于：') ? '这一顺序的价值在于：每一项参数都可以追溯到相应的诊断特征、分析区间和计算关系。' : undefined
    question.blocks.push(p(line, valueEmphasis || (isFirst ? sentence : undefined)))
  }
}
writeFileSync('src/content/home.zh.json', JSON.stringify(home, null, 2) + '\n')
writeFileSync('src/content/faq.zh.json', JSON.stringify(faq, null, 2) + '\n')
console.log(`Imported ${home.sections.length} home sections and ${faq.length} FAQ questions.`)
