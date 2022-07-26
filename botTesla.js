////////////////////////////////////////
// Başka github hesabına yükləməy olmaz


require("dotenv").config();

const { Telegraf, Telegram } = require("telegraf")

const TOKEN = process.env.TOKEN || '';

const ID_BOT = process.env.ID_BOT || '';


const config = require("./config")
const db = require("./veritabani/db")
const fs = require("fs")
const {randomResim, Degisken, ArtiEksi, HusnuEhedov, kullaniciProfil} = require("./eklenti")
const telegram = new Telegram(process.env.TOKEN)
const bot = new Telegraf(process.env.TOKEN)
const path = require("path")
const dbfile = path.resolve(__dirname, "./veritabani/db.json")


let oyunDurumuHusnuEhedov = {}

/// /// /// /// /// /// ///  <!-- VERİTABANI SUPERGROUP(-100) İD ÇEKME --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 

bot.command("txt", async (ctx) => {
    fs.readFile(dbfile, 'utf8', async function(err, doc) {
        var comments = doc.match(/-\d+/g);
        var comments = doc.match(/-100\d+/g);
        if (comments && comments.length > 0) {
            const arr = [];
            for (let i in comments) {
                ctx.telegram.getChat(comments[i]).then(async function (result) {
                    const Usercount = await ctx.telegram.getChatMembersCount(result.id)
                    const text = JSON.stringify(`${result.title} | ${result.id} | UserSayı: ${Usercount}`).replace(/"/g, '')
                    arr.push(text);
                    const stream = fs.createWriteStream('./gruplar.txt');
                    stream.write(arr.join('\n'))
                })
            }
            await bot.telegram.sendDocument(ctx.chat.id, {
                source: './gruplar.txt'
            }, {
                filename: 'gruplar.txt',
                caption: `<b>Grup Döküman:  ${comments.length}</b>`,
                parse_mode: 'HTML'
            })
        } else {
            ctx.reply('Oyun hələ botda oynanmayıb.🥲')
        }
    })
});

bot.command("grupsayi", async (ctx) => {
    fs.readFile(dbfile, 'utf8', async function(err, doc) {
        var comments = doc.match(/-100\d+/g);
        if (comments && comments.length > 0) {
            await ctx.replyWithHTML(`<i>Grup sayısı:  ${comments.length}</i>`)
        } else {
            ctx.reply('Oyun hələ botda oynamayıb.🥲')
        }
    })
});


/// /// /// /// /// /// ///  <!-- CONST SABİT TANIMLANANLAR --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 

const OyunYaratHusnuEhedov = chatId => {
	oyunDurumuHusnuEhedov[chatId] = {
		timeouts: {},
		guessMessage: null,
		currentRound: null,
		currentTime: 0, 
		answersOrder: []
	}
	return oyunDurumuHusnuEhedov[chatId]
}

const ozelMesaj = isGroup => Degisken(`
    🤖Salam Mənim adım [K.M Səkil Oyun Botu](http://t.me/KMSekilOyunBot), \nŞəkillərin yaşları təxmin edərək əyləncə vaxd keçirmək üçün yaradılmış şəkil təxmin bot.\n\n🤖Ətrafli Məlumat üçün /help əmrinə toxunun.
`)


const YasOyunBaslat = () => {  // OYUN RESİM ALMASI GEREK DOSYA KONUM 
	let imagePath = "./resimler"
	let fimeName = randomResim(fs.readdirSync(imagePath))
	let age = Number(fimeName.match(/^(\d+)/)[1])
	return {
		age: age,
		photo: `${imagePath}/${fimeName}`
	}
}
const NesneYenileHusnuEhedov = (obj, f) => {
	let index = 0
	for (let key in obj) {
		f(key, obj[key], index)
		index++
	}
}
const dbChatAlHusnuEhedov = chatId => {  // CHAT ID ALMASI
	let data = {
		isPlaying: true,
		members: {}
	}
	db.insert(chatId, data)
}
const dbUserAlHusnuEhedov = firstName => {  // KULLANICI ADI, PUAN ALMASI
	return {
		firstName: firstName,
		isPlaying: true,
		answer: null,
		gameScore: 0,
		totalScore: 0
	}
}
const getChat = chatId => {
	return db.get(chatId)
}
const OyunDurdurHusnuEhedov = (ctx, chatId) => {
	let chat = getChat(chatId)
	if (chat && chat.isPlaying) {
		if (oyunDurumuHusnuEhedov[chatId] && oyunDurumuHusnuEhedov[chatId].timeouts) {
			for (let key in oyunDurumuHusnuEhedov[chatId].timeouts) {
				clearTimeout(oyunDurumuHusnuEhedov[chatId].timeouts[key])
			}
		}
		chat.isPlaying = false
		let top = []
		NesneYenileHusnuEhedov(chat.members, (memberId, member, memberIndex) => {
			if (member.isPlaying) {
				top.push({
					firstName: member.firstName,
					score: member.gameScore
				})

				Object.assign(member, {
					answer: null,
					isPlaying: false,
					gameScore: 0
				})
			}
		})
		db.update(chatId, ch => chat)
		if (top.length > 0) {
			ctx.replyWithMarkdown(Degisken(`
				*🏆Qalib Olanlar Listəsi:⤵️*

				${top.sort((a, b) => b.score - a.score).map((member, index) => `${["🥇","🥈","🥉"][index] || "⚡️"} ${index + 1}. *${member.firstName}*: ${member.score} ${HusnuEhedov(member.score, "Çikolata🍫", "Çikolata🍫", "Çikolata🍫")}`).join("\n")}
			`))
		}
	}
	else {
		ctx.reply("ℹ️Oyun başlamadı,Dəyandı... 🙅🏻\nOyuna başlamaq üçün ➡️  /game ")
	}
}
const RaundMesajHusnuEhedov = (chatId, round, time) => {
	let chat = getChat(chatId)
	let answers = []
	NesneYenileHusnuEhedov(chat.members, (memberId, member, memberIndex) => {
		if (member.isPlaying && member.answer !== null) {
			answers.push({
				answer: member.answer,
				firstName: member.firstName,
				memberId: Number(memberId)
			})
		}
	})
	answers = answers.sort((a, b) => oyunDurumuHusnuEhedov[chatId].answersOrder.indexOf(a.memberId) - oyunDurumuHusnuEhedov[chatId].answersOrder.indexOf(b.memberId))

	return Degisken(`
		*🆚➪ Raund ${round + 1}/${process.env.RAUND_SAYI}*
		❔ Sizcə bu adam neçə yaşındadır.
		${answers.length > 0 ? 
			`\n${answers.map((member, index) => `${index + 1}. *${member.firstName}*: ${member.answer}`).join("\n")}\n`
			:
			""
		}
		${"⚡️".repeat(time)}${"✨".repeat(config.emojiSaniye - time)}
	`)
}
const OyunHusnuEhedov = (ctx, chatId) => {
	let gameState = OyunYaratHusnuEhedov(chatId)
	let startRound = async round => {
		let person = YasOyunBaslat()
		let rightAnswer = person.age
		let guessMessage = await ctx.replyWithPhoto({
			source: person.photo,
		}, {
			caption: RaundMesajHusnuEhedov(chatId, round, 0),
			parse_mode: "Markdown"
		})
		gameState.currentTime = 0
		gameState.guessMessageId = guessMessage.message_id
		gameState.currentRound = round

		let time = 1
		gameState.timeouts.timer = setInterval(() => {
			gameState.currentTime = time
			telegram.editMessageCaption(
				ctx.chat.id,
				guessMessage.message_id,
				null,
				RaundMesajHusnuEhedov(chatId, round, time),
				{
					parse_mode: "Markdown"
				}
			)
			time++
			if (time >= (config.emojiSaniye + 1)) clearInterval(gameState.timeouts.timer)
		}, process.env.SANIYE / (config.emojiSaniye + 1))
		
		gameState.timeouts.round = setTimeout(() => {
			let chat = getChat(chatId)
			let top = []
			NesneYenileHusnuEhedov(chat.members, (memberId, member, memberIndex) => {
				if (member.isPlaying) {
					let addScore = member.answer === null ? 0 : rightAnswer - Math.abs(rightAnswer - member.answer)
					chat.members[memberId].gameScore += addScore
					chat.members[memberId].totalScore += addScore
					top.push({
						firstName: member.firstName,
						addScore: addScore,
						answer: member.answer
					})
					member.answer = null
					db.update(chatId, ch => chat)
				}
			})
			db.update(chatId, ch => chat)
			
			if (!top.every(member => member.answer === null)) {
				ctx.replyWithMarkdown(
					Degisken(`
						🎨➪ Fotodakı şəxs: *${rightAnswer} ${HusnuEhedov(rightAnswer, "yaşında", "yaşında", "yaşında")}*\n*🎯➪ Çikolata Qazananlar:⤵️*

						${top.sort((a, b) => b.addScore - a.addScore).map((member, index) => `${["🥇","🥈","🥉"][index] || "⚡️"} ${index + 1}. *${member.firstName}*: ${ArtiEksi(member.addScore)}`).join("\n")}
					`),
					{
						reply_to_message_id: guessMessage.message_id,
					}
				)
			}
			else {
				ctx.reply("Cavab yoxdur?,Oyun dayandırıldı❕")
				OyunDurdurHusnuEhedov(ctx, chatId)
				return
			}

			if (round === process.env.RAUND_SAYI - 1) {
				gameState.timeouts.OyunDurdurHusnuEhedov = setTimeout(() => {
					OyunDurdurHusnuEhedov(ctx, chatId)
				}, 1000)
			}
			else {
				gameState.answersOrder = []
				gameState.timeouts.afterRound = setTimeout(() => {
					startRound(++round)
				}, 2500)
			}
		}, process.env.SANIYE)
	}
	gameState.timeouts.beforeGame = setTimeout(() => {
		startRound(0)
	}, 1000)
}
/// /// /// /// /// /// ///  <!-- CONST SABİT TANIMLANANLAR SON--> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 





bot.command("game", (ctx) => {
	let message = ctx.update.message
	if (message.chat.id < 0) {
		let chatId = message.chat.id
		let chat = getChat(chatId)
		if (chat) {
			if (chat.isPlaying) {
				return ctx.reply("ℹ️ Oyun indi aktivdir!,onu dayandırmaq üçün➡️ /stop istifadə edin.")
			}
			else {
				chat.isPlaying = true
				for (let key in chat.members) {
					let member = chat.members[key]
					member.gameScore = 0
				}
				db.update(chatId, ch => chat)
			}
		}
		else {
			dbChatAlHusnuEhedov(chatId)
		}
		ctx.replyWithHTML(`<b><a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a> Tərəfindən,\n\nℹ️ K.M Şəkil Oyun Botu başladı.🎉</b>`)
		OyunHusnuEhedov(ctx, chatId)
	}
	else {
		ctx.reply("ℹ️ Bu əmr qruplar üçün etibarlıdır.!")
	}
})



bot.command("stop", (ctx) => {
    let message = ctx.update.message
    if (message.chat.id < 0) {
        let chatId = message.chat.id
        OyunDurdurHusnuEhedov(ctx, chatId)
    }
    else {
        ctx.reply("ℹ️ Bu əmr qruplar üçün etibarlıdır.!")
    }
})


/// /// /// /// /// /// ///  <!-- GRUB KULLANICI RATING --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 

bot.command("gbal", (ctx) => {
	let message = ctx.update.message
	if (message.chat.id < 0) {
		let chatId = message.chat.id
		let chat = getChat(chatId)
		if (chat) {
			let top = []
			NesneYenileHusnuEhedov(chat.members, (memberId, member, memberIndex) => {
				top.push({
					firstName: member.firstName,
					score: member.totalScore
				})

				Object.assign(member, {
					answer: null,
					isPlaying: false,
					gameScore: 0
				})
			})
			if (top.length > 0) {
				ctx.replyWithMarkdown(Degisken(`
*🏆 Qrupun ən yaxşı 20 oyunçusu:⤵️*

${top.sort((a, b) => b.score - a.score).slice(0, 20).map((member, index) => `${["","",""][index] || ""} ${index + 1}) *${member.firstName}*: ${member.score} ${HusnuEhedov(member.score, "Çikolata🍫", "Çikolata🍫", "Çikolata🍫")}`).join("\n")}
				`))
			}
			else {
				ctx.reply("ℹ️ Bu qrupda heç bir oyun oynamamısınız.! ")
			}
		}
		else {
			ctx.reply("ℹ️ Bu əmr qruplar üçün etibarlıdır.!")
		}
	}
	else {
		ctx.reply("ℹ️ Bu əmr qruplar üçün etibarlıdır.!")
	}
})
/// /// /// /// /// /// ///  <!-- GRUB KULLANICI RATING SON --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 





