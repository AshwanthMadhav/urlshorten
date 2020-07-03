const express = require('express')
const mongoose = require('mongoose')
var moment = require('moment');
const Url = require('./models/urls')
const Counter = require('./models/counter')
const app = express()
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const databaseUrl = process.env.DATABASE || 'mongodb://localhost:27017/smstemplate'
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';


mongoose.connect(databaseUrl, {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  try {

    var lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    console.log(lastHour)
    const urls = await Url.aggregate([
      {
        $lookup: {
          from: "counters",
          let: {
            id: "$_id"
          },
          as: "lastHour",
          pipeline: [
            {
              $match:
              {
                $expr:
                {
                  $and:
                    [
                      { $eq: ["$urlId", "$$id"] },
                      { $gte: ["$createdAt", new Date(lastHour)] }
                    ]
                }

              }
            },
          ],
        }
      },
      { $addFields: { lastHourCount: { $size: "$lastHour" } } }
    ])
    res.render('index', { urls: urls, moment: moment, baseUrl: baseUrl })
  } catch (e) {
    throw e
  }

})

app.post('/shortUrl', async (req, res) => {
  console.log(1)
  let shortUrl = await generateRandomString(6)
  console.log(2)
  let obj = {
    url: req.body.url,
    shortUrl: shortUrl,
    createdAt: new Date()
  }
  console.log(3)
  console.log(obj)
  await Url.create(obj)
  res.redirect('/')
})




app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await Url.findOne({ shortUrl: req.params.shortUrl })
  console.log(shortUrl)
  if (!shortUrl) return res.sendStatus(404)
  shortUrl.hits++
  shortUrl.save()
  Counter.create({ urlId: shortUrl._id })
  res.redirect(shortUrl.url)
})


async function generateRandomString(length) {
  console.log("Inside random String")
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  // console.log(retVal)
  let res = await Url.findOne({ where: { code: retVal } })
  if (res) {
    generateRandomString(length)
  } else {
    return retVal;
  }
}




app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening")
});



