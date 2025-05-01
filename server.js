require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Render home form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission
app.post('/auth', (req, res) => {
  const {
    client_id,
    redirect_uri,
    authorization_endpoint,
    response_type,
    scope,
    state,
    nonce
  } = req.body;

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type,
    scope,
    state,
    nonce
  });

  const url = `${authorization_endpoint}?${params.toString()}`;
  res.redirect(url);
});

// Callback endpoint
app.get('/callback', (req, res) => {
  res.render('callback', { query: req.query });
});

app.listen(port, () => {
  console.log(`OIDC Debugger running at http://localhost:${port}`);
});
