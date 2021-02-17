const config = require('./config.json')
const axios = require('axios').default

const Discord = require('discord.js');
const client = new Discord.Client();


const definePollution = (num) => {
    if (num === 1) {
        return 'Good'
    }
    else if (num === 2) {
        return 'Fair'
    }
    else if (num === 3) {
        return 'Moderate'
    }
    else if (num === 4) {
        return 'Poor'
    }
    else if (num === 5) {
        return 'Very Poor'
    }
}


const unixToHuman = function (unix, reqd) {
    const dateObj = new Date(unix * 1000)
    //3 for Time and Date
    //2 for Date only
    //1 for Time only
    if (reqd === 3) {
        return dateObj.toLocaleString()
    }
    else if (reqd === 2) {
        return dateObj.toLocaleDateString()
    }
    else if (reqd == 1) {
        return dateObj.toLocaleTimeString()
    }
}


client.once('ready', () => {
    console.log('Ready!')
})


client.on('message', message => {
    
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    //the !ping command
    else if (message.content == '!ping') {
        message.channel.send("Pinging...").then(m =>{
            let ping = m.createdTimestamp - message.createdTimestamp;
            m.edit(`Ping: ${ping}ms`)
        })
        message.channel.send(`API Latency: ${Math.round(client.ws.ping)}ms.`);
        
    }
    //the !joke command
    else if (message.content == '!joke') {
        axios.get('https://icanhazdadjoke.com/slack').then(res => {
            message.channel.send(res.data.attachments[0].fallback)
        })
    }
    //the !weather=location 
    else if ('!weather' === message.content.split('=')[0]) {
        const location = message.content.split('=')[1]
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.OpenAPI_key}&units=metric`).then((res) => {
            message.channel.send(`Weather Conditions in ${res.data.name}:\n${res.data.weather[0].main}, ${res.data.weather[0].description}\nTemperature: ${res.data.main.temp}\u00B0C\nFeels Like: ${res.data.main.feels_like}\u00B0C\nHumidity: ${res.data.main.humidity}%\nCloudiness: ${res.data.clouds.all}%\nVisibility: ${res.data.visibility}m\nSunrise: ${unixToHuman(res.data.sys.sunrise, 1)}\nSunset: ${unixToHuman(res.data.sys.sunset, 1)}`)
        })
        .catch((err) => {
            console.log(err)
        })
    }
    
    else if (message.content == '!memes') {
        axios.get('https://www.reddit.com/r/memes/hot/.json?limit=10').then(res => {
            let body = res.data
            for(let index = 2; index < body.data.children.length; index++) {
                if (body.data.children[index].data.post_hint == 'image') {
                    const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(body.data.children[index].data.title)
                    .setImage(body.data.children[index].data.url_overridden_by_dest)

                    message.channel.send(embed);
                }
            }

        })
        .catch(err => {
            console.log(err);
        })
    }
    
    else if (message.content === '!motivate') {
        axios.get('https://type.fit/api/quotes').then(res => {
            const len = res.data.length;
            console.log()
            message.channel.send(`${res.data[Math.floor(Math.random() * len)].text} - ${res.data[Math.floor(Math.random() * len)].author}`);
        }).catch(err => {
            message.channel.send('Server not responding.')
        })
    }
    
    else if ('!aqi' === message.content.split('=')[0]) {
        const location = message.content.split('=')[1]
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.OpenAPI_key}`)
        .then(res => {
            axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${res.data.coord.lat}&lon=${res.data.coord.lon}&appid=${config.OpenAPI_key}`)
            .then(response => {
                message.channel.send(`The AQI Level at ${location}: ${definePollution(response.data.list[0].main.aqi)}\nPM2.5: ${response.data.list[0].components.pm2_5}\nPM10: ${response.data.list[0].components.pm10}\n`)
            })
            .catch(err => {
                console.log(err)
                message.channel.send('Error.')
            })
        }).catch(err => {
            console.log(err)
            message.channel.send('Incorrect Information!')
        })
    }
    else if (message.content === '!freeadvice') {
        axios.get('https://api.adviceslip.com/advice').then(res => {
            message.channel.send(res.data.slip.advice)
        }

        ).catch(err => {
            message.channel.send('No advice for you.')
        })
    }
    else if (message.content === '!trivia') {
        axios.get(`http://numbersapi.com/random/trivia`).then(res => {
            message.channel.send(res.data)
        })
        .catch(err => {
            console.log(err)
            message.channel.send('No response from server.')
        })
    }
    else if (message.content.split(' ')[0] === '!iambored') {
        if (message.content.split(' ').length == 1) {
            axios.get('http://www.boredapi.com/api/activity/').then(res => {
                message.channel.send(res.data.activity)
                if (res.data.link) {
                    message.channel.send(`Get started: ${res.data.link}`)
                }
            })
                .catch(err => {
                    console.log(err)
                    message.channel.send('Waste away.')
                })
        }
        else {
            const type = message.content.split(' ')[1].split('=')[1];
            axios.get(`http://www.boredapi.com/api/activity?type=${type}`).then(res => {
                message.channel.send(res.data.activity)
                if (res.data.link) {
                    message.channel.send(`Get started: ${res.data.link}`)
                }
            })
                .catch(err => {
                    console.log(err)
                    message.channel.send('Waste away.')
                })
        }
        
        
        
    }
    else if (message.content === '!whereami') {
        message.channel.send('Go to https://freegeoip.app/ to find out.')
    }
    
    else if (message.content.split(' ')[0] === '!truthordare') {
        if (message.content.split(' ')[1] === 'all') {
            const x = []
            const channel = message.channel;
            for (let [snowflake, guildMember] of channel.members) {
                if (guildMember.user.bot === false) {
                    x.push(guildMember.user.username)
                }

            }
            message.channel.send(`${x[Math.floor(Math.random() * x.length)]}'s Turn!`)
        }
        else {
            let x = []
            for (let [snowflake, guildMember] of message.mentions.users) {

                if (guildMember.bot == false) {
                    x.push(guildMember.username)
                }
                

            }
            if (x.length < 1) {
                message.channel.send('Insufficient numbers!')
            }
            else {
                message.channel.send(`${x[Math.floor(Math.random() * x.length)]}'s Turn`)

            }
            
        }
        
    }
    else if (message.content.split('=')[0] === '!covid19'){
        if (message.content.split('=').length === 1) {
            axios.get('https://covid-api.mmediagroup.fr/v1/cases').then(res => {
                message.channel.send(`Globally:\nCases Confirmed: ${res.data.Global.All.confirmed}\nRecovered: ${res.data.Global.All.recovered}\nDeaths: ${res.data.Global.All.deaths}`)
            })
                .catch(err => {
                    console.log(err)

                })
            
        }
        else {
            axios.get(`https://covid-api.mmediagroup.fr/v1/cases?country=${message.content.split('=')[1]}`).then(res => {
                message.channel.send(`In ${res.data.All.country}:\nConfirmed: ${res.data.All.confirmed}\nRecovered: ${res.data.All.recovered}\nDeaths: ${res.data.All.deaths}`)
                console.log(res.data)
                
            })
            .catch(err => {
                console.log(err)
            })
        }
        
    }

})



client.login(config.token)






