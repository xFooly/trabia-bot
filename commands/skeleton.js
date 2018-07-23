const globalConfig = require('../../config.js')

const mongoose =require('mongoose')

let __command = ''

const _forwardMessage = function(msg) {
	User.findOne({username: msg.author.username})
	.then(function(doc){
		if(doc) {
			//doc.commands.
			return doc.save()
		} else {
			const newUser = new User({ 
				username: msg.author.username,
				commands: {
					//
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
				break;
		}
	})
}

const _description = function() {
	return ''
}

const _help = function(msg, user) {
	let reply = '\n\n'

	// reply += `\`${globalConfig.prefix}${__command}\`:\n`

	msg.reply(reply)
}


module.exports = function(cmd) {
	__command = cmd
	
	return {
		forwardMessage: _forwardMessage,
		description: _description,
	}
}