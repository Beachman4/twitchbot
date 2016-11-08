var express = require('express');
var router = express.Router();
var config = require('config');
var twitchconfig = config.get('Twitch.config');
var models = require('../models');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', fuckyou: 'fuckyou', client: twitchconfig.app_client });
});

router.get('/twitch_confirm', function(req, res, next) {
    var query = require('url').parse(req.url,true).query;
    var code = query.code;
    models.Channel.create({
        channel_code: code
    });
    console.log("test");
    request.post("https://api.twitch.tv/kraken/oauth2/token", {
        form: {
            client_id: twitchconfig.app_client,
            client_secret: twitchconfig.app_secret,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost/twitch_confirm',
            code: code,
            state: code
        }
    }, function(e, r, body) {
        console.log(body);
        var token = body.access_token,
            scope = body.scope;
        models.Channel.findOne({
            where: {
                channel_code: code
            }
        }).then(function(channel) {
            request({
                url: "https://api.twitch.tv/kraken/user",
                headers: {
                    'Accept': 'application/vnd.twitchtv.v3+json',
                    'Authorization': 'OAuth '+ token
                }
            }, function(e, r, body) {
                console.log(body);
                if (channel) {
                    channel.updateAttributes({
                        channel: "#" + body.name
                    });
                }
            });
            if (channel) {
                channel.updateAttributes({
                    access_token: token,
                    scope: scope
                });
            }
        });
    });
    res.redirect('/');
});

module.exports = router;
