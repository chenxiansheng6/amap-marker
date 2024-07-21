import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { method, url } = req;

  if (url === '/api/data') {
    // GET /api/data 获取数据列表
    if (method === 'GET') {
      console.log(`[${new Date().toLocaleString()}] GET /api/data`);
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.end(data);
      });
    }
    // POST /api/data 新增数据
    else if (method === 'POST') {
      console.log(`[${new Date().toLocaleString()}] POST /api/data`);
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          const list = JSON.parse(data);
          const item = JSON.parse(body);
          list.content.push(item);
          fs.writeFile(dataPath, JSON.stringify(list), (err) => {
            if (err) {
              res.writeHead(500);
              res.end('Server Error');
              return;
            }
            res.writeHead(200);
            res.end('OK');
          });
        });
      });
    }
    // PUT /api/data 更新数据
    else if (method === 'PUT') {
      console.log(`[${new Date().toLocaleString()}] PUT /api/data`);
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          const list = JSON.parse(data);
          const item = JSON.parse(body);
          const index = list.content.findIndex((i) => i.id === item.id);
          if (index === -1) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          list.content[index] = item;
          fs.writeFile(dataPath, JSON.stringify(list), (err) => {
            if (err) {
              res.writeHead(500);
              res.end('Server Error');
              return;
            }
            res.writeHead(200);
            res.end('OK');
          });
        });
      });
    }
    // DELETE /api/data 删除数据
    else if (method === 'DELETE') {
      console.log(`[${new Date().toLocaleString()}] DELETE /api/data`);
      const id = req.body.id;
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        const list = JSON.parse(data);
        const index = list.content.findIndex((_) => _.id === id);
        if (index === -1) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        list.content.splice(index, 1);
        fs.writeFile(dataPath, JSON.stringify(list), (err) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          res.writeHead(200);
          res.end('OK');
        });
      });
    }
    // 预检请求
    else if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
    }
    else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
