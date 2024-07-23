import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

// 构造响应消息
const response = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(data));
};

// GET /api/data 获取数据列表
function getDataList(res) {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      response(res, 500, { success: false, message: 'Server Error' });
      return;
    }
    const content = data ? JSON.parse(data).content : [];
    response(res, 200, { success: true, data: content });
  });
}

// POST /api/data 新增数据
function createData(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      const list = JSON.parse(data);
      const item = JSON.parse(body);
      list.content.unshift(item);
      fs.writeFile(dataPath, JSON.stringify(list), (err) => {
        if (err) {
          response(res, 500, { success: false, message: 'Server Error' });
          return;
        }
        response(res, 200, { success: true, data: item });
      });
    });
  });
}

// PUT /api/data 更新数据
function updateDataList(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      const list = JSON.parse(data);
      const item = JSON.parse(body);
      const index = list.content.findIndex((i) => i.id === item.id);
      if (index === -1) {
        response(res, 404, { success: false, message: 'Not Found' });
        return;
      }
      list.content[index] = item;
      fs.writeFile(dataPath, JSON.stringify(list), (err) => {
        if (err) {
          response(res, 500, { success: false, message: 'Server Error' });
          return;
        }
        response(res, 200, { success: true, data: item });
      });
    });
  });
}

// DELETE /api/data 删除数据
function deleteData(req, res) {
  const id = req.url.split('/').pop();
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      response(res, 500, { success: false, message: 'Server Error' });
      return;
    }
    const list = JSON.parse(data);
    const index = list.content.findIndex((_) => _.id === id);
    if (index === -1) {
      response(res, 404, { success: false, message: 'Not Found' });
      return;
    }
    list.content.splice(index, 1);
    fs.writeFile(dataPath, JSON.stringify(list), (err) => {
      if (err) {
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      response(res, 200, { success: true, data: id });
    });
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { method, url } = req;

  if (url.includes('/api/data')) {
    // GET /api/data 获取数据列表
    if (method === 'GET') {
      console.log(`[${new Date().toLocaleString()}] GET /api/data`);
      getDataList(res);
    }
    // POST /api/data 新增数据
    else if (method === 'POST') {
      console.log(`[${new Date().toLocaleString()}] POST /api/data`);
      createData(req, res);
    }
    // PUT /api/data 更新数据
    else if (method === 'PUT') {
      console.log(`[${new Date().toLocaleString()}] PUT /api/data`);
      updateDataList(req, res);
    }
    // DELETE /api/data 删除数据
    else if (method === 'DELETE') {
      console.log(`[${new Date().toLocaleString()}] DELETE /api/data`);
      deleteData(req, res);
    }
    // 预检请求
    else if (method === 'OPTIONS') {
      response(res, 200, {});
    }
    else {
      response(res, 405, { success: false, message: 'Method Not Allowed' });
    }
  } else {
    response(res, 404, { success: false, message: 'Not Found' });
  }
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
