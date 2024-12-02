FROM rocker/r-ver:4.3.0

# 安装依赖
RUN apt-get update && apt-get install -y \
  libcurl4-openssl-dev \
  libssl-dev \
  libxml2-dev \
  zlib1g-dev \
  libsodium-dev
RUN R -e "install.packages('plumber')"

# 复制 plumber 脚本到容器中
COPY api.R /app/api.R
WORKDIR /app

# 启动 plumber 服务
CMD ["R", "-e", "install.packages('plumber');library(plumber);pr <- plumb('api.R');pr$run(host='0.0.0.0', port=8000)"]

# 暴露端口
EXPOSE 8000
