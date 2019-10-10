const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')
const objectId = require('mongodb').ObjectID
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 5003
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/movieReview'



app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
  var db = await initMongo()
  //console.log(await returnReviews(db))
  res.send( {reviews : await returnReviews(db)})
})

app.post(
  '/delete',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    console.log('delete pozvan') 
    var db = await initMongo()
    await deleteReview(db, req.body.id)
    res.redirect('/')
  }
)

app.post(
  '/insert',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    //console.log('insert pozvan') 
    console.log(req.body)
    var db = await initMongo()
    await saveReview(db, {
      userid: req.body.korisnik,
      rate: req.body.rate,
      name: req.body.name,
      year: req.body.year,
      casts: req.body.casts,
      description: req.body.description
    })
    res.redirect('/')
  }
)

app.post(
  '/update',
  multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
  async (req, res, next) => {
    console.log('update pozvan') 
    var db = await initMongo()
    await updateReview(db, {
      userid: req.body.korisnik,
      rate: req.body.rate,
      name: req.body.name,
      year: req.body.year,
      casts: req.body.casts,
      description: req.body.description
    }, req.body.id)
    res.redirect('/')
  }
)


app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})






//////////////////////////////////////////////////////////

async function initMongo() {
  //console.log('Initializing MongoDB...')
  let success = false
  while (!success) {
    try {
      client = await MongoClient.connect(mongoURL, { useNewUrlParser: true })
      success = true
    } catch (e) {
      console.log('Error connecting to MongoDB, retrying in 1 second')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  //console.log('MongoDB initialized')
  return client.db(client.s.options.dbName).collection('reviews')
}

async function returnReviews(db) {
  const reviews = (await db.find().toArray()).reverse()
  return reviews
}

async function deleteReview(db, id) {
  await db.deleteOne({ "_id": objectId(id) })
}

async function updateReview(db, review, id) {
  await db.updateOne({ "_id": objectId(id) }, { $set: review })
}

async function saveReview(db, review) {
  console.log('poznav sam')
  await db.insertOne(review)
}