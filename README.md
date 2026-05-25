# 代理管理系统 - 部署说明

## 🚀 快速部署

### 方案一：Vercel 部署（推荐）
1. 访问 https://vercel.com/new
2. 导入 `https://github.com/xu525/dytg-ui`
3. 点击 Deploy，几秒钟后即可获得公网地址

### 方案二：Netlify 部署
1. 访问 https://app.netlify.com/start
2. 连接 GitHub 账户
3. 导入 `https://github.com/xu525/dytg-ui`
4. 点击 Deploy site

### 方案三：GitHub Pages
1. 在仓库 Settings > Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main`，Folder 选择 `/ (root)`
4. 点击 Save

## 📁 项目结构
```
/workspace/
├── index.html      # 主页面
├── css/
│   └── style.css   # 样式文件
├── js/
│   └── app.js      # JavaScript 逻辑
├── vercel.json     # Vercel 配置
├── netlify.toml    # Netlify 配置
└── README.md
```

## 💻 本地开发
```bash
# 启动本地服务器
cd /workspace
bash start.sh
```
访问 http://localhost:8080

---
GitHub 仓库: https://github.com/xu525/dytg-ui
