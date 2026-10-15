# PETROSCOPY 托管与域名接入

## 访问目标

用户要求公开网站，访客访问 `https://www.petroscopy.com` 后可进入 Download 栏目下载文件，无需账号。域名注册信息显示注册商为 Namecheap、NS 为 `dns1.registrar-servers.com` 和 `dns2.registrar-servers.com`，由代购方管理账户。

本项目采用 Sites 静态托管，不需要让开发电脑常开，也不使用 `npm run dev` 作为公网服务。身份配置在 `.openai/hosting.json`；该配置对应的托管地址为 `https://petroscopy-vpta.vastroot129.chatgpt.site`，实际发布状态以发布工具的最终结果为准。

## 构建与下载校验

在 `code/` 中执行：

```powershell
npm ci
npm run check:content -- --content-only
npm run check:downloads
npm run build
node scripts/check-downloads.mjs --dist
```

`--content-only` 不读取受保护的根目录原始图片，只验证中文与原需求、双语结构、图片位置和加粗等内容约束；要执行默认图片 SHA-256 比对，需获得用户对原始图片的读取授权。

当前下载原文件为 `生产试井分析宣传简版 20261006.pptx`，44,066,827 字节，SHA-256：

```text
bd3d2fcb76222ca7c9381fa0fe8f891f8f05126cdd7855fa3f13b3b9f580bb96
```

Cloudflare 静态资源单文件限制为 25 MiB（[官方说明](https://developers.cloudflare.com/workers/platform/limits/)）。项目把经用户授权的原始文件导入为三段不超过 16 MiB 的资源，访客点击后由浏览器读取、核验、恢复为原 PPTX 并触发保存。没有减少幻灯片、重新生成文档或要求用户手动合并。

下载需要保持页面打开，取消或离开页面会中止。浏览器须支持 Fetch、Web Crypto 与 Blob 下载；使用正式 HTTPS 地址或 localhost 测试。资源路径带内容哈希，更新文件后不会把不同版本的段混在一起。

新增或替换下载资料时，先获得该源文件的读取和公开授权，再显式执行 `node scripts/prepare-download.mjs <源文件路径>`，同步检查清单、页面文案和两个下载校验命令。普通构建不需要读取原始 PPTX。

## 发布及域名

1. 复用 `.openai/hosting.json` 的 Site ID；构建、校验后由 Sites 工作流同步源码及发布包。
2. 按用户授权保持公开访问，发布保存的版本，检查部署成功及公开页面、实际下载。
3. 对已发布站点添加 `www.petroscopy.com`。只有域名工具返回的 CNAME 和验证记录才可作为 DNS 配置，不根据托管网址猜测目标。
4. 将准确记录交给代购方，在 Namecheap 的 Domain List → Manage → Advanced DNS 中添加或调整指定主机记录。不要删除邮件 MX、其他 TXT、根域名或无关记录。
5. DNS 更新后刷新域名状态，待域名和 SSL 为有效状态，再用 `https://www.petroscopy.com/#/download` 下载完整文件并校验。

托管地址可用与自定义域名可用是两个独立状态。在 DNS 所有权验证及证书完成前，不宣称 `www.petroscopy.com` 已经接通。用户尚未授权更改根域名 `petroscopy.com` 的访问规则，因此本次以 `www` 为接入目标。

## 后续维护

以后改源码仍需重新构建和发布，不能只修改本机 `dist`。原始资料、密钥、临时短期仓库凭证、IDE 文件和依赖缓存不应上传；发布下载资源只包含本次明确授权的 PPTX。记录最终实际发布链接和 DNS 配置的交付文件与本源码分开保存，避免把发布前后的不同源码误认为同一个版本。
