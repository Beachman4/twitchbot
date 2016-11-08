var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var twitchconfig = config.get('Twitch.config');
var irc = require('tmi.js');
var models = require('./models');
var twitch = require('./src/bot.js');
var alerts = require('./src/alert.js');
var alert = new alerts();
alert.checkfollower();


var routes = require('./routes/index');
var users = require('./routes/users');
//var alert = require('./routes/alert');
var channel_list = [];
models.Channel.all().then(function(channels) {
  /*channels.each(function(channel){
      channel_list.push(channel.channel);
  });*/
  for (var i = 0; i < channels.length; i++) {
    channel_list.push(channels[i].channel);
  }
});

/*
 [twitchconfig.channel]
 */

var options = {
  options: {
    debug: false
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: twitchconfig.username,
    password: twitchconfig.oauth
  },
  channels: channel_list
};

var client = new irc.client(options);

client.connect();
var bot = new twitch(client);
client.on("chat", function(channel, user, message, self) {
    if (bot.isBroadcaster(channel, user)) {
      bot.parseMessage(channel, user, message);
    }
    bot.logMessage(channel, user, message);
});
client.on("hosted", function(channel, username, viewers) {
    alert.hostAlert(channel, username, viewers);
    bot.logAlerts(channel, username, viewers, "host");
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
//app.use('/followeralert', alert);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
