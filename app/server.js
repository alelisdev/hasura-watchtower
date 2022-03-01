const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter');
const dotenv = require("dotenv");
dotenv.config();


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
  console.log(`Server is listening at http://localhost:${port}`);
});
