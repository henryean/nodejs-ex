var DatabaseController = require('./databaseController');

var Controller = {
	
   _database: null,
   setDatabase: function(db) { this._database = db; },

   findQuestions: function(callback) {
	   DatabaseController.getDb().collection('vragen').find().toArray(callback);
       //this._database.collection('vragen').find().toArray(callback);
   },
   
   addQuestion: function(quest) {
	   DatabaseController.getDb().collection('vragen').insert(quest);
	   //this._database.collection('vragen').insert(quest);
   }
};

module.exports = Controller;