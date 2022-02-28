const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieParser = require('cookie-parser')
const knexConfig = require('./db/knexfile');
const userRouter = require('./routes/userRouter');
const dotenv = require("dotenv");
dotenv.config();
//initialize knex
const knex = require('knex')(knexConfig[process.env.NODE_ENV])
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());
app.use(cookieParser());

const port = 5000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/v1', userRouter)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