/// /// /// /// /// /// ///  <!-- GLOBAL KULLANICI RATING --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 
bot.command("global", (ctx) => {
    fs.readFile(dbfile, 'utf8', async function(err, doc) {
        var comments = doc.match(/-100\d+/g)
        let top = []
        if (comments && comments.length > 0) {
            for (let i in comments) {
                let chatId = comments[i]
                let chat = getChat(chatId)
                NesneYenileHusnuEhedov(chat.members, (memberId, member, memberIndex) => {
                    top.push({
                        firstName: member.firstName,
                        score: member.totalScore
                    })

                    Object.assign(member, {
                        answer: null,
                        isPlaying: true,
                        gameScore: 0
                    })
                })
            }
            if (top.length > 0) {
                ctx.replyWithHTML(Degisken(`
     <b>🏆Qruplar Üzre En İyi Top-20</b>\n
${(top).sort((a, b) => b.score - a.score).slice(0, 20).map((member, index) => `${["1⃣✰","2⃣✰","3⃣✰","4⃣✰","5⃣✰","6⃣✰","7⃣✰","8⃣✰","9⃣✰","🔟✰","1⃣1⃣✰","1⃣2⃣✰","1⃣3⃣✰","1⃣4⃣✰","1⃣5⃣✰","1⃣6⃣✰","1⃣7⃣✰","1⃣8⃣✰","1⃣9⃣✰","2⃣0⃣✰"][index] || "🎮"} ${index + 1}) <b><i>${member.firstName} → ${member.score} ${HusnuEhedov(member.score, "Çikolata🍫", "Çikolata🍫", "Çikolata🍫")}</i></b>`).join("\n")}
                `))
            }
        }
    })
})
/// /// /// /// /// /// ///  <!-- GLOBAL KULLANICI RATING SON --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 



