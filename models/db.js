const { Sequelize } = require('sequelize');
require('dotenv').config();

const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME
const db_pass = process.env.DB_PASS

const sequelize = new Sequelize(db_name, db_user, db_pass, {
    host: 'localhost',
    dialect: 'mysql'
});

//teste para vereficar se realizou a conexão com banco
sequelize.authenticate().then(function () {
    console.log("Conexão com banco de dados realizada com Sucesso!")
}).catch(function (err) {
    console.log("Erro: Conexão com banco falhou!", err)
});

module.exports = sequelize;