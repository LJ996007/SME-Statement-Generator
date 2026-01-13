# 🚀 快速部署指南

## 最简单的方式：Vercel 部署（推荐，免费）

### 一键部署步骤

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel（首次使用需要注册账号）
vercel login

# 3. 在项目目录执行部署
vercel --prod

# 4. 部署完成后，会得到一个链接，例如：
# https://sme-declaration-generator.vercel.app
```

### 将链接分享给他人

部署成功后，直接分享生成的链接即可，任何人都可以通过浏览器访问使用。

---

## 本地使用（无需部署）

如果您只是自己使用，不需要部署到服务器：

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 浏览器访问
# http://localhost:3000
```

---

## 其他部署方式

详细的部署说明（Railway、自托管等）请查看 [完整部署文档](./DEPLOYMENT.md)。

---

## 常见问题

**Q: 需要配置数据库吗？**
A: 不需要。本项目已移除数据库，所有数据都是临时的。

**Q: 部署需要费用吗？**
A: Vercel 提供免费额度（每月 100GB 流量），个人使用完全够用。

**Q: 如何更新已部署的版本？**
A: 修改代码后，再次运行 `vercel --prod` 即可。

---

*详细文档请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)*