bot.command("help", (ctx) => {
    return ctx.replyWithMarkdown(Degisken(`
        🤖[K.M Sekil Oyun Botunun](http://t.me/KMSekilOyunBot) Kömək Əmrlər Bunlardır.⤵️\n\nℹ️Qayda budur: Mən sizə şəkillər göndərirəm və siz kateqoriyaya uyğun rəqəmlərlə təxmin etməlisiniz.\nİlk olaraq qrupa əlavə edin və qrupda media izinizin olmasını unutmayın! və ya botu administrator edin.\nSonra Commands ilə oyuna başlayın.\n\n📚Əmrlərin siyahısı⤵️\n🌆 /game - Oyuna başlayın\n📛 /stop - oyunu dayandırın \n📊 /gbal - Oyunçuların xallarını göstərir. \n🌍 /global - Qlobal Ballar. \nℹ️ /help - Müəlumat üçün. \n👤 /info - İstifadəçi haqqında məlumat. \n🆔 /id - Qrup idsi haqqında məlumat.`))
})

bot.command("info", async (ctx) => {
    const Id = ctx.message.reply_to_message ? ctx.message.reply_to_message.from.id : ctx.message.from.id;
    const messageId = ctx.message.reply_to_message ? ctx.message.reply_to_message.message_id : null;
    const photoInfo = await ctx.telegram.getUserProfilePhotos(Id);
    const photoId = photoInfo.photos[0]?.[0]?.file_id;
    const getUserInfo = await ctx.telegram.getChat(Id);
    const getUser = [getUserInfo].map(kullaniciProfil).join(', ')
    if (photoId) {
        return ctx.replyWithPhoto(photoId, { caption: getUser, parse_mode: 'HTML', reply_to_message_id: messageId  })
    } else {
        return ctx.replyWithHTML(getUser,  { reply_to_message_id: messageId })
    }
});

