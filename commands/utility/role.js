const Discord = require("discord.js");
const find = require("../../utility/find.js");

module.exports = {
  name: "role",
  category: "Utility",
  description: "Give or remove a role from a user, create or edit roles.",
  usage: "<give/add - remove - delete - new - edit>",
  examples: "g!role add @Sax#6211 @Very Cool Person\ng!role remove Baddie Moderator\ng!role delete @Useless role\ng!new name:Role color:#ffffff position:30, seperated:true\ng!role edit Moderator mentionable false\ng!role edit Members permissions remove MANAGE_MESSAGES",
  cooldown: 5,
  guildOnly: true,
  reqPermissions: ['MANAGE_ROLES'],
  botPermissions: ["MANAGE_ROLES"],
  async execute(bot, message, args, db) {
    if (!args[0]) {
      //Error
      message.error("You need to provide a option. `give/add, remove, delete, new, edit`", true, this.usage);
    } else if (args[0].toLowerCase() === "give" || args[0].toLowerCase() === "add") {
      //Give user a role
      if (!args[1]) return message.error("You need to provide a user.", true, "add <user> <role>");
      //Find user
      let user = await find.guildMember(bot, message, args[1])
      if (!user) return message.error("You didn't provide a true user.", true, "add <user> <role>");

      //Find role
      if (!args[2]) return message.error("You need to provide a role.", true, "add user <role>")
      let role = await find.role(bot, message, args[2])
      if (!role) return message.error("You didn't provide a true role.", true, "add user <role>");

      if (!role.editable) return message.error("I can't manage this role. You have to move my role higher than the target role.");
      if (message.member.roles.highest.position <= message.guild.roles.cache.find(grole => grole.name.toLowerCase() == role.name.toLowerCase()).position && message.guild.owner.id != message.author.id) return message.error("You can't manage this role.");
      if (message.guild.members.cache.get(user.id).roles.cache.has(role.id)) return message.error("This user already has this role.");
      if (message.guild.members.cache.get(user.id).roles.highest.position > message.guild.members.cache.get(message.author.id).roles.highest.position && message.guild.owner.id != message.author.id) return message.error("You can't manage this user.");

      message.guild.members.cache.get(user.id).roles.add(role, {reason: `Requested by ${message.author.tag}`}).then(() => {
        message.success(`${role} has been added to ${user}'s roles.`, true);
      }).catch(err => {
        message.error(`An error occured: ${err}`);
      });
    } else if (args[0].toLowerCase() === "remove") {
      //Remove a role from user
      let user = await find.guildMember(bot, message, args[1])
      if (!user) return message.error("You didn't provide a true user.");

      //Find role
      let role = await find.role(bot, message, args[2])
      if (!role) return message.error("You didn't provide a true role.");

      if (!role.editable) return message.error("I can't manage this role. You have to move my role higher than the target role.");
      if (!message.guild.members.cache.get(user.id).roles.cache.has(role.id)) return message.error("This user doesn't have that role.");
      if (message.member.roles.highest.position <= message.guild.roles.cache.find(grole => grole.name.toLowerCase() == role.name.toLowerCase()).position && message.guild.owner.id != message.author.id) return message.error("You can't manage this role.");
      if (message.guild.members.cache.get(user.id).roles.highest.position > message.guild.members.cache.get(message.author.id).roles.highest.position && message.guild.owner.id != message.author.id) return message.error("You can't manage this user.");

      message.guild.members.cache.get(user.id).roles.remove(role, {reason: `Requested by ${message.author.tag}`}).then(() => {
        message.success(`${role} has been removed from ${user}'s roles.`, true);
      }).catch(err => {
        message.channel.send(`An error occured: ${err}`);
      });
    } else if (args[0].toLowerCase() === "delete") {
      //Delete a role

      //Find role
      let role = await find.role(bot, message, args[1])
      if (!role) return message.error("You didn't provide a true role.");

      if (!role.editable) return message.error("I can't manage this role. You have to move my role higher than the target role.");
      if (message.member.roles.highest.position <= message.guild.roles.cache.find(grole => grole.name.toLowerCase() == role.name.toLowerCase()).position && message.guild.owner.id != message.author.id) return message.error("You can't manage this role.");

      message.guild.roles.cache.get(role.id).delete(`Requested by ${message.author.tag} `).then(() => {
        message.success(`${role.name} has been removed from the server successfully.`, true);
      }).catch(err => {
        message.channel.send(`An error occured: ${err}`);
      });

    } else if (args[0].toLowerCase() === "new") {
      //Adds a new role
      if (!args[1]) {
        return message.channel.send(`You need to provide a name for your role.`, true, `new name:<name> color:<color> mention:<true-false> hoist:<true-false>`)
      } else if (args[1]) {
        //Check for the specified things
        let name = false
        let color = false
        let mention = false
        let hoist = false

        args.shift()
        args.forEach(arg => {
          name = arg.indexOf("name:") != -1 ? arg.slice(arg.indexOf("name:") + 5) : name
          color = arg.indexOf("color:") != -1 ? arg.slice(arg.indexOf("color:") + 6) : color
          mention = arg.indexOf("mention:") != -1 ? arg.slice(arg.indexOf("mention:") + 8) : mention
          hoist = arg.indexOf("seperate:") != -1 ? arg.slice(arg.indexOf("seperate:") + 9) : hoist
        })

        if (!name) return message.error("You need a name for the role! To see the right format use the `g!role new` command");
        if (!/^#[0-9A-F]{6}$/i.test(color) && color) return message.error("You didnt provide a true hex color.");
        if (mention != "true" && mention != "false" && mention) return message.error("You didnt provide a true option for mention. `true, false`")
        if (hoist != "true" && hoist != "false" && hoist) return message.error("You didnt provide a true option for seperate. `true, false`")

        message.guild.roles.create({
          data: {
            name: name,
            color: color ? color : "000000",
            hoist: hoist,
            mentionable: mention
          }
        }).then(role => {
          return message.success(`<:tick:724048990626381925> | ${role} role has been successfully created.`, true)
        })
      }

    } else if (args[0].toLowerCase() === "edit") {
      //Edits a role
      //Find role
      let role = await find.role(bot, message, args[1])
      if (!role) return message.error("You didn't provide a true role.");

      if (!role.editable) return message.error("I can't manage this role. You have to move my role higher than the target role.");
      if (message.member.roles.highest.position <= message.guild.roles.cache.find(grole => grole.name.toLowerCase() == role.name.toLowerCase()).position && message.guild.owner.id != message.author.id) return message.error("You can't manage this role.");

      if (!args[2]) {
        //Error
        return message.error("You have to provide a option. `color, seperated/hoisted, mentionable, permissions`", true, "edit <color - seperated - mentionable - permissions>")
      } else if (args[2].toLowerCase() === "name") {
        //Change name of a role
        let oldName = role.name
        args.shift()
        args.shift()
        args.shift()
        let newName = args.join(" ")
        if (newName.length < 1) return message.error("You need to provide a name for the role.");
        if (newName.length > 100) return message.error("Role name must be 100 or fewer in length.");
        role.setName(newName, { reason: `Requested by ${message.author.tag}` }).then(() => {
          return message.success(`**${oldName}**'s name has been changed to **${newName}**.`, true)
        }).catch(err => {
          return message.channel.send(`An error occured: ${err}`);
        })
      } else if (args[2].toLowerCase() === "color") {
        //Change the color
        if (!args[3]) return message.error("You need to provide a hex color.");
        if (/^#[0-9A-F]{6}$/i.test(args[3]) === false) return message.error("You need to provide a true hex color.");
        role.setColor(args[3], { reason: `Requested by ${message.author.tag}` }).then(() => {
          return message.success(`${role}'s color has been changed to ${args[3]}.`, true)
        }).catch(err => {
          return message.channel.send(`An error occured: ${err}`);
        })
      } else if (args[2].toLowerCase() === "mentionable") {
        //Set it seperate or not
        if (!args[3]) return message.error("You need to decide. `true, false`", true, "edit role mentionable <true - false>");
        if ((args[3] === "true") === role.mentionable) return message.error(`Its already set to \`${role.mentionable}\`!`);
        role.setMentionable((args[3] === "true"), { reason: `Requested by ${message.author.tag} `}).then(() => {
          return message.success(`${role}'s mention has been changed to \`${args[3].toLowerCase()}\` successfully.`, true)
        }).catch(err => {
          return message.channel.send(`An error occured: ${err}`);
        })
      } else if (args[2].toLowerCase() === "seperated" || args[2].toLowerCase() === "hoisted" ) {
        //Set it mentionable or not
        if (!args[3]) return message.error("You need to decide. `true, false`", true, "edit role seperated <true - false>");
        if ((args[3] === "true") === role.hoist) return message.error(`Its already set to \`${role.hoist}\`!`);
        role.setHoist((args[3] === "true"), { reason: `Requested by ${message.author.tag} `}).then(() => {
          return message.success(`${role}'s hoist has been changed to \`${args[3].toLowerCase()}\` successfully.`,true)
        }).catch(err => {
          return message.channel.send(`An error occured: ${err}`);
        })
      } else if (args[2].toLowerCase() === "permissions") {
        //Add, remove permissions
        if (!args[3]) {
          //Error - info
          return message.error("You must provide a option. `flags, add, remove`", true, "edit role permissions <flags - add - remove>");
        } else if (args[3].toLowerCase() === "flags") {
          //Send info about permissions
          return message.channel.send("To add a permission you need to provide it's permission flag, to add multiple at once just seperate them with space. \nHere are the flags for permissions: ```ADMINISTRATOR (implicitly has all permissions, and bypasses all channel overwrites) \nCREATE_INSTANT_INVITE (create invitations to the guild) \nKICK_MEMBERS \nBAN_MEMBERS \nMANAGE_CHANNELS (edit and reorder channels) \nMANAGE_GUILD (edit the guild information, region, etc.) \nADD_REACTIONS (add new reactions to messages) \nVIEW_AUDIT_LOG \nPRIORITY_SPEAKER \nSTREAM \nVIEW_CHANNEL \nSEND_MESSAGES \nSEND_TTS_MESSAGES \nMANAGE_MESSAGES (delete messages and reactions) \nEMBED_LINKS (links posted will have a preview embedded) \nATTACH_FILES \nREAD_MESSAGE_HISTORY (view messages that were posted prior to opening Discord) \nMENTION_EVERYONE \nUSE_EXTERNAL_EMOJIS (use emojis from different guilds) \nVIEW_GUILD_INSIGHTS \nCONNECT (connect to a voice channel) \nSPEAK (speak in a voice channel) \nMUTE_MEMBERS (mute members across all voice channels) \nDEAFEN_MEMBERS (deafen members across all voice channels) \nMOVE_MEMBERS (move members between voice channels) \nUSE_VAD (use voice activity detection) \nCHANGE_NICKNAME \nMANAGE_NICKNAMES (change other members' nicknames) \nMANAGE_ROLES \nMANAGE_WEBHOOKS \nMANAGE_EMOJIS```")
        } else if (args[3].toLowerCase() === "add") {
          //Add permission
          if (!args[4]) return message.error(`You need to provide a permission flag, see them in \`${message.prefix}role edit <role> permissions flags\`.`)
          const permargs = args.splice(4)
          if (!message.member.permissions.has(permargs)) return message.error("You don't have that permission to add it to the role.");
          if (role.permissions.has(permargs)) return message.error('The role has this permission already!');
          try {
            let permissions = new Discord.Permissions(permargs)
            permissions.add(role.permissions.bitfield)
            role.setPermissions(permissions).then(() => {
              return message.success(`${role}'s permissions have been updated.`, true)
            })
          }
          catch(err) {
            return message.error("Invalid permission flag, command cancelled.")
          }
        } else if (args[3].toLowerCase() === "remove") {
          //Remove permission
          if (!args[4]) return message.error(`You need to provide a permission flag, see them in \`${message.prefix}role edit <role> permissions flags\`.`)
          const permargs = args.splice(4)
          if (!message.member.permissions.has(permargs)) return message.error("You don't have that permission to add it to the role.");
          if (!role.permissions.has(permargs)) return message.error('The role does not have this permission.');
          try {
            let permissions = new Discord.Permissions(permargs)
            permissions = role.permissions.remove(permissions)
            role.setPermissions(permissions).then(() => {
              return message.success(`${role}'s permissions have been updated.`, true)
            })
          }
          catch(err) {
            return message.error("Invalid permission flag, command cancelled.")
          }
        } else {
          //Error
          return message.error("You must provide a true option. `flags, add, remove`", true, "edit role permissions <flags - add - remove>");
        }
      } else {
        //Error
        return message.error("You have to provide true a option. `color, seperated/hoisted, mentionable, permissions`",true, "edit <color - seperated - mentionable - permissions>")
      }
    } else {
      //Error
      return message.error("You need to provide a true option. `give/add, remove, delete, new, edit`", true, this.usage);
    }
  }
};
