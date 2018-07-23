'use strict';

const mongoose = require('mongoose');

require('./NPC');
require('./PC');
require('./Power');
require('./User');

module.exports = {
  'PC': mongoose.model('PC'),
  'NPC': mongoose.model('NPC'),
  'Power': mongoose.model('Power'),
  'User': mongoose.model('User'),
}