const {Sequelize}  = require('sequelize');


const sequelize = new Sequelize('ecommerce', 'root', '', {
    host: 'localhost',
    dialect: 'mysql' 
  });

//teste para vereficar se realizou a conexão com banco
/*sequelize.authenticate().then(function(){
    console.log("Conexão com banco de dados realizada com Sucesso!")
}).catch(function(err){
    console.log("Erro: Conexão com banco de dados não realizada!")
});*/

module.exports = sequelize;