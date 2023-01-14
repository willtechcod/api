const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const cors = require('cors');
const upload = require('./middlewares/uploads');
const fs = require('fs');
const path = require('path');
const { eAdmin } = require('./middlewares/auth');
const Usuario = require('./models/Usuario');
const Produto = require('./models/Produto');


//a linha a baixo confirma o recebimento de dados em json do body do projeto
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, "public", "uploads")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
  app.use(cors());
  next();
});

//const db = require('./models/db'); chamada para teste de conexão

app.get('/', (req, res) => {
  return res.status(200).json({ msg: 'Ecommerce API no Ar 🚀' });
});

//Aqui comeca validação de usuário com autenticação de token
app.get('/usuarios', eAdmin, async function (req, res) {
  await Usuario.findAll({ order: [['id', 'DESC']] })
    .then(function (usuarios) {
      return res.json({
        erro: false,
        usuarios
      });
    }).catch(function () {
      return res.json({
        erro: true,
        messagem: "Erro: Nenhum usuário encontrado!"
      });
    });
});

app.get('/usuario/:id', eAdmin, async (req, res) => {
  await Usuario.findByPk(req.params.id)
    .then(usuario => {
      return res.json({
        erro: false,
        usuario
      });
    }).catch(function () {
      return res.json({
        erro: true,
        messagem: "Erro: Usuário Não encontrado!"
      });
    });
});

app.post('/usuario', async (req, res) => {
  var dados = req.body;

  //a linha a baixo refere a criptografia da senha 
  dados.senha = await bcrypt.hash(dados.senha, 8);

  await Usuario.create(dados)
    .then(function () {
      return res.json({
        erro: false,
        messagem: "Usuário cadastrado com Sucesso!",

      });
    }).catch(function () {
      return res.json({
        erro: true,
        messagem: "Erro: Usuário Não cadastrado!",

      });
    });

});

app.put('/usuario', eAdmin, async (req, res) => {
  var dados = req.body;
  dados.senha = await bcrypt.hash(dados.senha, 8);
  await Usuario.update(dados, { where: { id: dados.id } })
    .then(function () {
      return res.json({
        erro: false,
        messagem: "Usuário editado com sucesso!"
      });
    }).catch(function () {
      return res.json({
        erro: false,
        messagem: "Erro: Usuário não editado com sucesso!"
      });
    });
});

app.delete('/usuario/:id', eAdmin, async (req, res) => {
  await Usuario.destroy({ where: { id: req.params.id } })
    .then(function () {
      return res.json({
        erro: false,
        messagem: "Usuário apagado com sucesso!"
      });
    }).catch(function () {
      return res.json({
        erro: true,
        messagem: "Erro: Usuário não apagado!"
      });
    });
});

app.post('/login', async (req, res) => {

  const usuario = await Usuario.findOne({ where: { email: req.body.usuario } });
  if (usuario === null) {
    return res.json({
      erro: true,
      messagem: "Erro: Usuário ou senha inválido!"
    });
  }

  if (!(await bcrypt.compare(req.body.senha, usuario.senha))) {
    return res.json({
      erro: true,
      messagem: "Erro: Usuário ou senha inválido!"
    });
  }
  var token = jwt.sign({ id: usuario.id }, process.env.SECRET, {
    //expiresIn: 600 //10min
    expiresIn: '7d' // 7 dias
  })

  return res.json({
    erro: false,
    messagem: "Login realizado com sucesso!",
    token
  });
});

//Aqui inicia o CRUD do Produto
app.get('/produto', async function (req, res) {
  await Produto.findAll({ order: [['id', 'DESC']] })
    .then(function (produtos) {
      return res.json({
        erro: false,
        produtos
      });
    }).catch(function () {
      return res.json({
        erro: true,
        messagem: "Erro: Nenhum produto encontrado!"
      });
    });
});


app.get('/produto/:id', async (req, res) => {
  await Produto.findByPk(req.params.id)
    .then(produtos => {
      if (produtos.img) {
        var endImagem = "http://localhost:8080/files/produtos/" + produtos.img;
      } else {
        var endImagem = "http://localhost:8080/files/padrao.png";
      }

      return res.json({
        erro: false,
        produtos,
        endImagem
      });
    }).catch(function (erro) {
      return res.status(400).json({
        erro: true,
        messagem: "Erro: Produto não encontrado!"
      });
    });
});

app.post('/cad_prod', async function (req, res) {

  const resultCad = await Produto.create(
    req.body
  ).then(function () {
    return res.json({
      erro: false,
      messagem: "Produto cadastrado com Sucesso!"
    })
  }).catch(function (erro) {
    return res.status(400).json({
      erro: true,
      messagem: "Erro: Produto não cadastrado com Sucesso!"
    });
  });
});


app.put('/edit_prod', async (req, res) => {
  await Produto.update(req.body, {
    where: { id: req.body.id }
  }).then(function () {
    return res.json({
      erro: false,
      messagem: "Produto editado com sucesso!"
    });
  }).catch(function (erro) {
    return res.status(400).json({
      erro: true,
      messagem: "Erro: Produto não editado com sucesso!"
    });
  });
});

app.put('/edit_img/:id', upload.single('img'), async (req, res) => {
  if (req.file) {
    await Produto.findByPk(req.params.id)
      .then(produtos => {
        //console.log(produto.dataValues.img);
        const imgAntiga = "./public/uploads/produtos/" + produtos.dataValues.img;
        fs.access(imgAntiga, (erro) => {
          if (!erro) {
            fs.unlink(imgAntiga, () => { });
          }
        });
      }).catch(function (erro) {
        return res.status(400).json({
          erro: true,
          messagem: "Erro: Produto não encontrado!"
        });
      });

    await Produto.update({ img: req.file.filename }, { where: { id: req.params.id } })
      .then(function () {
        return res.json({
          erro: false,
          messagem: "Imagem do Produto editada com sucesso!"
        });
      }).catch(function (erro) {
        return res.status(400).json({
          erro: true,
          messagem: "Erro: Imagem do Produto não editada com sucesso!"
        });
      });

  } else {
    return res.status(400).json({
      erro: true,
      messagem: "Erro: imagem tem que ser JPG ou PNG!"
    });
  }
})

app.delete('/apagar_prod/:id', async (req, res) => {
  await Produto.destroy({
    where: { id: req.params.id }
  }).then(function () {
    return res.json({
      erro: false,
      messagem: "Produto apagado com sucesso!"
    });
  }).catch(function (erro) {
    return res.status(400).json({
      erro: true,
      messagem: "Erro: Produto não apagado com sucesso!"
    });
  });
});

app.listen(8080, function () {
  console.log("Servidor iniciado na porta 8080: http://localhost:8080 🚀");
});