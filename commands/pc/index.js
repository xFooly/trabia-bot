const globalConfig = require('../../config.js')

const seedRandom = require('seedrandom')
const mongoose =require('mongoose')
const PC = mongoose.model('PC');
const User = mongoose.model('User');

let __command = ''

const _randomPCAll = function(msg, user) {
	_findAny()
	.then(function(pc){
		if(pc) {
			const reply =`${pc.image_url}\n**Nome**: ${pc.firstname}\n**Cognome**: ${pc.lastname}\n**Sesso**: ${pc.gender}\n\n**Anni**: ${pc.age}\n**Data di Nascita**: ${pc.birth_date}\n**Luogo di Nascita**: ${pc.from}\n\n**Altezza**: ${pc.height}\n**Peso**: ${pc.weight}\n\n**Capelli**: ${pc.hair_color}\n**Occhi**: ${pc.eye_color}\n`
			msg.reply(reply)
		} else {
			msg.reply('Non ho trovato nulla.')
		}
	})
	.catch(function(err){
		console.log(err)
	})
}

const _findAny = function(firstname) {
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
			doc.commands.pc.count += 1
			return doc.save()
		} else {
			const newUser = new User({ 
				username: msg.author.username,
				commands: {
					pc: {
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
			case 'help':
				_help(msg, user)
				break;
			default:
				_randomPCAll(msg, user)
				break;
		}
	})
}

const _help = function(msg, user) {
	let reply = '\n\n'
	reply += `\`${globalConfig.prefix}${__command}\`: ricevi un pc random\n`
	msg.reply(reply)
}

const _description = function() {
	return 'Beccati un personaggio giocante random.'
}

module.exports = function(cmd) {
	__command = cmd
	
	return {
		forwardMessage: _forwardMessage,
		description: _description,
	}
}