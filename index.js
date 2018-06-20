const Discord = require('discord.js')
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
const ytinfo = require('youtube-info');
const ytid = require('get-youtube-id');
const express = require('express');
const fs=require('fs');
const app = express();
const http = require('http');
//var data=fs.readFileSync('users.json', 'utf8');
var args = [];
var music = false;
var loop = true;
var file =[];
var volume = 0.5;
var channel = '';
let messageId = '';
var deleteChannel = ['coin-admin','commande-bot','suggestion-serveur-discord']

//Receive request
app.get("/", (request, response) => {
	var date = new Date();
	console.log(date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + " Ping Received");
	response.sendStatus(200);
});

//Check code update
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://hacker-bot.herokuapp.com`);
}, 28000);

//No use
bot.on('ready', function (ready) {
  
})

//Receive Message Event
bot.on('message', function(message) {
	args = message.content.split(' ');
	if(args[0].charAt(0) == '>'){
		args[0] = args[0].slice(1);
		switch(args[0]){
			case 'join':
				if(args[1] == undefined){
					message.member.voiceChannel.join()
						.then(function (connection) {
							message.channel.send('Connexion au salon **' + connection.channel.name +'**');
							channel = connection.channel.name;
						})
						.catch(console.error);
				} else {
					args.shift();
					channel = args.join(' ');
					let voiceChannel = message.guild.channels
						.filter(function (channel) { return  channel.type === 'voice'; })
						.filter(function (name) { return  name.name === channel; })
						.first();
					if(voiceChannel == undefined){
						message.channel.send('Salon invalide');
					} else{
					voiceChannel.join()
						.then(function (connection) {
						message.channel.send('Connexion au salon **' + connection.channel.name +'**');
						})
						.catch(console.error);
					}
				}
				break;
			case 'play':
				if(channel == ''){
					message.channel.send('Le bot n\'est pas connecté à un salon vocal, faite **>join [nom du salon]**');
				} else {
					if(args[1]){
						if(args[1].charAt(0) == 'h' && args[1].charAt(1) == 't' && args[1].charAt(2) == 't' && args[1].charAt(3)){
							var id = ytid(args[1]);
							ytinfo(id, function (err, videoInfo) {
								if (err) throw new Error(err);
								var info = { link: videoInfo.url, title: videoInfo.title, owner: videoInfo.owner, duration: videoInfo.duration, date: videoInfo.datePublished, thumbnail : videoInfo.thumbnailUrl};
								file.push(info);
								if(!music){
									start(file[0]);
								} else {
									message.channel.send("La musique a été ajouté à la file d'attente");
								}
							});
						} else {
							var options = {
								maxResults: 1,
								key: 'AIzaSyCMytiWESKX-N-LKaFEx6wjM5fZP1Lyx38'
							};
							args.shift();
							var words = args.join(' ');
							ytsearch(words, options, function(err, results) {
								if(err) return console.log(err);
								var videoInfo = results[0];
								var info = { link: videoInfo.link, title: videoInfo.title, owner: videoInfo.channelTitle, duration: 'Inconnue', date: videoInfo.publishedAt, thumbnail : videoInfo.thumbnails.medium.url};
								file.push(info);
								if(!music){
									start(file[0]);
								} else {
									message.channel.send("La musique a été ajouté à la file d'attente");
								}
							});
						}
					} else {
						message.channel.send("Le lien est manquant");
					}
				}
				break;
			case 'pause':
				if(music){
					bot.voiceConnections.first().dispatcher.pause();
					message.channel.send('⏸ Lecture en pause');
				} else {
					message.channel.send("Aucune lecture en cours");
				}
			case 'resume':
				if(music){
					bot.voiceConnections.first().dispatcher.resume();
					message.channel.send('▶ Reprise de la lecture en cours');
				} else {
					message.channel.send("Aucune lecture en cours");
				}
				break;
			case 'stop':
				if(music){
					bot.voiceConnections.first().dispatcher.end();
					message.channel.send('⏹ Arret de la lecture en cours');
				} else {
					message.channel.send("Aucune lecture en cours");
				}
				break;
			case 'disconnect':
				if(bot.voiceConnections.first() !== undefined){
					bot.voiceConnections.first().disconnect();
					message.channel.send('Deconnexion du salon vocal **' + channel + '**');
				} else {
					message.channel.send("Le bot n'est pas connecté à un serveur vocal");
				}
				break;
			case 'volume':
				volume = args[1];
				message.channel.send('Volume réglé sur **' + args[1] + '**');
				break;
			case 'loop':
				if(loop){
					loop = false;
					message.channel.send('🔄 Lecture en boucle desactivé');
				} else {
					loop = true;
					message.channel.send('🔄 Lecture en boucle activé');
				}
				break;
			case 'file':
				if(file !== undefined){
					var i = 1
					message.channel.send("**File d'attente**");
					console.log(file[i]);
					while (i < file.length){
						if(file[i] !== undefined){
							message.channel.send(new Discord.RichEmbed() 
								.setTitle('Position '+ i)
								.addField("Nom de la musique", file[i].title)
								.addField("Auteur", file[i].owner)
								.addField("Durée", file[i].duration)
								.addField("Date de publication", file[i].date)
								.setImage(file[i].thumbnail)
							)
							i++;
						} else {
							message.channel.send('Vide');
						}
					}
				} else {
					message.channel.send("Aucune musique est dans la file");
				}
				break;
			case 'next':
				if(file !== undefined){
					bot.voiceConnections.first().dispatcher.end();
					message.channel.send("Passage à la musique suivante");
				} else {
					message.channel.send("Aucune musique est dans la file");
				}
				break;
			case 'clear':
				if(file !== []){
					file.splice(0, file.length);
					message.channel.send("La file d'attente a été vidée")
				} else {
					message.channel.send("La file d'attente est déjà vide")
				}
				break;
			case 'delete':
				if(deleteChannel.find(function(element){ if (element == message.channel.name){ return true;} else { return false;}})){
					message.channel.bulkDelete(args[1])
						.then(deleted => message.channel.send('ℹ Des messages du salon **'+ message.channel.name +'** ont été supprimés, soit '+ deleted.size +' messages.'))
						.catch(console.error);
				} else {
					message.channel.send("Vous ne pouvez pas supprimer les messages de ce salon.");
				}
				break;
			case 'setlevel':
				if(args[1] !== undefined && Number(args[1]) > 0){
					if(message.member.roles.exists('name', 'Fondateur') || message.member.roles.exists('name', 'Technicien') || message.member.roles.exists('name', 'Administrateur')){
					}
					fs.readFile('users.json', function(err, data) {
						let users = JSON.parse(data);
						let boucle = true;
						let i = 0;
						while (boucle) {
							console.log(i)
							if(message.author.id == users[i].id){
								users[i].level = args[1]
								let username = message.author.username;
								message.member.setNickname(username+ ' (' + args[1] + ')')
								message.reply("Votre niveau a été mis à jour");
								boucle =false
							}
							else if (message.author.id != users[i].id && i == users.length - 1) {
								users.push({ name: message.author.username, id: message.author.id, level: args[1]}); 
								message.reply("Votre niveau a bien été sauvagardé.");
								let username = message.author.username;
								message.member.setNickname(username + ' (' + args[1] + ')');
								boucle = false;
							}
							i++;
						}
						fs.writeFile('users.json', JSON.stringify(users));  
					});
				} else {
					message.channel.send("Préciser un niveau correct.");
				}
				break;
			case 'level':
				var i = 0
				var embed = new Discord.RichEmbed().setTitle('Liste du niveau des joueurs :');
				fs.readFile('users.json', function(err, data) {
					var users = JSON.parse(data);
					console.log(users.level)
					while (i < users.length){
						var member = bot.users.filter(function (client){ return client.id === users[i].id }).first();
						embed.addField(users[i].name, 'Niveau : ' + users[i].level);
						i++;
					}
					message.channel.send(embed);
				})
				break;
			case 'help':
				message.channel.sendEmbed(new Discord.RichEmbed()
					.setTitle("Commandes level")
					.addField(">level", "Affiche la liste des niveau des joueurs qui ont souhaité définir leur niveau")
					.addField(">setlevel", "Defini votre niveau et si il est déjà défini il sera mis à jour. Votre niveau est alors enregistré dans un fichier et il apparait dans votre pseudo.")
					.setColor('GREEN')
				);
				message.channel.sendEmbed(new Discord.RichEmbed()
					.setTitle("Commandes musique")
					.addField(">join [VoiceChannel]", "Le bot rejoins le salon vocal dans lequel vous êtes si aucun nom de salon vocal n'est précisé, sinon il rejoins le salon que vous avez saisi.")
					.addField(">play [Url, Mots clés]", "Le bot vas jouer dans le salon vocal dans lequel il se trouve,  la musique du lien **Youtube** ou les mots clés saisis")
					.addField(">pause", "Mise en pause de la lecture de la musique en cours")
					.addField(">resume", "Reprend la lecture de la musique mise en pause.")
					.addField(">disconnect", "Le bot vas quitter le salon vocal dans lequel il se trouve.")
					.addField(">stop", "Arrete la musique en cours de lecture.")
					.addField(">file", "Affiche les musiques en file d'attente.")
					.addField(">next", "Passe a la prochaine musique de la file d'attente.")
					.setColor('GREEN')
				);
				message.channel.sendEmbed(new Discord.RichEmbed()
					.setTitle("Commandes Hackbot")
					.addField(">Emojie (Pas encore dispo)","Le bot vous affichera tous les emojies realiser pour le serveur Discord")
					.setColor('GREEN')
				);
				message.channel.send("HackBot est une création de Louwix pour le Discord Hackers. 2018.")   
				break;
		}
	}
})

//Connection to Discord
bot.login(process.env.TOKEN)

//Launch music on channel
function start (url){
	const stream = ytdl(url.link, { filter : 'audioonly' });
	const streamOptions = { volume: volume, bitrate: 10000 };
	stream.on('error', function(){
		message.channel.send('Lien invalide');
		bot.voiceConnections.first().disconnect();
	})
	music = true;
	message.channel.send(new Discord.RichEmbed() 
		.setTitle('Lecture en cours ▶')
		.addField("Nom de la musique", url.title)
		.addField("Auteur", url.owner)
		.addField("Durée", url.duration)
		.addField("Date de publication", url.date)
		.setImage(url.thumbnail)
	)
        .then(function (messageStart){
			messageStart.react('▶');
			messageStart.react('⏸');
			messageStart.react('🔄');
			messageStart.react('⏹');
			messageId = messageStart.id; 
		})
	const dispatcher = bot.voiceConnections.first().playStream(stream, streamOptions).on('end', function(){
		music = false;
		if(loop){ 
			start(file[0]);
		} else {
			if(file[1] !== undefined){
				file.shift();
				start(file[0]); 
			} else {
				file.shift();
			}
		}
	});
}
