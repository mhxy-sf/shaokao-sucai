# 烧烤店图片素材库

一个纯静态、移动端自适应的图片素材管理网站，用于集中管理烧烤店的门店展示、菜品、环境等素材，供员工/合作方自由浏览与下载。无后端、无构建，可直接托管到 GitHub Pages。

## 功能

- 按「美团 + 扩展」分组展示图片素材
- 移动端自适应（手机、平板、桌面均可正常浏览）
- 图片点击大图预览，支持下载原图
- 支持非图片文件（PDF、Word、Excel、证照等）直接下载
- 管理员本地整理文件即可更新，无需登录

## 分组结构

| 分组 id | 名称 | 说明 |
| --- | --- | --- |
| `storefront` | 门店展示 | 门头、招牌、外立面 |
| `dishes` | 菜品 | 烧烤单品、特色菜 |
| `environment` | 环境 | 店内环境、桌椅、包间 |
| `packaging` | 包装与物料 | 打包盒、手提袋、logo 物料 |
| `promotion` | 活动与海报 | 促销海报、活动图 |
| `misc` | 其他文件资料 | 菜单、证照、宣传文档 |

## 目录结构

```
├── index.html        # 单页应用入口
├── style.css         # 样式
├── app.js            # 交互逻辑
├── data.json         # 分组与文件清单（核心配置）
├── images/           # 素材存放目录
│   ├── storefront/   # 门店展示
│   ├── dishes/       # 菜品
│   ├── environment/  # 环境
│   ├── packaging/    # 包装与物料
│   ├── promotion/    # 活动与海报
│   └── misc/         # 其他文件资料
└── README.md
```

## 如何添加/管理素材（管理员）

1. 把图片或文件放进对应的 `images/` 子文件夹（建议用 `01.jpg`、`02.jpg` 这样有序的命名）。
2. 打开 `data.json`，在对应分组的 `items` 里添加一条记录：

```json
{
  "id": "dishes",
  "name": "菜品",
  "desc": "烧烤单品、特色菜",
  "items": [
    { "name": "招牌烤串", "file": "images/dishes/01.jpg" }
  ]
}
```

- `name`：素材显示名称
- `file`：文件相对路径（图片会自动预览，非图片显示为下载卡片）

3. 保存后提交到 GitHub，网站即自动更新。

### data.json 结构说明

```json
{
  "site": { "name": "XX烧烤店", "subtitle": "图片素材库" },
  "categories": [ ... ]
}
```

- `site.name` / `site.subtitle`：顶部店名与副标题
- `categories`：分组数组，每个分组包含 `id`（唯一，用于锚点）、`name`、`desc`、`items`

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库，将本项目所有文件推送到仓库。
2. 仓库 **Settings → Pages**，将 **Source** 选为 `main` 分支根目录（或 `/docs`，若你放在 docs 里）。
3. 保存后稍等，GitHub 会生成 `https://<你的用户名>.github.io/<仓库名>/` 访问地址。

> 提示：`data.json` 和图片都随仓库一起托管，纯静态，无需服务器或域名（也可自行绑定自定义域名）。

## 本地预览

直接用浏览器打开 `index.html` 即可。若因浏览器限制 `fetch` 本地 JSON 而报错，可起一个本地静态服务器：

```bash
# 任选其一
python -m http.server 8000
# 或
npx serve .
```

然后访问 `http://localhost:8000`。
