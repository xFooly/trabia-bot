const globalConfig = require('../../config.js')

const mongoose =require('mongoose')
const PC = mongoose.model('PC');
const NPC = mongoose.model('NPC');
const User = mongoose.model('User');

let __command = ''

const _love = function(msg, user) {
	let pc1 = undefined
	let pc2 = undefined
	_findAny()
	.then(function(pc) {
		pc1 = pc
		return _findAny()
	})
	.then(function(pc) {
		pc2 = pc

		if(pc1.firstname != pc2.firstname){
			_loveAffinity(msg, user, pc1, pc2)
		} else {
			_love(msg, user)
		}
	})
	.catch(function(err){
		console.log(err)
	})
}

const _heteroLove = function(msg, user) {
	let guy = undefined
	let girl = undefined
	_findGender('Maschio')
	.then(function(guyPC){
		guy = guyPC
		return _findGender('Femmina')
	})
	.then(function(girlPC){
		girl = girlPC

		_loveAffinity(msg, user, guy, girl)
	})
	.catch(function(err){
		console.log(err)
	})
}

const _lesboLove = function(msg, user) {
	let pc1 = undefined
	let pc2 = undefined
	_findGender('Femmina')
	.then(function(pc) {
		pc1 = pc
		return _findGender('Femmina')
	})
	.then(function(pc) {
		pc2 = pc

		if(pc1.firstname != pc2.firstname){
			_loveAffinity(msg, user, pc1, pc2)
		} else {
			_love(msg, user)
		}
	})
	.catch(function(err){
		console.log(err)
	})
}

const _homoLove = function(msg, user) {
	let pc1 = undefined
	let pc2 = undefined
	_findGender('Maschio')
	.then(function(pc) {
		pc1 = pc
		return _findGender('Maschio')
	})
	.then(function(pc) {
		pc2 = pc

		if(pc1.firstname != pc2.firstname){
			_loveAffinity(msg, user, pc1, pc2)
		} else {
			_love(msg, user)
		}
	})
	.catch(function(err){
		console.log(err)
	})
}

const _findLove = function(msg, user) {
	let name1 = (msg.content).split(" ")[2]
	let name2 = (msg.content).split(" ")[3]

	let pc1 = undefined
	let pc2 = undefined

	_findPCorNPC(name1)
	.then(function(doc){
		pc1 = doc
		return _findPCorNPC(name2)
	})
	.then(function(doc){
		pc2 = doc
		_loveAffinity(msg, user, pc1, pc2)
	})
}

const _findPCorNPC = function(name) {
	return new Promise((resolve, reject) => {
		PC.findOne({firstname: {"$regex": ''+name, "$options": "i" }})
		.then(function(doc) {
			if(doc) {
				resolve(doc)
			} else {
				return NPC.findOne({name: {"$regex": ''+name, "$options": "i" }})
			}
		})
		.then(resolve)
	})
}

const _loveAffinity = function(msg, user, pc1, pc2) {
	if(pc1 && pc2) {
		let name1 = (pc1.firstname) ? `${pc1.firstname} ${pc1.lastname}` : `${pc1.name}`
		let name2 = (pc2.firstname) ? `${pc2.firstname} ${pc2.lastname}` : `${pc2.name}`

		let seed = 0
		const d = new Date()
		seed += d.getDay() + d.getMonth() + d.getYear()
		seed += _wordToValue(name1)
		seed += _wordToValue(name2)

		//seed the random number generator
		Math.seedrandom(seed);
		let love = (Math.floor(Math.random() * 11) -5 )

		let reply =`\nAffinità erotica __di oggi__ di: \n **${name1}** + **${name2}** \n =  `
		
		let symbol = (love < 0) ? ':broken_heart:'  : ':heart:'
		love = Math.abs(love)
		if(love != 0) {
			for(let i = 0; i < love; i++) {
				reply += symbol
			}
		} else {
			reply += ':neutral_face:'
		}

		msg.reply(reply)
	} else {
		msg.reply('Non ho trovato nulla.')
	}
}

const _wordToValue = function(word) {
	let sum = 0
	for(let i = 0; i < word.length; i++) {
		sum += word[i].charCodeAt()
	}
	return sum
}

const _findGender = function(gender) {
	return new Promise((resolve, reject) => {
		PC.countDocuments({gender: gender})
		.then(function(count) {
			 const random = Math.floor(Math.random() * count)
			 PC.findOne({gender: gender})
		 	.skip(random)
		 	.then(resolve)
		})
		.catch(reject)
	})
}

const _findAny = function() {
	return new Promise((resolve, reject) => {
		PC.countDocuments()
		.then(function(count) {
			 const random = Math.floor(Math.random() * count)
			 PC.findOne()
		 	.skip(random)
		 	.then(resolve)
		})
		.catch(reject)
	})
}

const _forwardMessage = function(msg) {
	User.findOne({username: msg.author.username})
	.then(function(doc){
		if(doc) {
			doc.commands.love.count += 1
			return doc.save()
		} else {
			const newUser = new User({ 
				username: msg.author.username,
				commands: {
					love: {
						count: 1
					}
				}
			});

			return newUser.save()
		}
	})
	.then(function(user) {
		const subCommand = (msg.content).split(" ")[1]

		switch(subCommand) {
			case 'find':
				_findLove(msg, user)
				break;
			case 'hetero':
				_heteroLove(msg, user)
				break;
			case 'homo':
				_homoLove(msg, user)
				break;
			case 'lesbo':
				_lesboLove(msg, user)
				break;
			case 'help':
				_help(msg, user)
				break;
			default:
				_love(msg, user)
				break;
		}
	})
}

const _description = function() {
	return 'Accoppiamenti matti'
}

const _help = function(msg, user) {
	let reply = '\n\n'

	reply += `\`${globalConfig.prefix}${__command}\`: accoppia due pc a caso.\n`
	reply += `\`${globalConfig.prefix}${__command} hetero\`: accoppia un maschio e una femmina a caso.\n`
	reply += `\`${globalConfig.prefix}${__command} homo\`: accoppia due maschi a caso.\n`
	reply += `\`${globalConfig.prefix}${__command} lesbo\`: accoppia due donne a caso.\n`
	reply += `\`${globalConfig.prefix}${__command} find XXX YYY\`: accoppia i due pc che tanto ami\n`


	msg.reply(reply)
}


module.exports = function(cmd) {
	__command = cmd
	
	return {
		forwardMessage: _forwardMessage,
		description: _description,
	}
}