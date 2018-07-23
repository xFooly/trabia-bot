const globalConfig = require('../../config.js')
const commandConfig = require('./config.js')
const adverbs = require('./words/avverbi.js')
const request = require('request');

const mongoose =require('mongoose')
const Power = mongoose.model('Power');
const User = mongoose.model('User');

let __command = ''
let __client = undefined

const _getRandomPower = function() {
  return new Promise((resolve, reject) => {
	 request(commandConfig.url, { json: true }, (err, res, body) => {
	    if (err) { reject(undefined); }
      
      const url = res.request.href.toString()
      const splitUrl = url.split("/")
      const unrefinedName = splitUrl[splitUrl.length -1]
      const name = unrefinedName.replace(new RegExp("_","g"), " ")

      resolve({
        url: url,
        name: name
      })
	 });
  })
}

const _powerList = function(msg, user) {
  Power.find()
  	.then(function(docs){
		  let reply = "Eccoti la lista dei poteri: \n\n"
		  for(let i = 0; i < docs.length; i++) {
		    reply += `${docs[i].name}: ${docs[i].powerName}  **(${docs[i].victories} vittorie / ${docs[i].defeats} sconfitte)**\n`
		  }
		  msg.reply(reply)
  	})
}

const _getPower = function(msg, user) {
	Power.findOne({name: msg.author.username})
		.then(function(doc){
			if(doc) {
				msg.reply(`Hai già un potere: ${doc.powerName}`)
			} else {
				msg.reply('Vedo che non hai ancora un potere... lascia che te ne trovi uno')
		    const power = _getRandomPower()
		      .then(function(res){
		      	const newPower = new Power({ 
							name: msg.author.username,
							powerName: res.name,
							power: Math.floor(Math.random()*100)+1,
							url: res.url
						});

						return newPower.save()
		      }).then(function(doc){
		      	msg.channel.send(`Beccati questo potere: ${doc.name}`);
		        msg.channel.send(doc.url);
		      }).catch(function(res){
		        msg.channel.send("Ohibò! Mica te l'ho trovato.");
		      })
			}
		})
}

const _randomAdverb = function() {
	return adverbs[Math.floor(Math.random()*adverbs.length)]
}

const _fight = function(c1, c2) {
	const p1 = c1.power
	const p2 = c2.power

	const rand = Math.floor(Math.random()*(p1+p2))
	if(rand < p1) {
		return true
	} else {
		return false
	}
}

const _getOpponentName = function(msg) {
	let opponentName = msg.content.split(' ')[2]
	if(opponentName && opponentName.startsWith('<@') && opponentName.endsWith('>')){
		let id = opponentName.substring(2, opponentName.length -1)
		if(id.startsWith('!')){
			id = id.substring(1)
		}
		let opponentUsername = msg.guild.members.get(id).user.username
		return opponentUsername
	}

	return undefined
}

const _duelFight = function(msg, user, challenger, challengedDocs) {
	if(challengedDocs.length == 0) {
		msg.reply("Non c'è nessuno da sfidare...")
	} else {
		const challenged = challengedDocs[Math.floor(Math.random()*challengedDocs.length)]
		const result = _fight(challenger, challenged)

		let winner = ''
		if(result) {
			winner = challenger.name
			challenger.victories += 1
			challenged.defeats += 1
		} else {
			winner = challenged.name
			challenged.victories += 1
			challenger.defeats += 1
		}

		challenger.save()
		.then(function(err){
			return challenged.save()
		})
		.then(function(err){
			winner = winner.replace('`', '').replace('*', '')
			let c1Name = challenger.name.replace('`', '').replace('*', '')
			let c2Name = challenged.name.replace('`', '').replace('*', '')

			let reply = '\n### IL DUELLO HA INIZIO ###\n\n'
			reply += `\`${c1Name}\` sfida a duello \`${c2Name}\`.\n`
			reply += `\`${c1Name}\` colpisce **${_randomAdverb()}** usando **${challenger.powerName}**.\n`
			reply += `\`${c2Name}\` si difende **${_randomAdverb()}** usando **${challenged.powerName}**.\n\n`
			reply += `### Vince: \`${winner}\` ###`
			msg.reply(reply)
		})
	}
}

