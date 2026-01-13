# 中小企业声明函生成器 - 部署指南

> 本指南介绍如何将声明函生成器部署到生产环境，供个人使用或分享给他人。

---

## 快速部署方案对比

| 方案 | 难度 | 费用 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **Vercel** | ⭐ 简单 | 免费/便宜 | 快速分享，个人使用 | ⭐⭐⭐⭐⭐ |
| **Railway** | ⭐⭐ 中等 | 有免费额度 | 需要后端服务 | ⭐⭐⭐⭐ |
| **自托管 (VPS)** | ⭐⭐⭐ 复杂 | 便宜 | 完全控制 | ⭐⭐⭐ |
| **本地构建** | ⭐ 简单 | 免费 | 仅自己使用 | ⭐⭐⭐⭐ |

---

## 方案一：Vercel 部署（推荐）

Vercel 是最简单的部署方案，提供免费额度，自动 HTTPS，全球 CDN。

### 1.1 准备工作

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login
```

### 1.2 创建 `vercel.json` 配置

在项目根目录创建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ]
}
```

### 1.3 环境变量配置

在 Vercel 控制台设置以下环境变量：

```bash
NODE_ENV=production
PORT=3000
```

**注意**：本项目已移除数据库和 OAuth，无需配置 `DATABASE_URL` 或 OAuth 相关变量。

### 1.4 部署命令

```bash
# 一键部署
vercel

# 生产环境部署
vercel --prod
```

### 1.5 获取访问地址

部署完成后，Vercel 会提供一个 URL，例如：
- `https://sme-declaration-generator.vercel.app`

您可以将此链接分享给任何人使用。

---

## 方案二：Railway 部署

Railway 支持后端服务，提供免费额度（每月 $5）。

### 2.1 通过 GitHub 部署

