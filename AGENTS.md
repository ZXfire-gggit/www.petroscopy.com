# PETROSCOPY 项目指南与工作约定

适用于本目录及其子目录。以下路径以本目录（`code/`）为基准，`../` 指工作区根目录。本文维护项目速览、关键实现及长期规则；细节按任务查阅，不必每次遍历全部源码。当前用户的新要求优先于已有范围和历史记录；实现变化后同步更新本文件。

## 项目速览

- 本项目是 PETROSCOPY 生产试井分析（VPTA）学术介绍网站的第一版桌面前端，参考 MRST 的品牌区、横向导航和连续阅读布局。
- 当前已完成首页、九题 FAQ、双语正文、原图放大、公众号浮动入口和公开 Download 页面；Cases、Contact 共用空页面。下载无需账号，没有后端、数据库、认证、在线计算、上传或在线翻译接口。
- 应用入口是 `index.html → src/main.js → src/App.vue`；`App.vue` 组织品牌区、导航、路由正文和页脚，公众号组件放在 `RouterView` 外，因此切换栏目不会重新创建它。
- 依赖仅使用现有 Vue 3、Vue Router、Vite 及 Vue 插件，没有组件库、Pinia、独立测试框架或 CSS 框架。项目建议 Node.js 22.12+，使用 npm 和现有 `package-lock.json`。

## 按任务定位代码

| 任务 | 优先查看 | 关键关联 |
| --- | --- | --- |
| 修改首页结构 | `src/views/HomeView.vue` | `src/content/home.zh.json`、`home.en.json` |
| 修改 FAQ 或目录 | `src/views/FaqView.vue` | `src/content/faq.zh.json`、`faq.en.json` |
| 修改栏目与导航 | `src/router.js`、`src/components/SiteNav.vue` | `src/views/EmptyView.vue` 共用 Cases、Contact |
| 修改公开下载 | `src/views/DownloadView.vue`、`src/lib/download.js` | `src/config/downloads.generated.json`、`public/downloads/` |
| 修改左右标识或语言按钮 | `src/components/BrandHeader.vue` | `src/config/assets.js`、`src/content/language.js` |
| 修改字号、宽度、颜色与布局 | `src/style.css` | 全站共用；部分选择器在文件末尾有覆盖规则 |
| 修改正文的段落、加粗或列表渲染 | `src/components/ContentBlocks.vue` | 内容 JSON 的块结构，见下文 |
| 修改科学图片预览 | `src/components/ImageLightbox.vue` | 缩略图、原始尺寸弹层、键盘焦点 |
| 修改公众号入口 | `src/components/WechatEntry.vue` | 拖动状态、点击展开、贴边与窗口约束 |
| 修改全站辅助文字 | `src/content/ui.js` | 图注、按钮说明、页脚、译稿提示等双语文案 |
| 核对原始需求与既有验收 | `docs/requirements.txt`、`docs/acceptance.md` | `docs/screenshots/` 是历史截图，不代表当前实时状态 |

## 页面、语言与内容机制

### 路由与页面

- 导航顺序固定为 VPTA、FAQ、Cases、Download、Contact，对应 `/#/`、`/#/faq`、`/#/cases`、`/#/download`、`/#/contact`。未知路由重定向首页。
- 路由使用 `createWebHashHistory()`；FAQ 目录必须使用带 `path` 和 `hash` 的 `RouterLink`，例如 `{ path: '/faq', hash: '#question-5' }`。不要用普通 `href="#question-5"` 覆盖整个路由 hash。
- 路由滚动处理支持历史位置恢复、锚点上方 24px 留白及新页面回到顶部；栏目切换后，`App.vue` 把焦点移到正文区域。
- 首页顺序为简介、标语、`data1.png`、About VPTA 四个小节、Publications。Publications 是首页章节，没有独立路由。
- FAQ 九题默认连续显示，目录链接到 `question-1` 至 `question-9`。第 3、5、9 题分别有 5、2、6 个列表项；第 5 题的 `data2.png` 位于理论关系总结之后、适用条件说明之前。

### 双语与数据格式

- `language.js` 导出全局 `language`、计算属性 `ui` 和 `setLanguage()`；默认中文，只有本地保存值为 `en` 时启动为英文。存储键是 `petroscopy-language`，存储不可用时有异常保护。
- 切换语言仅改变响应式状态，不跳转路由，因此当前栏目和锚点保留。`App.vue` 同步更新 `document.title` 与 HTML 的 `lang`；英文页面显示待校审提示。
- `home.js`、`faq.js` 汇总两种语言的 JSON，页面按语言取值；不用在页面组件里复制正文。
- 首页数据包含 `title`、`intro`、`tagline`、`sections` 和 `citations`；FAQ 是包含 `title`、`shortTitle`、`blocks` 的问题数组。
- 正文块：`{ type: 'p', text, emphasis? }` 表示段落；`{ type: 'list', items }` 表示有序列表，列表项含 `text` 和可选 `emphasis`；`{ type: 'image', asset: 'theory' }` 表示图片插槽。
- `emphasis` 必须是对应 `text` 的连续子串；当前渲染器只加粗首次匹配。文字使用 Vue 插值，不注入 HTML；图片由页面插槽渲染，FAQ 当前固定使用 `assets.theory`，新增不同图片时需同时调整插槽逻辑。
- FAQ 第 4 题的速度表述编辑备注保存在 `editorialNotes`，不会渲染；不要把它移入 `blocks`，也不要虚构速度提升倍数。

