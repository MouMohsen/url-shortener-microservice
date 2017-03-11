var express = require('express')
var app = express()
var path = require('path')
var port = process.argv.PORT || 3000
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var databaseUrl = 'mongodb://localhost:27017/url-shortener'



app.set('views',"");
app.set('view engine', 'ejs')


app.get("/url/:url(*)"||"/url" ,function(req,res){
  var url = req.params.url || req.query.url
  var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  if (!re.test(url)) {
    response = {
      sourceUrl : null,
      targetUrl : null
    }
    res.json(response)
    console.log('Invalid URL')
  } else {
    var randomNum = Math.floor((Math.random() * 99999) + 1000).toString()
    response = {
      sourceUrl : url,
      targetUrl : randomNum
    }
    MongoClient.connect(databaseUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err)
  } else {
    console.log('Connection established to', databaseUrl)
    db.collection("url").insert(response, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log('Inserted %d documents into the "urls" collection. The documents inserted with "_id" are:', result.length, result)
      }
    })
    db.close()
  }
})
res.render('result',{response: response,host:req.header('host')})
// res.json(response) //API ONLY
  }
})

app.get('/:targetUrl',function(req,res){
  var targetUrl = req.params.targetUrl
  MongoClient.connect(databaseUrl, function (err, db) {

  var cursor =  db.collection('url').find({targetUrl:targetUrl})
  cursor.each (function(err,doc){
    if (err){console.log(err);}
    else {
      if (doc != null )
      res.redirect(doc.sourceUrl);
    }
  })
  })
})

app.get('/',function(req,res){
res.sendFile(path.join(__dirname,'index.html'))

})

app.listen(port, function(){
  console.log('Server is listening to port %d', port);
})
