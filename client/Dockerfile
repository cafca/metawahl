# Node 10 required by react-scripts 2.x. Upgrade both together later.
FROM node:10-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000


FROM node:10-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV BROWSER=none \
    HOST=0.0.0.0 \
    CHOKIDAR_USEPOLLING=true
EXPOSE 3000
CMD ["yarn", "start"]


FROM node:10-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG REACT_APP_API_ROOT
ENV REACT_APP_API_ROOT=${REACT_APP_API_ROOT}
RUN yarn build


FROM nginx:1.27-alpine AS prod
COPY --from=builder /app/build /usr/share/nginx/html
# CRA SPA: unknown paths fall through to index.html.
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / { try_files $uri /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