bot.command('id', async (ctx, next) => {
	if (ctx.chat.type !== "supergroup") return null;
    const chatBio = ctx.chat.description
    await ctx.telegram.sendMessage(ctx.chat.id, `<b>Grup</b>\n🆔:<code>${ctx.chat.id}</code>\nİsim: <code>${ctx.chat.title}</code>`, { parse_mode: 'HTML' }) 
    return next();
});



/// /// /// /// /// /// ///  <!-- BOT START MENÜ --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// ///

bot.start(async (ctx) => {
    await ctx.replyWithMarkdown(ozelMesaj(ctx.update.message.chat.id < 0),{
        reply_markup:{
            inline_keyboard:[
                [{text:'➕ Botu Qrupa əlavə edin ➕', url:`https://t.me/${process.env.BOT_ISMI}?startgroup=true`}],
                [{text:'Rəsmi Kanalımız 📺', url:`https://t.me/kohne_mekan_kanal`},{text:'Rəsmi Qrupumuz 📣', url:`https://t.me/kohne_mekan`}],
		     [{text:'♕︎K.M FAMİLY♕︎', callback_data:'vip'},{text:'K.M Bots 📺', url:`https://t.me/KMBots`}]
            ]
        }
    })
})

bot.action('start', ctx=>{
    ctx.deleteMessage()
    ctx.replyWithMarkdown(`🤖 Salam Mənim adım [K.M Səkil Oyun Botu](http://t.me/KMSekilOyunBot), Şəkillərin yaşları təxmin edərək əyləncə vaxd keçirmək üçün yaradılmış şəkil təxmin bot.\n\n🤖 Ətrafli Məlumat üçün /help əmrinə toxunun.
        `,{
        reply_markup:{
            inline_keyboard:[
                [{text:'➕ Botu Qrupa əlavə edin ➕', url:`https://t.me/${process.env.BOT_ISMI}?startgroup=true`}],
                [{text:'Rəsmi Kanalımız 📺', url:`https://t.me/kohne_mekan_kanal`},{text:'Rəsmi Qrupumuz 📣', url:`https://t.me/kohne_mekan`}],
		    [{text:'♕︎K.M FAMİLY♕︎', callback_data:'vip'},{text:'K.M Bots 📺', url:`https://t.me/KMBots`}]
            ]
        }
    })
})



