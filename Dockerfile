# ruoyi-web 前端 Dockerfile
FROM node:20-alpine AS builder

WORKDIR /build

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 并安装依赖
RUN npm install -g pnpm && pnpm install

# 复制源码
COPY . .

# 构建生产版本
RUN pnpm build

# Nginx 运行镜像
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=builder /build/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
