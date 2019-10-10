const path = require('path')
const express = require('express')
const multer = require('multer')
const marked = require('marked')
const mysql = require('mysql')
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 5002
const mysqlHOST = process.env.MYSQL_HOST || 'localhost'
const mysqlUSER = process.env.MYSQL_USER || 'root'
const mysqlPASS = process.env.MYSQL_PASS || 'password'
const mysqlDB = process.env.MYSQL_DB || 'data'

app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

var con = mysql.createConnection({
  host: mysqlHOST,
  user: mysqlUSER,
  password: mysqlPASS,
  database: mysqlDB
});

con.connect(function (err) {
  if (err) throw err
});



app.get('/', async (req, res) => {
  let k = []
  con.query("SELECT * FROM korisnici", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    k = result
  });
  res.send({ users: k });
})

app.post('/login', async (req, res) => {
  var sql = "SELECT * FROM korisnici WHERE name = '" + req.body.name + "' AND password = '" + req.body.password + "'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result[0])
    console.log("result",JSON.parse(JSON.stringify(result)))
    res.send (JSON.parse(JSON.stringify(result)))
  });
})

app.post('/check', async (req, res) => {
  var sql = "SELECT name FROM korisnici "
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result[0])
    console.log("result",JSON.parse(JSON.stringify(result)))
    res.send (JSON.parse(JSON.stringify(result)))
  });
})

app.post(
  '/insert',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    /*console.log(req.method)
    console.log(req.body.mail)*/

    var sql = "INSERT INTO korisnici (name, password, status, mail) VALUES ('" + req.body.name + "' , '" + req.body.password + "' , '" + req.body.status + "' , '" + req.body.mail + "' )";

    console.log(sql)

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ odg: 'Correct' });
    });

  }
)

app.post('/update', async (req, res) => {
  con.connect(function (err) {
    if (err) throw err;
    var sql = "UPDATE korisnici SET status = '" + req.body.status + "' WHERE id = " + req.body.id + "";
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ odg: 'Correct' });
    });
  });
})

app.post('/delete', async (req, res) => {
  var rez
  con.connect(function (err) {
    if (err) throw err;
    var sql = "DELETE FROM korisnici WHERE id = " + req.body.id + "";
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ odg: 'Correct' });
    });
  });
})

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})


