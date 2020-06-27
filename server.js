const express = require('express')
const mongoose = require('mongoose')
const Url = require('./models/urls')
const Counter = require('./models/counter')
const app = express()

mongoose.connect('mongodb+srv://admin:admin2020@urlshortner-ordjy.mongodb.net/urlshortner?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
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
  res.render('index', { urls: urls })
})

app.post('/shortUrl', async (req, res) => {
  let shortUrl = generateRandomString(6)
  let obj = {
    url: req.body.url,
    shortUrl: shortUrl,
    createdAt: new Date()
  }
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


function generateRandomString(length) {
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}




app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening")
});



