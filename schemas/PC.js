const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PCSchema = new Schema({ 
	image_url: String,
	firstname: String,
	lastname: String,
	age: String,
	birth_date: String,
	gender: String,
	from: String,
	height: String,
	weight: String,
	eye_color: String,
	hair_color: String,
});

const PC = mongoose.model('PC', PCSchema);
