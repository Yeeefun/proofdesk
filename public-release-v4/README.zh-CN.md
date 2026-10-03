# ProofDesk：给过度结论踩一下刹车

[中文只读演示](https://proofdesk-readonly-20261002.yeefuntec-7175.chatgpt.site/) · [English](README.md) · [MIT](LICENSE)

这是一个用虚构声明、证据和CSV说明“证据撤回后，声明应回到待复核”的原型，不是通用事实核查器。

## 当前架构与能力

Astro从`site-src`构建中英静态页面壳；只读Worker匿名读取同一Sanity公开数据集，以`validateState`、`currentClaim`、`assess`判断状态。浏览器只取`/api/state`。所有非GET/HEAD方法403，`/api/action`也403；云读取失败503且不返回本地fixture。可下载CSV是明示虚构材料，不是云故障的替代数据。

公开配置：项目`w6fg4266`、数据集`production`、API版本`2026-03-01`。不需要也不要放写令牌。切换语言只改变已知示例和标签的显示，中文原文保留，未知文本不自动翻译；不写Sanity，不调用模型或翻译API。

演示路径：看当前声明/待复核，查看已撤回证据，再展开版本与复核历史。宽泛原声明、较窄新版本、批准和撤回都保留。英文使用`/en/`，中文用`/`。版本2将旧`/?lang=en`兼容跳到`/en/`。版本1曾HTTP通过但浏览器显示中文，原结论已按实际浏览器结果纠正。

## 本地只读复现

Node 24+、pnpm 11.19.0，依赖与锁文件不升级。PowerShell：

```powershell
npx --yes pnpm@11.19.0 install --frozen-lockfile
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run build
npm start
```

打开`http://127.0.0.1:4321/`或`/en/`。`npm run dev`也是先构建后只读启动，无热更新。PORT可改端口，但固定绑定127.0.0.1，不能用HOST暴露网络。此Node桥接不是生产托管入口。

构建输出Worker时只把core的Node randomUUID导入改为Web Crypto。新增桥接调用同一个构建Worker，仅服务dist/client内文件，并核真实路径，防止符号链接越界。它不加载.env，只转发三项公开选择器，不传SANITY_API_TOKEN，不新增本地或云写能力。

构建后运行`npm run test:readonly`，验证双语/HEAD/写拒绝/路径及链接越界/云故障无回退；这些测试用模拟上游，不冒充真实云结果。`node scripts/public-read-once.mjs`另做一次匿名公共读取。旧规则测试保留，本次未因文档改动重复运行。

## 来源与实际验收界限

本包对应已导出的生产版本2提交988546fd0207656a9493041ac394c0b1dc5909ee，修复版本1语言导航。核心逐字节保留，文档、启动/构建/核验辅助及新测试有独立变更，旧Node/Render入口和账号部署标识移除。整个v4不等于生产源SHA，具体差异和哈希见交付清单。

包装前操作者已验真实云2声明/1证据/2决定、待复核、POST403；历史批准/撤回操作确实发生在虚构演示记录上。模拟故障503无回退。HTTP不替代浏览器语言/手机目视；根另报告版本2浏览器语言切换、原文展开及390宽中英截图可读无横向溢出，本包装阶段不声称独立复查生产浏览器。后续云状态可能变化，以带时间的验收记录为准。

准备开始时GitHub Yeeefun/proofdesk仍为空。本站已上线，但本包未上传，参赛资格/最终投稿/获奖均未完成，不算收入。MIT为2026 ProofDesk contributors，依赖保留各自许可。

src/pages、旧repository适配、cloud/demo-reset脚本、Sanity种子与schema是历史私有复现源码，不由当前site-src构建编译，也不是公共UI写能力。不要在共享公开数据集运行seed/approve/withdraw。本包无写凭证，仅说明只读复现；操作者标签不是认证，追加式操作也不等于不可篡改日志。

干净源码不含安装依赖、.env、Git历史、缓存或账号部署身份。构建本包不创建/更新原Site，不声称Render部署成功。
