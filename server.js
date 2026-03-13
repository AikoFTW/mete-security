const path = require('path');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const HAS_ADMIN_AUTH_CONFIG = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isAdmin = Boolean(req.session.isAdmin);
  next();
});

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  next();
}

app.get('/', (req, res) => {
  res.render('home', {
    title: 'METE Security | Professional Security Services',
  });
});

app.get('/services', (req, res) => {
  res.render('services', {
    title: 'Services | METE Security',
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact & Inquiries | METE Security',
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About | METE Security',
  });
});

app.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }

  res.render('admin-login', {
    title: 'Admin Login | METE Security',
    error: null,
  });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!HAS_ADMIN_AUTH_CONFIG) {
    return res.status(500).render('admin-login', {
      title: 'Admin Login | METE Security',
      error: 'Admin credentials are not configured on the server.',
    });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.adminUser = username;
    return res.redirect('/admin');
  }

  return res.status(401).render('admin-login', {
    title: 'Admin Login | METE Security',
    error: 'Invalid username or password.',
  });
});

app.post('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin-dashboard', {
    title: 'Admin Dashboard | METE Security',
    adminUser: req.session.adminUser,
  });
});

app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 | Page Not Found',
  });
});

const server = app.listen(PORT, () => {
  console.log(`METE Security server running on http://localhost:${PORT}`);
  if (!HAS_ADMIN_AUTH_CONFIG) {
    console.warn('Warning: ADMIN_USERNAME and ADMIN_PASSWORD are not set.');
  }
  if (!process.env.SESSION_SECRET) {
    console.warn('Warning: SESSION_SECRET is not set. Using temporary runtime secret.');
  }
});

server.on('error', (error) => {
  if (error.code !== 'EADDRINUSE') {
    throw error;
  }

  const fallbackPort = PORT + 1;
  app.listen(fallbackPort, () => {
    console.log(
      `Port ${PORT} is in use. METE Security server running on http://localhost:${fallbackPort}`
    );
  });
});
