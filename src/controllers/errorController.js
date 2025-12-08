const appName = process.env.APP_NAME || 'TodoApp';
exports.notFound = (req, res) => {
  res.status(404).render('404', { title: 'Не найдено', appName, url: req.originalUrl });
};
