const path = require('path');

exports.getDefault = (req, res, next) => {
  let reqPath = path.join(__dirname, '..', 'views', 'index.html');
  res.sendFile(reqPath);
};
