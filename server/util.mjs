// 构造响应消息
export const response = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(data));
};
