FROM node:lts-bookworm-slim
RUN apt-get update && apt-get install -y curl unzip \
    && curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/bun \
    && rm -rf /root/.bun \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /usr/src/app
COPY package.json bun.lockb tsconfig.json ./
RUN bun install --production --frozen-lockfile --ignore-scripts
RUN bun install -g pm2
COPY . .
RUN bun nest build
EXPOSE 80
CMD ["pm2-runtime", "dist/main.js", "-i", "max"]
