# Sử dụng Node.js 18 làm base image .23-slim tránh lỗ hổng bảo mật do FROM node:18
# thường được build trên Debian/Ubuntu base, và những hệ điều hành này liên tục được cập nhật các bản 
# vá bảo mật. Nên khi bạn dùng một image quá cũ,
# Docker sẽ cảnh báo rằng image đó không còn an toàn nữa.

FROM node:18.20-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5003

CMD ["npm", "start"]