const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
