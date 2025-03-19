const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// import express from 'express';
// import path from 'path';
// import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3090;

// 配置静态文件目录
app.use(express.static(path.resolve('dist')));

// 配置代理
app.use('/constellationApi', createProxyMiddleware({
  target: 'http://web.juhe.cn',
  changeOrigin: true,
  pathRewrite: { '^/constellationApi': '' },
}));

app.use('/carletApi', createProxyMiddleware({
  target: 'https://apis.juhe.cn',
  changeOrigin: true,
  pathRewrite: { '^/carletApi': '' },
}));

app.use('/jianguoyunApi', createProxyMiddleware({
  target: 'https://dav.jianguoyun.com/dav/',
  changeOrigin: true,
  pathRewrite: { '^/jianguoyunApi': '' },
}));

// 匹配所有路由并返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});