## 素材、版式与现有交互

### 素材约定

- 原始素材位于 `../pictures/`，实际随站点提供的副本位于 `public/pictures/`。`assets.js` 用 `import.meta.env.BASE_URL` 拼接路径，Vite 的 `base` 为 `./`；保持相对部署路径兼容，不散写绝对站点路径。
- 左标识：`生产试井分析技术标志.png`，点击回首页；右标识：`petroscopy.png`。首页用 `data1.png`，FAQ 用 `data2.png`。需求中后段的 `data.png` 指代不一致，目前依据前文及真实文件采用 `data1.png`。
- `MRST.png`、`VPTA.png` 只是原始目录中的其他素材，目前没有用于页面；不要自动替换已有标识映射。
- 真实公众号二维码尚未接入，配置为 `assets.wechatQr = null`。补图时放入 `public/pictures/` 并更新映射，同时检查 `ui.js` 中 `qrHelp` 的“素材尚未提供”说明，避免接入后仍显示旧提示。
- DOI 和公众号文章地址集中在 `externalLinks`；现有记录未成功核验其可达性和对应内容，不把“未核验”写成“链接失效”。没有论文 PDF 下载资源。

### 布局与交互维护点

- 全站样式在 `src/style.css`：桌面最小宽度 1280px，居中主容器 1120px，首页阅读区 980px，FAQ 为 860px 正文、56px 间距、204px 目录。窄于最小宽度会横向滚动，当前没有移动版布局。
- 标识保持原比例。品牌区使用 `min-height: 158px` 及上下 16px 内边距，让图片撑开高度；不要改回不足以容纳标识的固定高度，否则图片会再次遮住导航左上角。
- 图片放大使用原生 `<dialog>` 并 Teleport 到 `body`，按原始分辨率显示、可滚动查看；关闭按钮、Esc 和背景可关闭，关闭后返回触发按钮。现有 Tab 处理只聚焦唯一的关闭按钮；若新增弹层控件，应一并调整焦点循环。
- 公众号入口为 64px 圆形，初始在右下方；Pointer Events 配合指针捕获处理拖动，移动超过 5px 才算拖动。松开后吸附最近的左右边缘，边距 14px，保留并约束纵向位置。
- 拖动会关闭二维码，`ignoreClick` 防止松开时合成的点击误打开；普通点击、Enter、空格切换展开，再次点击、点击外部或入口内 Esc 关闭。悬停及仅聚焦均不展开，这是用户后续明确修改的行为。
- 左右方向键切换贴边侧，上下方向键每次移动 20px；顶部不足 240px 时面板向下展开。窗口变化时重新约束位置；事件监听器在卸载时清理。
- 浮动位置仅保存在组件内存，切换栏目保留，刷新后回到初始位置；尚未实现位置持久化。动画尊重 `prefers-reduced-motion`。

## 校验脚本的特殊约束

- `scripts/check-content.mjs` 是 Node.js 断言脚本，不是浏览器测试：检查中文与需求原文逐段一致、九题 FAQ、中英块结构和列表项数量、同一论文的双语引用、图片插入位置、隐藏备注、加粗子串及四张素材的 SHA-256。
- 素材校验默认读取 `../pictures/`，受根目录 AGENTS.md 的来源资料授权限制；没有读取授权时使用 `npm run check:content -- --content-only`，明确报告跳过原始图片校验，不把部分检查称为完整素材校验。默认校验仍保留。
- `scripts/extract-content.mjs` 是一次性中文导入工具：在本目录执行 `node scripts/extract-content.mjs <需求文本路径>`。它按原需求的标题和编号解析，并直接覆盖 `home.zh.json`、`faq.zh.json`；不会更新英文。正常维护直接编辑对应内容文件，不随手重跑导入器覆盖人工修改。
- 更新科学正文时，中英文内容、核对依据与断言必须按已授权需求同步维护；构建成功不等于科学内容已校审，内容核对通过也不等于浏览器交互通过。

## 公开下载与托管

