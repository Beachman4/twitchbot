var models = require('../models');

models.Channels.findAll()
    .then(function(channels) {
        for (index in channels) {
            console.log(channels[index].channel);
        }
    });
