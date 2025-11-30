function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };

  console.log(JSON.stringify(logEntry));
}

function info(message, data) {
  log('INFO', message, data);
}

function warn(message, data) {
  log('WARN', message, data);
}

function error(message, data) {
  log('ERROR', message, data);
}

module.exports = {
  info,
  warn,
  error
};
