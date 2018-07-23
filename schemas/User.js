const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ 
	username: String,
	avatar: String,
	commands: {
		power: {
			count: {
				type: Number,
				default: 0
			},
			victories: {
				type: Number,
				default: 0
			},
			defeats: {
				type: Number,
				default: 0
			},
			bestPower: String,
			bestPowerRatio: Number,
		},
		npc: {
			count: {
				type: Number,
				default: 0
			}
		},
		pc: {
			count: {
				type: Number,
				default: 0
			}
		},
		love: {
			count: {
				type: Number,
				default: 0
			}
		}
	}
});

const User = mongoose.model('User', UserSchema);