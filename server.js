//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan')
	bodyParser = require('body-parser');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

var router = express.Router();
var parseUrlencoded = bodyParser.urlencoded({ extended: false});

var Controller = require('./controllers/controller');

router
.route('/')
  .get(function (req, res) {
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      var col = db.collection('counts');
      // Create a document with request IP and current time of request
      col.insert({ip: req.ip, date: Date.now()});
	  var questionsList;
	  //Controller.setDatabase(db);
	  //db.collection('vragen').find().toArray(function(err, questions ){
	  Controller.findQuestions(function(err, questions ){
		questionsList = questions;
	  });
	  col.count(function(err, count){
		res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails, questionsList: questionsList });
	  });
    } else {
	  res.render('index.html', { pageCountMessage : null});
    }
  })
  .post(parseUrlencoded, function (req, res) {
    if (!db) {
      initDb(function(err){});
    }
	var newQuest = req.body;
	if (newQuest && newQuest.question.length>4) {
	  var quest = new Object();
	  quest.question = newQuest.question;
	  quest.answer1 = newQuest.answer1;
	  quest.answer2 = newQuest.answer2;
	  quest.answer3 = newQuest.answer3;
	  quest.count1 = 0;
	  quest.count2 = 0;
	  quest.count3 = 0;
      if (db) {
	    //Controller.setDatabase(db);
		Controller.addQuestion(quest);
        //var questions = db.collection('vragen');
	    //questions.insert(quest);
	    res.status(201).json(quest);
      }
	} else {
		res.status(400).json('Invalid Question');
	}
  });
  
var ObjectId = require('mongodb').ObjectId;
  
router.route('/:question')
  .get(function (req, res) {
    var quest = req.params.question;
    if(quest){
      if (db) {
        var questions = db.collection('vragen');
		questions.findOne({"_id" : new ObjectId(quest)}, function(err, doc) {
          //res.status(201).json(doc);
		  res.render('answer.html', { question: doc });
        });
	    
      }
    }else{
      res.status(404).json("Question not found");
    }
  })
  .post(parseUrlencoded, function (req, res) {
	var quest = req.params.question;
	var answer = req.body.answerCheck;
    if(quest && answer){
      if (db) {
        var questions = db.collection('vragen');
		if (answer === "count1") {
		questions.update(
		  {"_id" : new ObjectId(quest)},
		  {$inc : {count1: 1} },
		  function(err, writeResult) {
          //res.status(200).json(writeResult);
        });
		} else if (answer === "count2") {
		questions.update(
		  {"_id" : new ObjectId(quest)},
		  {$inc : {count2: 1} },
		  function(err, writeResult) {
          //res.status(200).json(writeResult);
        });
		} else if (answer === "count3") {
		questions.update(
		  {"_id" : new ObjectId(quest)},
		  {$inc : {count3: 1} },
		  function(err, writeResult) {
          //res.status(200).json(writeResult);
        });
		}
		res.redirect("/");
	  }
    }else{
      res.status(404).json("Question not found");;
    }
  })
  .delete(function (req, res) {
	var quest = req.params.question;
    if(quest){
      if (db) {
        var questions = db.collection('vragen');
		questions.remove({"_id" : new ObjectId(quest)}, function(err, writeResult) {
          res.status(200).json(writeResult);
        });
	  }
    }else{
      res.status(404).json("Question not found");;
    }
  });

app.get('/old/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
	var questionsList;
	db.collection('vragen').find().toArray(function(err, questions ){
      questionsList = questions;
    });
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails, questionsList: questionsList });
    });
	//col.count(function(err, count){
    //  res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails});
    //});
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/questions', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
	//db.collection('questions').drop(function(err, callback){});
	var questions = db.collection('vragen');
	//var quest = new Object();
	//quest.question = 'What is this?';
	//quest.answer1 = 'An answer';
	//quest.answer2 = 'Something else';
	//quest.answer3 = 'Who knows';
	//questions.insert(quest);
	//var quest2 = new Object();
	//quest2.question = 'How it going?';
	//quest2.answer1 = 'Something';
	//quest2.answer2 = 'good?';
	//quest2.answer3 = 'Meh';
	//questions.insert(quest2);
    questions.find().toArray(function(err, questionsList ){
      res.send(questionsList);
    });
	//questions.count(function(err, count ){
    //  res.send('{ questions: ' + count + '}');
    //});
  } else {
    res.send('{ questions: -1 }');
  }
});

app.post('/newQuestion', parseUrlencoded, function(req,res) {
	var newQuest = req.body;
	if (newQuest) {
	var quest = new Object();
	quest.question = newQuest.question;
	quest.answer1 = newQuest.answer1;
	quest.answer2 = newQuest.answer2;
	quest.answer3 = newQuest.answer3;
	if (!db) {
    initDb(function(err){});
  }
  if (db) {
	var questions = db.collection('vragen');
	questions.insert(quest);
	res.status(201).send(quest);
  }
	} else {
		res.status(201).send(req.body);
	}
});

app.use('/', router);

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
