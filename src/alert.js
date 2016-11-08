var request = require('request');
//var io = require('socket.io')(80);
var now, prev;
var json = "https://api.twitch.tv/kraken/channels/beachman4/follows?limit=1";

var alerts = function() {}
alerts.prototype.hostAlert = function(channel, username, viewers) {
    //TODO: Emit via socket with data
}
alerts.prototype.checkfollower = function () {
    request({
        url: json,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (prev == undefined) {
                prev = body.follows[0].user.display_name;
            }
            now = body.follows[0].user.display_name;
            if (now != prev) {
                console.log(now);
            }
        } else {
            console.log('failed');
        }
    });
}
/*var test = new alerts();
test.checkfollower();*/

module.exports = alerts;