const _duel = function(msg, user) {
	Power.findOne({name: msg.author.username})
	.then(function(challenger){
		if(challenger) {
			const opponentName = _getOpponentName(msg)

			if(opponentName) {
				Power.find({name: opponentName})
				.then(_duelFight.bind(this, msg, user, challenger))
			} else {
				Power.find()
				.where('name').ne(msg.author.username)
				.then(_duelFight.bind(this, msg, user, challenger))
			}
		} else {
			msg.reply('Non hai nessun potere! Sei un debole.')
		}
	})
}

const _help = function(msg, user) {
	let reply = '\n\n'
	reply += `\`${globalConfig.prefix}${__command} me\`: ricevi un potere casuale se non l'hai ancora ricevuto.\n`
	reply += `\`${globalConfig.prefix}${__command} list\`: guarda la lista di poteri attualmente creata.\n`
	reply += `\`${globalConfig.prefix}${__command} duel\`: sfida casuale tra chi ha i super poteri.\n`
	reply += `\`${globalConfig.prefix}${__command} history\`: qualche dato interessante su di te.\n`

	msg.reply(reply)
}

const _history = function(msg, user) {
	let reply = '\n'
	reply += `Hai usato il comando power **${user.commands.power.count} volte**.\n`
	reply += `Hai un totale di **${user.commands.power.victories} vittorie**.\n`
	reply += `Hai un totale di **${user.commands.power.defeats} sconfitte**.\n`
	reply += `Il potere che ti ha reso famoso è: **${user.commands.power.bestPower}** con una ratio di vittorie del **${(user.commands.power.bestPowerRatio.toFixed(2)*100)}%**.`

	msg.reply(reply)
}

const _forwardMessage = function(msg) {
	User.findOne({username: msg.author.username})
	.then(function(doc){
		if(doc) {
			doc.commands.power.count += 1
			return doc.save()
		} else {
			const newUser = new User({ 
				username: msg.author.username,
				commands: {
					power: {
						count: 1,
						victories: 0,
						defeats: 0,
						bestPower: '',
						bestPowerRatio: 0,
					}
				}
			});

			return newUser.save()
		}
	})
	.then(function(user) {
		const subCommand = (msg.content).split(" ")[1]

		switch(subCommand) {
			case 'me':
				_getPower(msg, user) 
				break;
			case 'list':
				_powerList(msg, user)
				break;
			case 'duel':
				_duel(msg, user)
				break;
			case 'history':
				_history(msg, user)
				break;
			case 'reset1234':
				_reset(msg)
				break;
			case 'help':
				_help(msg, user)
				break;
			default:
				msg.reply('Non conosco questo comando')
				break;
		}
	})
}



const _reset = function(msg) {
	Power.find()
		.then(function(docs){
			for(let i = 0; i < docs.length; i++) {
				User.findOne({username: docs[i].name}) 
				.then(function(doc) {
					if(!doc) {
						const newUser = new User({ 
							username: docs[i].name,
							commands: {
								power: {
									count: 0,
									victories: docs[i].victories,
									defeats: docs[i].defeats,
									bestPower: docs[i].powerName,
									bestPowerRatio: docs[i].victories / (docs[i].victories + docs[i].defeats),
								}
							}
						});

						return newUser.save()
					} else {
						doc.commands.power.victories += docs[i].victories
						doc.commands.power.defeats += docs[i].defeats
						let ratio = docs[i].victories / (docs[i].victories + docs[i].defeats)
						if(doc.commands.power.bestPowerRatio < ratio) {
							doc.commands.power.bestPower = docs[i].powerName
							doc.commands.power.bestPowerRatio = ratio
						}

						return doc.save()
					}
				})
			}
			msg.reply('Done.')
		})
}

const _description = function() {
	return 'Chi sarà il più potente di tutti? Scegli il tuo potere e combatti contro gli altri!	'
}

module.exports = function(cmd, client) {
	__command = cmd
	__client = client
	
	return {
		forwardMessage: _forwardMessage,
		description: _description,
	}
}