'use strict';
module.exports = function(sequelize, DataTypes) {
  var AlertLog = sequelize.define('AlertLog', {
    channel: DataTypes.STRING,
    type: DataTypes.STRING,
    log: DataTypes.TEXT,
    user: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return AlertLog;
};