const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config();

module.exports = {
    eAdmin: async function (req, res, next){
        //return res.json({messagem:"Validar o token!"});
        const authHeader = req.headers.authorization;
        const [, token] = authHeader.split(' ');
        //return res.json({token});
        if(!token){
            return res.json({
                erro: true,
                messagem: "Erro: Necessário realizar o login para acessar a página!"
            });
        }
    
        try {
            const decode = await promisify(jwt.verify)(token, process.env.SECRET);
            req.userId = decode.id;
            return next(); 
        } catch (err) {
            return res.json({
                erro: true,
                messagem: "Erro: Login ou Senha inválido!",
                
            });
        }
    
        
    }
}
