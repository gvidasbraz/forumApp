const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const router = require('./routes/router');
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_KEY)
  .then(() => console.log('DB connected'))
  .catch((err) => {
    console.log(`Error connecting to the database: ${err}`);
  });

app.use(express.json());
app.use(cors());
app.use('', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
