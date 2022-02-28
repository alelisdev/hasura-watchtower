const express = require("express");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const dotenv = require("dotenv");
dotenv.config();
const { hashPassword } = require('./utils/common');
//import utils

//Connect DB
const db = new sqlite3.Database(process.env.WATCHTOWER_DBSOURCE, (err) => { 
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
      console.log('connected the sqlite')
    }
  }
)

const app = express();

// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());

app.get('/', (req, res) => {
  res.send('Hello World');
})

const a = hashPassword('123456789');
a.then(result => {
  
console.log(result)
})

const PORT = process.env.WATCHTOWER_SERVERPORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