1. 将代码推送到 GitHub
2. 访问 [railway.app](https://railway.app/)
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择您的仓库
5. Railway 会自动检测并部署

### 2.2 环境变量配置

在 Railway 控制台添加：

```bash
NODE_ENV=production
PORT=3000
```

### 2.3 获取访问地址

Railway 会自动提供一个 URL，例如：
- `https://sme-declaration-generator.up.railway.app`

---

## 方案三：自托管 (VPS/云服务器)

适合有自己的服务器或 VPS 的用户。

### 3.1 构建项目

```bash
# 1. 安装依赖
pnpm install

# 2. 构建生产版本
pnpm build

# 3. 测试运行
pnpm start
```

### 3.2 使用 PM2 守护进程

```bash
# 安装 PM2
npm i -g pm2

# 启动应用
pm2 start dist/index.js --name sme-declaration

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3.3 使用 Nginx 反向代理

创建 Nginx 配置 `/etc/nginx/sites-available/sme-declaration`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/sme-declaration /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.4 配置 HTTPS（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 方案四：本地构建使用

如果您只需要自己在本地使用，无需部署到服务器。

### 4.1 构建本地版本

```bash
# 安装依赖
pnpm install

# 开发模式运行（支持热重载）
pnpm dev

# 访问 http://localhost:3000
```

### 4.2 创建桌面快捷方式（Windows）

1. 创建一个批处理文件 `启动声明函生成器.bat`:

```batch
@echo off
cd /d "C:\Users\markl\Desktop\ai\中小企业声明函网页\sme_declaration_generator"
pnpm dev
pause
```

2. 双击运行即可启动

### 4.3 打包为可执行文件（可选）

使用 [pkg](https://github.com/vercel/pkg) 将 Node.js 应用打包为可执行文件：

```bash
# 安装 pkg
npm i -g pkg

# 打包
pkg dist/index.js -t node18-win-x64 --output sme-declaration-generator.exe
```

---

## 环境配置说明

### 必需环境变量

```bash
NODE_ENV=production  # 运行环境
PORT=3000            # 端口号（可自定义）
```

### 无需配置（已移除）

- ~~DATABASE_URL~~ - 数据库已移除
- ~~OAUTH_CLIENT_ID~~ - OAuth 已移除
- ~~OAUTH_CLIENT_SECRET~~ - OAuth 已移除

---

## 分享给他人使用

### 方式一：分享公开链接

部署到 Vercel/Railway 后，直接分享生成的 URL：
- 例如：`https://sme-declaration-generator.vercel.app`

**优点**：
- 无需安装，打开即用
- 自动 HTTPS，安全可靠
- 全球 CDN 加速

### 方式二：部署到私有服务器

如果有自己的服务器，可以：
1. 按照自托管方案部署
2. 分享服务器地址
3. 配置域名和 HTTPS

### 方式三：提供源代码

如果对方愿意自己部署：
1. 将代码推送到 GitHub
2. 设置为公开仓库
3. 对方可以克隆并自行部署

---

## 域名配置（可选）

### 在 Vercel 配置自定义域名

1. 在 Vercel 项目设置中，点击 "Domains"
2. 添加您的域名（例如 `declaration.yourdomain.com`）
3. 按照提示配置 DNS 记录：
   ```
   Type: CNAME
   Name: declaration
   Value: cname.vercel-dns.com
   ```

### 在 Railway 配置自定义域名

1. 在 Railway 项目设置中，点击 "Domains"
2. 添加您的域名
3. 配置 DNS 记录

---

## 性能优化建议

### 1. 启用压缩

在 `server/_core/index.ts` 中添加：

```typescript
import compression from 'compression'

app.use(compression())
```

### 2. 配置缓存

对于静态资源，配置长期缓存：

```typescript
app.use(express.static('dist/public', {
  maxAge: '1y',
  immutable: true
}))
```

### 3. CDN 加速

使用 Cloudflare CDN：
1. 注册 Cloudflare 账号
2. 添加您的域名
3. 修改域名服务器为 Cloudflare
4. 自动享受全球 CDN 加速

---

## 监控和日志

### Vercel 日志

访问 Vercel 控制台查看部署日志和访问统计。

### Railway 日志

Railway 提供实时日志查看功能。

### PM2 日志（自托管）

```bash
# 查看日志
pm2 logs sme-declaration

# 查看实时日志
pm2 logs sme-declaration --lines 100
```

---

## 成本估算

| 方案 | 免费额度 | 超出费用 |
|------|---------|---------|
| **Vercel** | 100GB 带宽/月 | $20/100GB |
| **Railway** | $5/月 | $0.0042/秒 |
| **VPS (1C2G)** | 无 | ¥30-50/月 |

**个人使用建议**：
- 少量使用：Vercel 免费额度足够
- 中等使用：Railway 免费额度足够
- 大量使用：自托管 VPS 最划算

---

## 常见问题

### Q1: 部署后无法访问？

**检查清单**：
- [ ] 构建是否成功（`pnpm build`）
- [ ] 端口是否正确（默认 3000）
- [ ] 环境变量是否配置
- [ ] 防火墙是否开放端口

### Q2: Vercel 部署超时？

**解决方案**：
- 增加 Vercel 超时时间
- 优化构建时间
- 使用 `vercel.json` 配置

### Q3: 如何更新部署？

**Vercel/Railway**：
- 推送到 GitHub 主分支
- 自动触发重新部署

**自托管**：
```bash
git pull
pnpm build
pm2 restart sme-declaration
```

### Q4: 数据会丢失吗？

**不会**。本项目已移除数据库，所有数据都是临时的，用户每次使用时重新填写。无需担心数据丢失。

### Q5: 支持多少并发用户？

由于无数据库限制，理论上支持无限并发。实际受限于：
- Vercel: 100GB 带宽/月
- Railway: $5 免费额度
- 自托管: 服务器配置

---

## 推荐部署流程

### 首次部署（推荐 Vercel）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 获得链接并分享
# https://sme-declaration-generator.vercel.app
```

### 后续更新

```bash
# 修改代码后，推送更新
git add .
git commit -m "更新功能"
git push

# Vercel/Railway 会自动重新部署
```

---

## 技术支持

如遇到部署问题，可以：
1. 检查构建日志
2. 查看 Vercel/Railway 文档
3. 检查本项目的 GitHub Issues

---

## 快速参考

### 部署命令速查

```bash
# Vercel
vercel login && vercel --prod

# Railway
# 通过 GitHub 连接自动部署

# 自托管
pnpm build && pm2 start dist/index.js --name sme-declaration

# 本地开发
pnpm dev
```

### 关键文件

```
├── vercel.json          # Vercel 配置
├── package.json         # 构建脚本
├── dist/                # 构建输出
│   ├── public/          # 前端资源
│   └── index.js         # 后端入口
└── server/_core/        # 服务端代码
```

---

*最后更新：2026-01-08*
