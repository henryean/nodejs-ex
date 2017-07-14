

//var DatabaseController = require('./databaseController');

var Controller = {
	
   _database: null,
   setDatabase: function(db) { this._database = db; },
   
   incrementCount: function(req) {
	   if (this._database) {
		   var col = _database.collection('counts');
		   // Create a document with request IP and current time of request
		   col.insert({ip: req.ip, date: Date.now()});
	   }
   },
   
   getCount: function(callback) {
	   if (this._database) {
		   var col = this._database.collection('counts');
		   col.count(callback);
	   }
   },

   findQuestions: function(callback) {
	   
  //var mongodb = require('mongodb');
  
	   //var db = DatabaseController.getDb();
	   //db.collection('vragen').find().toArray(callback);
	   if (this._database) {
		   this._database.collection('vragen').find().toArray(callback);
	   }
   },
   
   addQuestion: function(quest) {
	   //DatabaseController.getDb().collection('vragen').insert(quest);
	   if (this._database) {
		   this._database.collection('vragen').insert(quest);
	   }
   }
};

module.exports = Controller;