const Sequelize = require('sequelize');
const db = require('./db');

const Produto = db.define('produtos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    desc:{
        type: Sequelize.STRING,
        allowNull: false
    },
    preco:{
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    estoque:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    image:{
        type: Sequelize.STRING,
        allowNull: true,
    }
});

Produto.sync();

module.exports = Produto;