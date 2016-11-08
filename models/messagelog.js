'use strict';
module.exports = function(sequelize, DataTypes) {
  var MessageLog = sequelize.define('MessageLog', {
    channel: DataTypes.STRING,
    user: DataTypes.STRING,
    message: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return MessageLog;
};