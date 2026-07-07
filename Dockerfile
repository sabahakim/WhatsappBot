FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
    fonts-liberation \
    ca-certificates \
    wget \
    xdg-utils \
    lsb-release \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    libu2f-udev \
    libvulkan1 \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

# نزّل نسخة Chrome قديمة متوافقة مع معالجات بدون AVX2
RUN npx puppeteer browsers install chrome@121.0.6167.85 --path /opt/chrome-old

COPY . .

RUN mkdir -p data/files

ENV CHROME_BIN=/opt/chrome-old/chrome/linux-121.0.6167.85/chrome-linux64/chrome

CMD ["npm", "start"]