const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NPCSchema = new Schema({ 
	affiliation: String,
	gender: String,
	url: String,
	name: String,
	info: String,
	birth: String,
	birthplace: String,
	residence: String,
	profession: String
});

const NPC = mongoose.model('NPC', NPCSchema);
