const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./config.json');

const client = new Discord.Client();

const queue = new Map();

const path = "C:/Users/Utente/Documenti/coccobot/urli/"

let rand = (Math.floor(Math.random() * 31)+1)+'.mp3';

///////////////////////////////////////////////////////////
//STATI DEL BOT
///////////////////////////////////////////////////////////
client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});
///////////////////////////////////////////////////////////
//controllo del corpo dei messaggi
///////////////////////////////////////////////////////////
client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}urlo`)) {
	 execute(message, serverQueue);
	 return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
	 skip(message, serverQueue);
	 return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
	 stop(message, serverQueue);
	 return;
	} else {
	 message.channel.send('Metti un comando valido, IDIOTA!')
	}

});

///////////////////////////////////////////////////////////
//Permessi e connessione al canale
///////////////////////////////////////////////////////////
async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('Devi essere nel canale per poter sentire cosa dico!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('Ho bisogno dei permessi di parlare e connettermi per sparare minchiate :( ');
	}

	//const songInfo = await path;

	const song = {
		title: rand,
		url: path+rand,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Devi essere nel canale per skippare');
	if (!serverQueue) return message.channel.send('Non ci sono canzoni da skippare!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Devi essere nel canale per stopparmi!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(song.url)
		.on('end', () => {
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
			console.log('HO FINITO DI GRIDARE!?!?! NON È POSSIBILE! FAMMI GRIDARE!!!!!!!!!!!');

			console.log(song.url)

		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	rand = (Math.floor(Math.random() * 31)+1)+'.mp3';
}

client.login(token);
