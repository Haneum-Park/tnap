const crypto = require('crypto');
const moment = require('moment');

const generateHmac = (method, url, secretKey, accessKey) => {
  const parts = url.split(/\?/);
  const [path, query = ''] = parts;
  
  const datetime = moment.utc().format('YYMMDD[T]HHmmss[Z]');
  const message = datetime + method + path + query;
  
  const signature = crypto.createHmac('sha256', secretKey)
      .update(message)
      .digest('hex');
  
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
};

export { generateHmac };