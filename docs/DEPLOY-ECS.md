# 阿里云 ECS 部署与 Git 自动更新

目标：项目跑在 ECS 的 `127.0.0.1:4173`，由 Nginx 对外转发 80/443；GitHub `main` 更新后，服务器自动拉取最新代码并用 PM2 重启。

## 1. 服务器初始化

在阿里云安全组先放行：

- `22/tcp`：SSH
- `80/tcp`：HTTP
- `443/tcp`：HTTPS，绑定域名后使用

SSH 登录服务器：

```bash
ssh root@47.110.49.198
```

首次初始化：

```bash
curl -fsSL https://raw.githubusercontent.com/LiuXiyun/huozheme/main/scripts/server-bootstrap.sh | bash
```

初始化后编辑生产环境变量：

```bash
cd /var/www/huozheme
vi .env
```

至少填入：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
UPSTASH_REDIS_REST_URL=你的 Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN=你的 Upstash Redis REST Token
```

重启：

```bash
pm2 reload huozheme
```

访问：

```text
https://convertos.cn/
```

## 2. GitHub 自动部署

在 GitHub 仓库设置 `Settings -> Secrets and variables -> Actions -> New repository secret`：

```text
ECS_HOST=47.110.49.198
ECS_USER=root
ECS_PORT=22
ECS_APP_DIR=/var/www/huozheme
ECS_SSH_KEY=服务器可登录私钥内容
```

之后每次 push 到 `main`，`.github/workflows/deploy-ecs.yml` 会把当前仓库打包上传到服务器，然后执行：

```bash
cd /var/www/huozheme
npm ci --omit=dev
npm run check
pm2 reload ecosystem.config.cjs --env production
```

## 3. 域名和 HTTPS

当前生产域名：

```text
convertos.cn -> 47.110.49.198
```

注意：大陆地域 ECS 使用域名对外提供 Web 服务时，域名需要完成 ICP 备案。未备案时，即使 DNS、Nginx 和项目都配置正确，公网访问也可能出现 `Non-compliance ICP Filing` 拦截页。

如果要更换域名，把 A 记录指向：

```text
47.110.49.198
```

然后把 `deploy/nginx/huozheme.conf` 里的：

```nginx
server_name _;
```

改成你的域名，例如：

```nginx
server_name huozheme.com;
```

安装证书可以用：

```bash
dnf install -y certbot python3-certbot-nginx || yum install -y certbot python3-certbot-nginx
certbot --nginx -d huozheme.com
```

## 4. 常用命令

```bash
pm2 status
pm2 logs huozheme
pm2 reload huozheme
nginx -t
systemctl reload nginx
```
