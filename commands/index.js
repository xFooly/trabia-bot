'use strict';

const debug = require("debug")('bot-commands')
const fs = require('fs');
const path = require('path')

const dirEntries = fs.readdirSync(__dirname);
const routers = {};

module.exports = function(client){
  try{
    dirEntries.forEach(function(dirEntry){
      const dirPath = path.join(__dirname, dirEntry)
      const stats = fs.statSync(dirPath);
      if(stats.isDirectory()){
        try{
          const router = require(dirPath);
          //add router to our list of routers;
          routers[dirEntry] = router(dirEntry, client);
          debug('Loaded ' + dirEntry)
        }catch(err){
          debug('Could not get application for ' + dirEntry);
          debug(err.toString() + err.stack);
        }
      }
    });
  }catch(err){
    debug('Error while loading routers');
    debug(err.stack);
  }finally{
    return routers;
  }
}