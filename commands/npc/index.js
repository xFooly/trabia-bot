const globalConfig = require('../../config.js')

const mongoose =require('mongoose')
const NPC = mongoose.model('NPC');
const User = mongoose.model('User');

let __command = ''

const _randomNpcAll = function(msg, user) {
	NPC.find()
	.then(function(docs){
		if(docs) {
			const npc = docs[Math.floor(Math.random()*docs.length)]

			const reply =`${npc.url}\n**Nome**: ${npc.name}\n\n**Data di Nascita**: ${npc.birth}\n**Luogo di Nascita**: ${npc.birthplace}\n**Residenza**: ${npc.residence}\n**Professione**: ${npc.profession}\n\n**Descrizione**: ${npc.info}\n`
			console.log(npc.name)
			msg.reply(reply)
		} else {
			msg.reply('Non ho trovato nulla.')
		}
	})
	.catch(function(err) {
		console.log(err)
	})
}

const _forwardMessage = function(msg) {
	User.findOne({username: msg.author.username})
	.then(function(doc){
		if(doc) {
			doc.commands.npc.count += 1
			return doc.save()
		} else {
			const newUser = new User({ 
				username: msg.author.username,
				commands: {
					npc: {
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
			default:
				_randomNpcAll(msg, user)
				// msg.reply('Non conosco questo comando')
				break;
		}
	})
}

const _description = function() {
	return 'Beccati un npc random.'
}

module.exports = function(cmd) {
	__command = cmd
	
	return {
		forwardMessage: _forwardMessage,
		description: _description,
	}
}