- 用户授权将 `生产试井分析宣传简版 20261006.pptx` 用于公开下载，原文件不修改。文件 44,066,827 字节，完整 SHA-256 保存在下载清单中。
- 为适配静态托管单资源大小限制，发布资源按 16 MiB 分为三段；页面点击下载后流式读取各段、逐段校验 SHA-256，组合为原文件名的完整 PPTX，再触发浏览器保存。访客不需要手动解压或合并；不假装提供不存在的完整文件直链。
- `scripts/prepare-download.mjs <已授权的PPTX路径>` 只在明确导入或替换下载资料时手动执行，生成版本化资源目录及 `src/config/downloads.generated.json`；正常构建不重新读取原始 PPTX。导入新资料会更新清单，须同步 UI 和校验。
- `npm run check:downloads` 核对 public 下载资源；`node scripts/check-downloads.mjs --dist` 核对构建输出，均不需要再读取根目录原始资料。浏览器支持进度、取消、重试，离开下载页面会取消请求。
- Sites 身份保存在 `.openai/hosting.json`，复用该 `project_id`，不要重复创建站点；发布目录是 `dist/`。短期仓库凭证仅在会话内使用，禁止写入文件或日志。
- 用户已要求公开网站、访客免注册下载，并绑定 `www.petroscopy.com`。域名公开注册信息指向 Namecheap，但域名由他人代购；DNS 控制权需用户或代购方操作。托管发布成功不等于自定义域名已生效，须区分并据实交付。

## 开发方式

- 使用现有 Vue 3、Vite、Vue Router、JavaScript 和 npm；不要无故迁移技术栈、增加依赖或大范围重构。
- 保持 Vue 单文件组件及 `<script setup>` 写法；采用 UTF-8、两空格缩进，JavaScript 使用单引号并沿用无分号风格。
- 共用交互放在组件中，路由集中在 `src/router.js`，素材路径和外部链接集中在 `src/config/assets.js`，中英文文案集中在 `src/content/`。
- 修改应围绕当前需求，保留用户已有改动。默认只维护桌面端；新增后端、登录、上传、计算或其他终端版本须有用户明确需求。

## 命令与验证

以下命令在本文件所在目录执行；若当前位于工作区根目录，先 `cd code`。

| 用途 | 命令 |
| --- | --- |
| 按锁文件安装依赖 | `npm ci` |
| 启动本机开发服务 | `npm run dev` |
| 核对正文、双语结构及原始素材 | `npm run check:content` |
| 核对公开下载资料 | `npm run check:downloads` |
| 生产构建 | `npm run build` |
| 本机预览构建结果 | `npm run preview` |

- 修改应用源码、样式、依赖或构建配置后执行 `npm run build`；仅修改说明文档时无需构建。
- 修改 `src/content/`、素材映射、图片或内容处理脚本后，还须执行 `npm run check:content`。若用户已授权更改正文，按新需求同步核对依据，不通过删除断言掩盖问题。
- 修改页面或交互后，在桌面浏览器检查受影响的行为、布局及控制台错误；涉及公共组件时检查首页和 FAQ。键盘、拖动、语言切换等只在相关改动时针对性验证。
- 当前没有独立的 `test` 或 `lint` 脚本，不虚构验证结果。检查失败应修复；无法执行时说明具体限制。
- 临时验收服务用完停止；用户明确要求运行项目时保留服务并提供实际地址，不停止用户已在运行的其他服务。

## 内容与交互边界

- 中文科学正文、公式、数据、DOI 和论文信息不得擅自删改；英文保留模型假设、近似条件及适用范围，未经人工校审保持译稿标识。
- 论文的中文和英文引用属于同一条记录；`editorialNotes` 只用于编辑，不显示给访客。
- 图片保持原始比例及完整内容；缺少素材时显示明确占位，不生成替代科学图表、假二维码、假下载文件或虚构联系方式。
- 默认保留五项导航及现有 hash 路由；Cases、Contact 保留标题和待补充说明。Download 已按后续需求扩展为真实的公开资料下载。
- 共用交互须支持键盘与合理焦点管理。公众号入口保持圆形、可拖动及左右贴边；二维码仅点击或键盘激活后展开，悬停和仅聚焦不展开，拖动不得误触打开。

## 文件与外部操作

- 不手工编辑 `node_modules/`、`.npm-cache/`、`dist/`；`dist/` 由构建生成。依赖变化时通过 npm 同步 `package-lock.json`。
- `../pictures/`、原始 DOCX/PPTX 及 `docs/requirements.txt` 是来源资料，未经用户授权不覆盖、不删除；不要为通过检查改动原始科学素材。
- 不在代码、文档、截图或日志中写入密钥、Token、账户凭证；不提交含敏感信息的配置。
- 未经用户明确要求，不购买、不配置域名、不公开发布、不修改外部系统。外部链接是否核验应据实说明。

## 交付前

- 检查修改范围与需求一致、没有意外改动或敏感信息；有 Git 时查看实际差异。
- 用中文简述修改内容、实际完成的验证及剩余限制；可视改动附必要截图。项目详细说明与验收记录放在 `README.md`、`docs/`，不要把临时任务清单或完整文档堆入本文件。
