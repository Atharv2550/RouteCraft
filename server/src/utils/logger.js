const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
}

export const logger = {
  error: (msg, meta) => {
    if (logLevels[currentLevel] >= logLevels.error) {
      console.error(formatMessage('error', msg, meta));
    }
  },
  warn: (msg, meta) => {
    if (logLevels[currentLevel] >= logLevels.warn) {
      console.warn(formatMessage('warn', msg, meta));
    }
  },
  info: (msg, meta) => {
    if (logLevels[currentLevel] >= logLevels.info) {
      console.log(formatMessage('info', msg, meta));
    }
  },
  debug: (msg, meta) => {
    if (logLevels[currentLevel] >= logLevels.debug) {
      console.debug(formatMessage('debug', msg, meta));
    }
  }
};
