const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PowerSchema = new Schema({ 
	date: {
		type: Date, 
		default: Date.now
	},
	name: String,
	powerName: String,
	power: Number,
	url: String,
	victories: {
		type: Number,
		default: 0
	},
	defeats: {
		type: Number,
		default: 0
	}
});

const Power = mongoose.model('Power', PowerSchema);