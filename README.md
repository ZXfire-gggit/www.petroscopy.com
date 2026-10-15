# PETROSCOPY 桌面端前端框架

第一版使用 Vue 3、Vite、Vue Router 和 JavaScript。代码全部存放在本 `code` 文件夹，原始 `pictures` 素材未修改。项目已接入公开下载并准备 Sites 静态托管，部署与域名说明见 `docs/deployment.md`。

## 启动与构建

要求 Node.js 22.12+（本次使用 22.19.0）及 npm。

```powershell
cd 'D:\桌面\www.petroscopy.com\code'
npm ci
npm run dev
```

当前已安装依赖，可以直接运行 `npm run dev`。浏览器打开终端输出的本机地址，默认是 `http://127.0.0.1:5173/`。终端按 Ctrl+C 停止服务。

```powershell
npm run check:content
npm run build
npm run preview
```

`dist` 是已生成的构建产物；`npm run preview` 在本机预览构建结果，默认地址 `http://127.0.0.1:4173/`。请通过 HTTP 服务访问，不能通过双击 `dist/index.html` 运行模块脚本。

## 文件结构

```text
src/
  main.js                 应用入口
  App.vue                 共用页面布局、标题及语言同步
  router.js               五个栏目与 hash 路由配置
  style.css               桌面版式、颜色与组件样式
  config/assets.js        标识、科学图片、二维码、外部链接的集中配置
  components/
    BrandHeader.vue       原始品牌标识与中英文按钮
    SiteNav.vue           五项导航及选中状态
    SiteFooter.vue        共用页脚
    WechatEntry.vue       圆形公众号入口、点击展开与拖动贴边
    ImageLightbox.vue     原图弹层、Esc、Tab 约束及焦点返回
    ContentBlocks.vue     段落、加粗及列表的统一渲染
  views/
    HomeView.vue          首页与一条双语论文记录
    FaqView.vue           连续展示九题及问题锚点目录
    EmptyView.vue         Cases、Download、Contact 共用空页面
  content/
    home.zh.json          首页完整中文
    home.en.json          首页英文待校审稿
    faq.zh.json           FAQ 完整中文与隐藏编辑备注
    faq.en.json           FAQ 英文待校审稿与隐藏编辑备注
    home.js / faq.js      双语内容汇总
    ui.js                 导航辅助、图注、弹层、页脚等双语文字
    language.js           语言状态及 localStorage 记忆
public/pictures/          本地原始图片副本
scripts/
  check-content.mjs       中文逐段核对、译文结构、图片位置和素材校验
  extract-content.mjs     可选的一次性中文内容导入脚本
docs/
  requirements.txt        本次完整需求原文（未读取 DOCX）
  acceptance.md           验收记录与待补充事项
  screenshots/            本次桌面验收截图
```

首页和 FAQ 的正文集中保存在 JSON 中。修改文案不需要修改页面组件。`emphasis` 必须是对应 `text` 的原文子串；`type: "list"` 保存列表；`type: "image"` 指定图片插入位置。`editorialNotes` 保留编辑备注，不渲染给访客。

## 页面与交互

- `/#/`：VPTA 首页；`/#/faq`：FAQ。
- `/#/cases`、`/#/contact`：只有栏目标题与待补充说明。
- `/#/download`：公开 PPTX 资料下载，不需要注册，支持进度显示、取消及重试。
- 默认中文；切换语言保留栏目及问题锚点，刷新后记住选择。
- FAQ 默认显示全部答案。目录使用 RouterLink，避免普通锚点破坏 hash 路由。
- 科学图片保持完整比例，点击或聚焦后按 Enter 打开原始分辨率图片。弹层可滚动查看，关闭按钮和 Esc 关闭，Tab 留在弹层，关闭后返回图片按钮。
- 公众号入口仅点击后展开，再次点击、点击外部或按 Esc 收起；鼠标悬停和仅聚焦不会展开。聚焦后可用 Enter 或空格切换，拖动不会误打开二维码。
- 公众号入口为 64px 圆形，可拖动；松开后按最近距离吸附到左右边缘，保留纵向位置。方向键可移动，左右键切换贴边侧。窗口尺寸改变时保持在可见范围，靠近顶部时二维码向下展开。
- 桌面容器 1120px；首页阅读和图表区域 980px，FAQ 阅读区域 860px，右侧为问题目录。只提供桌面版式，最小宽度 1280px，没有其他终端菜单。
- 字体使用系统本地字体。Vue、路由、样式和图片均由本地服务提供，不使用在线翻译或字体 CDN。

## 素材与待校审事项

已使用左侧 `生产试井分析技术标志.png`、右侧 `petroscopy.png`；首页 `data1.png`、FAQ 第 5 题 `data2.png`。四张素材的 SHA-256 与原文件一致，未裁切、拉伸或重新生成。

需求后半部分出现 `data.png`，目录中不存在该文件；依据前文明确指定及现有素材，首页采用 `data1.png`。没有缺失科学图片。

**缺失素材：真实公众号二维码。** 当前显示“二维码待补充”，没有生成假二维码。补充时将真实图片放入 `public/pictures`，在 `src/config/assets.js` 中将 `wechatQr: null` 改为 `picture('真实文件名.png')`。

英文全文和辅助文字均为**待人工校审稿**。专业术语采用 Pressure Transient Analysis (PTA)、Rate Transient Analysis (RTA)、Variable-rate Pressure Transient Analysis (VPTA)、material-balance time、pseudosteady-state、boundary-dominated flow、explicit deconvolution、pseudopressure 和 pseudotime；模型与近似条件保留在译文中。图片中的原始中文、公式和数据保持不变。

## 外部链接核验

- [MRST 首页](https://www.sintef.no/projectweb/mrst/)与 [MRST FAQ](https://www.sintef.no/projectweb/mrst/faq/)已读取并查看布局，作为学术网站结构参考。
- [论文 DOI](https://doi.org/10.19657/j.geoscience.1000-8527.202511060144)：已尝试访问，但本次访问工具未能获取有效页面，**未成功核验可达性及对应论文内容**。
- [公众号文章](https://mp.weixin.qq.com/s/WEFVgOopnVauMKddUwQv8g)：已尝试访问，但本次访问工具未能获取有效页面，**未成功核验可达性及文章内容**。

上述两条论文相关链接保持用户提供的地址，没有据此认定链接失效，也未虚构 PDF 下载文件。
