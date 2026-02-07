module.exports = (req, res, next) => {
  const adminHeader = req.headers['x-admin'];
  if (adminHeader === 'true') {
    next();
  } else {
    res.status(403).send('Доступ запрещён: отсутствует заголовок X-Admin: true');
  }
};
