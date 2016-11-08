var config = require('config');
var dbconfig = config.get('Database.DBConfig');
var twitchconfig = config.get('Twitch.config');
var models = require('../models');
var request = require('request');

var bot = function(client) {
    this.client = client;
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
bot.prototype.commands = {
    hello: {"command": "test", "message": "Hello {username}!"},
    game: {"command": "game", "message": "", function: "changeGame", "broadcaster": true},
    title: {"command": "title", "message": "", function: "changeTitle", "broadcaster": true}
}

bot.prototype.parseMessage = function parseMessage(channel, user, message) {
    if (message.startsWith('!')) {
        if (this.checkCommand(message)) {
            var array_command = this.checkCommand(message)
            var command = this.commands[array_command.command];
            var filtered_message = array_command.message;
            if (command.broadcaster) {
                if (this.isBroadcaster(channel, user.username)) {
                    return false;
                }
            }
            if (command.function != undefined) {
                var function_name = command.function;
                var filtered = function_name.replace('"', '');
                // TODO: Fix this, so that it calls the function from the string
                return this.functions[filtered](channel, user, filtered_message);
            }
            var command_message = command.message;
            if ((command_message.indexOf("{") != -1) && (command_message.indexOf("}") != -1)) {
                var first = command_message.indexOf("{");
                var second = command_message.indexOf("}");
                var key = command_message.slice(first, second + 1);
                switch (key) {
                    case "{username}":
                        var complete_message = command_message.replace("{username}", user.username);
                        break;
                    default:
                        break;
                }
                this.client.say(channel, complete_message);
            } else {
                this.client.say(channel, command_message);
            }
        } else {
            console.log("Unrecognized Command!");
        }
    }
}

bot.prototype.checkCommand = function checkCommand(message) {
    var message = message.split("!")[1];
    //var command = message.split(" ");
    var filtered_message = message.substring(message.indexOf(' ')+1);
    var stuff = {
        command: message.split(" ")[0],
        message: filtered_message
    }
    if (stuff.command != undefined) {
        //var final_command = this.commands[command[0]];
        return stuff;
    } else {
        return false;
    }
}
bot.prototype.functions = {
    changeGame: function(channel, user, message) {
        return request({
            url: 'https://api.twitch.tv/kraken/channels/beachman4?oauth_token='+twitchconfig.token,
            method: 'PUT',
            json: {
                channel: {
                    game: message
                }
            },
            headers: {
                'Accept': 'application/vnd.twitchtv.v3+json',
                'Authorization': 'OAuth '+twitchconfig.actual_token
            }
        }, function(e, r, body) {
            console.log(body);
        });
    },
    changeTitle: function(channel, user, message) {
        /*var channel = {
            "status": message
        }
        , options = {
            url: 'https://api.twitch.tv/kraken/channels/beachman4',
            headers: {
                'Accept': 'application/vnd.twitchtv.v3+json',
                'Authorization': "OAuth " + twitchconfig.oauth
            }
        }*/
        /*return request({
            method: 'PUT',
            url: 'https://api.twitch.tv/kraken/channels/beachman4',
            headers: [
                {
                    name: 'accept',
                    value: 'application/vnd.twitchtv.v3+json'
                }, {
                    name: 'authorization',
                    value: 'OAuth: '+twitchconfig.token
                }
            ],
            data: {
                params: [
                    {
                        name: "channel[status]",
                        value: message
                    }
                ],
            }
        }, function(e, r, body) {
            console.log(body);
        });*/
        return request({
            url: 'https://api.twitch.tv/kraken/channels/beachman4?oauth_token='+twitchconfig.token,
            method: 'PUT',
            json: {
                channel: {
                    status: message
                }
            },
            headers: {
                'Accept': 'application/vnd.twitchtv.v3+json',
                'Authorization': 'OAuth '+twitchconfig.actual_token
            }
        }, function(e, r, body) {
            console.log(body);
        });
        /*var options = {
            url: 'https://api.twitch.tv/kraken/channels/beachman4',
            method: 'put',
            headers: {
                'Authorization': 'OAuth '+twitchconfig.token
            },
            data: {
                "channel[status]": message
            }
        };
        function callback(error, response, body) {
            console.log(body + error + response);
        }*/
        //request(options, callback);
    }
}
bot.prototype.isBroadcaster = function isBroadcaster(channel, user) {
    return channel.replace('#', '') == user.username;
}

bot.prototype.logMessage = function(channel, user, message) {
    return models.MessageLog.create({
        channel: channel.replace('#', ''),
        user: user.username,
        message: message
    });
}

bot.prototype.logAlerts = function(channel, username, viewers, type) {
    switch(type) {
        case "host":
            return models.alertlog.create({
                channel: channel.replace('#', ''),
                type: type,
                user: username,
                message: viewers
            });
        default:
            break;
    }
}

module.exports = bot;