bot.action('vip', ctx=>{
    ctx.deleteMessage()
    ctx.replyWithMarkdown(`*♕︎Köhnə Məkan Family♕︎*`,{
        reply_markup:{
            inline_keyboard:[
                [{text:'♕︎ Sahiblar', callback_data:'AZ'}],
                [{text:'📣 Qruplar', callback_data:'TR'}],
		[{text:'📺 Kanallar', callback_data:'UK'}],
                [{text:'🔙 Geri', callback_data:'start'}]
            ]
        }
    })
})

// AZƏRBAYCAN GRUP DÜYMƏLƏRİ
bot.action('AZ', ctx=>{
    ctx.deleteMessage()
    ctx.replyWithMarkdown(`*♕︎Bot Sahibləri♕︎*`,{
        reply_markup:{
            inline_keyboard:[
                [{text:'1) Əli♕︎ ', url:'t.me/Leytenant_85'}],
                [{text:'2) Aysu♕︎ ', url:'t.me/Alhi_sunnna'}],
		[{text:'3) Ali♕︎ ', url:'t.me/MUCVE_M'}],    
                [{text:'🔙 Geri', callback_data:'vip'}]
            ]
        }
    })
})

// TÜRK GRUP DÜYMƏLƏRİ
bot.action('TR', ctx=>{
    ctx.deleteMessage()
    ctx.replyWithMarkdown(`
*Qruplar 📣*
        `,{
        reply_markup:{
            inline_keyboard:[
                [{text:'1) Əli & Qrup📣', url:'https://t.me/kohne_mekan'}],
                [{text:'2) Aysu & Qrup📣', url:'t.me/Alhi_sunnna'}],
		[{text:'3) Ali & Qrup📣 ', url:'t.me/DejavuTeam'}],   
                [{text:'🔙 Geri', callback_data:'vip'}]
            ]
        }
    })
})

