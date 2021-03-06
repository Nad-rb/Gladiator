const Discord = require("discord.js");
const https = require('https');

function containsNonLatinCodepoints(s) {
    return /[^\u0000-\u00ff]/.test(s);
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

module.exports = {
  name: "emoji",
  category: "Utility",
  description: "Shows you the information about a emoji.",
  aliases: ["e"],
  examples: "g!emoji add pepelaugh (image attachment)\ng!emoji remove :banhammer:\ng!emoji :checkpins:",
  usage: "<add - remove - emoji>",
  botPermissions: ["MANAGE_EMOJIS"],
  async execute(bot, message, args) {
    if (!args[0]) return message.error("You didn't provide a option or emoji.", true, this.usage)

    if (args[0].toLowerCase() === "add" && message.member.hasPermission("MANAGE_EMOJIS")) {
      if (!args[1]) return message.error("You didnt't provide a url or a emoji to add.");

      if (validURL(args[1])) {
        let name;
        if (args[2]) name = args[2]
        message.guild.emojis.create(args[1], name ? name : `emoji_${message.guild.emojis.cache.size}`).then(e => {
          return message.success("Emoji has been created! " + e.toString())
        }).catch(err => {
          return message.channel.send("An error occured: " + err)
        });

      } else if (args[1].lastIndexOf(":") != -1) {
        let emojiID = args[1].slice(args[1].lastIndexOf(":") + 1, args[1].length - 1)
        let emoji = bot.emojis.resolve(emojiID) ? bot.emojis.resolve(emojiID).url : undefined
        if (!emoji) {

          await https.get(`https://cdn.discordapp.com/emojis/${emojiID}.gif`, (res) => {
            if (res.statusCode === 200) {
              emoji = `https://cdn.discordapp.com/emojis/${emojiID}.gif`
              let name;
              if (args[2]) name = args[2]
              message.guild.emojis.create(emoji, name ? name : `emoji_${message.guild.emojis.cache.size}`).then(e => {
                return message.success("Emoji has been created! " + e.toString())
              }).catch(err => {
                return message.channel.send("An error occured: " + err)
              });
            } else if (res.statusCode === 415) {
              https.get(`https://cdn.discordapp.com/emojis/${emojiID}.png`, (res) => {
                if (res.statusCode === 200) {
                  emoji = `https://cdn.discordapp.com/emojis/${emojiID}.png`
                  let name;
                  if (args[2]) name = args[2]
                  message.guild.emojis.create(emoji, name ? name : `emoji_${message.guild.emojis.cache.size}`).then(e => {
                    return message.success("Emoji has been created! " + e.toString())
                  }).catch(err => {
                    return message.channel.send("An error occured: " + err)
                  });
                } else if (res.statusCode === 415) {
                  return message.error("Could not get the emoji, please check the URL or try to upload the image with command.")
                }
              })
            }
          })
        } else {
          let name;
          if (args[2]) name = args[2]
          message.guild.emojis.create(emoji, name ? name : `emoji_${message.guild.emojis.cache.size}`).then(e => {
            return message.success("Emoji has been created! " + e.toString())
          }).catch(err => {
            return message.channel.send("An error occured: " + err)
          });
        }
      } else if (message.attachments.first()) {
          let name = args[1] ? args[1] : undefined
          message.guild.emojis.create(message.attachments.first().url, name ? name : `emoji_${message.guild.emojis.cache.size}`).then(e => {
            return message.success("Emoji has been created! " + e.toString())
          }).catch(err => {
            return message.channel.send("An error occured: " + err)
          })

        } else {
        return message.error("You didn't provide a custom emoji or a image to make a emoji of.")
      }

    } else if (args[0].toLowerCase() === "remove" || args[0].toLowerCase() === "delete" && (message.member.hasPermission("MANAGE_EMOJIS") || devs.includes(message.author.id))) {
      if (!args[1]) return message.error("You didn't provide a emoji.");
      let emojiID = args[1].lastIndexOf(":") != -1 ? args[1].slice(args[1].lastIndexOf(":") + 1, args[1].length - 1) : undefined
      if (!emojiID) return message.error("You didn't provide true a emoji.");

      let emoji = message.guild.emojis.cache.get(emojiID)
      if (!emoji) return message.error("This emoji is not from this server.");

      emoji.delete().then(() => {
        return message.success("Emoji has been removed from the server successfully.")
      }).catch(err => {
        return message.channel.send("An error occured: " + err)
      })

    } else if (args[0].lastIndexOf(":") != -1) {
      let emojiID = args[0].lastIndexOf(":") != -1 ? args[0].slice(args[0].lastIndexOf(":") + 1, args[0].length - 1) : undefined
      if (!emojiID) return message.error("You didn't provide a true emoji.");

      let emoji = bot.emojis.resolve(emojiID) ? bot.emojis.resolve(emojiID).url : undefined
      if (!emoji) {

        await https.get(`https://cdn.discordapp.com/emojis/${emojiID}.gif`, (res) => {
          if (res.statusCode === 200) {
            emoji = `https://cdn.discordapp.com/emojis/${emojiID}.gif`
            return message.channel.send(emoji)
          } else if (res.statusCode === 415) {
            https.get(`https://cdn.discordapp.com/emojis/${emojiID}.png`, (res) => {
              if (res.statusCode === 200) {
                emoji = `https://cdn.discordapp.com/emojis/${emojiID}.png`
                return message.channel.send(emoji)
              } else if (res.statusCode === 415) {
                return message.error("Could not get the emoji, please check the URL or try to upload the image with command.")
              }
            })
          }
        })
      } else {
        return message.channel.send(emoji)
      }
    } else {
      return message.error("You dont have permission to add emojis or you didnt provide a right emoji.")
    }
  }
};
