const appName = process.env.APP_NAME || 'TodoApp';
exports.index = (req, res) => res.render('about', { title: 'О нас', appName });
