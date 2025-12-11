const express = require('express');
const logger = require('./middleware/logger');
const timeRoutes = require('./routes/timeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(express.static('public'));

app.use('/api', timeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
