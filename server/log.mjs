export function log(...args) {
  console.log(`[${new Date().toLocaleString()}]`, ...args);
}

export function error(...args) {
  console.error(`[${new Date().toLocaleString()}]`, ...args);
}
