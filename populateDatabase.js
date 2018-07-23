const npcs = require('./assets/databaseNPC.js')
const pcs = require('./assets/databasePC.js')
const request = require('request');

const mongoose =require('mongoose')
mongoose.connect('mongodb://localhost:27017/trabia', { useNewUrlParser: true });

require('./schemas');
const NPC = mongoose.model('NPC');
const PC = mongoose.model('PC');

const savePromises = []

console.log(`NPC count: ${npcs.length}`)
for(let i = 0; i < npcs.length; i++) {
	let npc = npcs[i]

	let NPCObject = new NPC({
		affiliation: npc.affiliation,
		gender: npc.gender,
		url: npc.url,
		name: npc.name,
		info: npc.info,
		birth: npc.birth,
		birthplace: npc.birthplace,
		residence: npc.residence,
		profession: npc.profession
	})

	savePromises.push(NPCObject.save())
}


console.log(`PC count: ${pcs.length}`)
for(let i = 0; i < pcs.length; i++) {
	let pc = pcs[i]

	let PCObject = new PC({
		image_url: pc.image_url,
		firstname: pc.firstname,
		lastname: pc.lastname,
		age: pc.age,
		birth_date: pc.birth_date,
		gender: pc.gender,
		from: pc.from,
		height: pc.height,
		weight: pc.weight,
		eye_color: pc.eye_color,
		hair_color: pc.hair_color,
	})

	savePromises.push(PCObject.save())
}

Promise.all(savePromises)
// .then(function(promises){
	// promises.map(function(p){
	// 	let name = p.name ? p.name : `${p.firstname} ${p.lastname}` 
	// 	console.log(`Saved: ${name}`)
	// })
// })
.then(function(){
	console.log('Database populated')
	process.exit()
})
.catch(function(e){
	console.log(e)
})