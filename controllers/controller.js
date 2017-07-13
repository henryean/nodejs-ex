var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan'),
	bodyParser = require('body-parser');

var DatabaseController = require('./databaseController');

var Controller = {
	
   _database: null,
   setDatabase: function(db) { this._database = db; },

   findQuestions: function(callback) {
	   
  var mongodb = require('mongodb');
  
	   var db = DatabaseController.getDb();
	   db.collection('vragen').find().toArray(callback);
       //this._database.collection('vragen').find().toArray(callback);
   },
   
   addQuestion: function(quest) {
	   DatabaseController.getDb().collection('vragen').insert(quest);
	   //this._database.collection('vragen').insert(quest);
   }
};

module.exports = Controller;