// AZƏRBAYCAN GRUP DÜYMƏLƏRİ
bot.action('UK', ctx=>{
    ctx.deleteMessage()
    ctx.replyWithMarkdown(`*Kanallar 📺*`,{
        reply_markup:{
            inline_keyboard:[
                [{text:'1) Əli & Kanal📺 ', url:'https://t.me/kohne_mekan_kanal'}],
                [{text:'2) Aysu & kanal📺 ', url:'https://t.me/vsemqruz'}],
		[{text:'3) Ali & kanal📺  ', url:'https://t.me/DegGixM'}],    
                [{text:'🔙 Geri', callback_data:'vip'}]
            ]
        }
    })
})

/// /// /// /// /// /// ///  <!-- BOT START MENÜ SON --> /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// 





bot.on("message", async (ctx) => {
	let message = ctx.update.message
	if (message.chat.id < 0) {
		let chatId = message.chat.id
		let fromId = message.from.id
		let chat = getChat(chatId)
		if (
			chat && 
			chat.isPlaying && 
			(chat.members[fromId] === undefined || chat.members[fromId].answer === null) && 
			oyunDurumuHusnuEhedov && 
			/^-?\d+$/.test(message.text)
		) {
			let firstName = message.from.first_name
			let answer = Number(message.text)
			if (answer <= 10 || answer > 70) {
				return ctx.reply(
					"Cavab limiti. (10 - 70)",
					{
						reply_to_message_id: ctx.message.message_id,
					}
				)
			}
			if (!chat.members[fromId]) { 
				chat.members[fromId] = dbUserAlHusnuEhedov(firstName)
			}
			Object.assign(chat.members[fromId], {
				isPlaying: true,
				answer: answer,
				firstName: firstName
			})
			oyunDurumuHusnuEhedov[chatId].answersOrder.push(fromId)

			db.update(chatId, ch => chat)

			telegram.editMessageCaption(
				chatId,
				oyunDurumuHusnuEhedov[chatId].guessMessageId,
				null,
				RaundMesajHusnuEhedov(chatId, oyunDurumuHusnuEhedov[chatId].currentRound, oyunDurumuHusnuEhedov[chatId].currentTime),
				{
					parse_mode: "Markdown"
				}
			)
		}
		else if (message.new_chat_member && message.new_chat_member.id === process.env.ID_BOT) { /// Bot Yeni Qruba Eklendi Mesaj
			ctx.replyWithMarkdown(ozelMesaj(true))
		}
	}
})


// Olumsuz Hata versede çalışmaya devam eder
bot.catch((err) => {
    console.log('Error: ', err)
})

// Botun nickname alan kod
bot.telegram.getMe().then(botInfo => {
    bot.options.username = botInfo.username
    console.log(`Sistem Aktifleşti => ${bot.options.username}`)
})

bot.launch();
