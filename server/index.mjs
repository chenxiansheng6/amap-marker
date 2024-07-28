import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, parse } from 'node:url';
import multiparty from 'multiparty';
import { log, error } from './log.mjs';
import { response } from './util.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

// GET /api/data 获取数据列表
function getDataList(res) {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      error(err);
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
        error(err);
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      const list = JSON.parse(data);
      const item = JSON.parse(body);
      list.content.unshift(item);
      fs.writeFile(dataPath, JSON.stringify(list), (err) => {
        if (err) {
          error(err);
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
        error(err);
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
          error(err);
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
  const parsedUrl = parse(req.url, true);
  const id = parsedUrl.query.id;

  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      error(err);
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
        error(err);
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      response(res, 200, { success: true, data: id });
    });
  });
}

// POST /api/upload 上传文件
function uploadFile(req, res) {
  const dir = `uploads/${new Date().toLocaleDateString().replace(/\//g, '-')}`;
  const form = new multiparty.Form({ uploadDir: dir });
  form.parse(req, (err, fields, files) => {
    if (err) {
      error(err);
      response(res, 400, { success: false, message: err.message });
      return;
    }
    const file = files.file[0];
    const tempPath = file.path;
    const targetPath = path.join(__dirname, dir, file.originalFilename);
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        error(err);
        response(res, 500, { success: false, message: 'Server Error' });
        return;
      }
      response(res, 200, { success: true, data: targetPath });
    });
  });
}

// GET /api/file 获取文件
function getFile(req, res) {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.query.path;

  fs.readFile(path, (err, data) => {
    if (err) {
      response(res, 404, { success: false, message: 'Not Found' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { method, url } = req;

  const parsedUrl = parse(url, true);

  // 处理预检请求
  if (method === 'OPTIONS') {
    response(res, 200, {});
    return;
  }

  if (parsedUrl.pathname === '/api/data') {
    // GET /api/data 获取数据列表
    if (method === 'GET') {
      log('GET /api/data');
      getDataList(res);
    }
    // POST /api/data 新增数据
    else if (method === 'POST') {
      log('POST /api/data');
      createData(req, res);
    }
    // PUT /api/data 更新数据
    else if (method === 'PUT') {
      log('PUT /api/data');
      updateDataList(req, res);
    }
    // DELETE /api/data 删除数据
    else if (method === 'DELETE') {
      log('DELETE /api/data');
      deleteData(req, res);
    }
    else {
      response(res, 405, { success: false, message: 'Method Not Allowed' });
    }
  } else if (parsedUrl.pathname === '/api/upload' && method === 'POST') {
    log('POST /api/upload');
    uploadFile(req, res);
  } else if ((parsedUrl.pathname === '/api/file' && method === 'GET')) {
    log('GET /api/file');
    getFile(req, res);
  } else {
    response(res, 404, { success: false, message: 'Not Found' });
  }
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
