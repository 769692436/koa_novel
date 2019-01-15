const crypto = require('crypto');

module.exports = (pwd, key = 'kel461352') => {
  let hmac = crypto.createHmac('sha256', key);
  hmac.update(pwd);
  return hmac.digest('hex');
}
