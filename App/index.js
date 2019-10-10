const path = require('path')
const express = require('express')
const multer = require('multer')
const marked = require('marked')
const request = require('request');

const app = express()
const port = process.env.PORT || 5004
const mongoAppURL = process.env.MONGO_APP_URL || 'http://localhost:5003/'
const mySQLAppURL = process.env.MYSQL_APP_URL || 'http://localhost:5002/'

var ulogovan = false;
var name = '';
var userid = '';
var mail = '';
var master = false;

app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  let lockres = res
  request.get(mongoAppURL, async (err, res, body) => {
    if (err) {
      return console.log(err);
    }

    lockres.render('index', { reviews: (JSON.parse(body).reviews), ulogovan: ulogovan })
  });
})

app.post(
  '/delete',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    let lockres = res
    request.post(
      {
        url: mongoAppURL + 'delete',
        json: true,
        body: {
          id: req.body.id
        }
      },
      (err, res, body) => {
        if (err) {
          return console.log('greska' + err);
        }
        lockres.redirect('/')
      });
  }
)

app.post(
  '/insert',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    let lockres = res
    console.log.korisnik
    request.post(
      {
        url: mongoAppURL + 'insert',
        json: true,
        body: {
          korisnik: userid,
          rate: req.body.rate,
          name: req.body.name,
          year: req.body.year,
          casts: req.body.casts,
          description: req.body.description
        }
      },
      (err, res, body) => {
        if (err) {
          return console.log('greska' + err);
        }
        lockres.redirect('/')
      });
  }
)


app.post(
  '/update',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    let lockres = res
    request.post(
      {
        url: mongoAppURL + 'update',
        json: true,
        body: {
          korisnik: userid,
          rate: req.body.rate,
          name: req.body.name,
          year: req.body.year,
          casts: req.body.casts,
          description: req.body.description,
          id: req.body.id
        }
      },
      (err, res, body) => {
        if (err) {
          return console.log('greska' + err);
        }
        lockres.redirect('/')
      });
  }
)
/////////////////////////////////////////////
//my SQL

app.post(
  '/insert-user',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    let lockres = res

    request.post(
      {
        url: mySQLAppURL + 'insert',
        json: true,
        body: {
          name: req.body.name,
          password: req.body.password,
          status: req.body.status,
          mail: req.body.mail
        }
      },
      (err, res, body) => {
        if (err) {
          return console.log('greska' + err);
        }
        lockres.redirect('/')
      });
  }
)

app.post(
  '/login',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    let lockres = res
    request.post(
      {
        url: mySQLAppURL + 'login',
        json: true,
        body: {
          name: req.body.name,
          password: req.body.password
        }
      },
      (err, res, body) => {
        if (err) {
          return console.log('greska' + err);
        }
        if (body.length > 0) {
          name = body[0].name
          userid = body[0].id
          mail = body[0].mail
          ulogovan = true
          if (body[0].status == 'superuser')
            master = true
          else
            master = false
        } else {
          name = ''
          userid = ''
          mail = ''
          ulogovan = false
          master = false
        }


        lockres.redirect('/')
      });
  }
)

/////////////////////////////////////////////
//nove strane

app.post('/', async (req, res) => {
  let lockres = res
  request.get(mongoAppURL, async (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    lockres.render('index', { reviews: (JSON.parse(body).reviews), ulogovan: ulogovan })
  });
})

app.post('/insert-page', async (req, res) => {
  let lockres = res
  request.get(mongoAppURL, async (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    var ret = []
    var reviews = JSON.parse(body).reviews
    reviews.forEach(element => {
      if (element.userid == userid)
        ret.push(element)
    });
    
    lockres.render('insert', { reviews: ret, ulogovan: ulogovan })
  });
})

app.post('/delete-page', async (req, res) => {
  let lockres = res
  request.get(mongoAppURL, async (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    var ret = []
    var reviews = JSON.parse(body).reviews
    reviews.forEach(element => {
      if (element.userid == userid)
        ret.push(element)
    });
    if (master)
      lockres.render('delete', { reviews: reviews, ulogovan: ulogovan })
    else {
      lockres.render('delete', { reviews: ret, ulogovan: ulogovan })
    }
  });
})

app.post('/update-page', async (req, res) => {
  let lockres = res
  request.get(mongoAppURL, async (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    var ret = []
    var reviews = JSON.parse(body).reviews
    reviews.forEach(element => {
      if (element.userid == userid)
        ret.push(element)
    });
    lockres.render('update', { reviews: ret, ulogovan: ulogovan })
  });
})

app.post('/login-page', async (req, res) => {
  res.render('login', { ulogovan: ulogovan })
})

app.post('/logout', async (req, res) => {
  ulogovan = false
  name = '';
  userid = '';
  mail = '';
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})

////////////////////////////////////////



