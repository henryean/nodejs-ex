var Controller = {
   _database: null,
   setDatabase: function(db) { this._database = db; },

   findQuestions: function(callback) {
       this._database.collection('vragen').find().toArray(callback);
   },
   
   addQuestion: function(quest) {
	   this._database.collection('vragen').insert(quest);
   }
};

module.exports = Controller;