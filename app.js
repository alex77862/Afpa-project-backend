const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Article = require('./models/article');
const User = require('./models/user');
const app = express();
const bcrypt = require('bcrypt');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


// CORS
app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === "OPTIONS") {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.options('/*', (_, res) => {
  res.sendStatus(200);
});

// Connect to Mongo
mongoose.connect('mongodb+srv://test:1234@cluster0.483bg.mongodb.net/tanukiDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// Demo
app.post('/api/demo', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Objet créé !'
  });
});

// Fake Data
app.use('/api/fakedata', (req, res, next) => {
  const fakedata = [{
      _id: 'oeihfzeoi',
      title: 'Velo rouge',
      description: 'Les infos de mon premier objet',
      imageUrl: 'https://trek.scene7.com/is/image/TrekBicycleProducts/TK20%20carbon%20road%20marquee?$responsive-pjpg$&cache=on,on&wid=1920',
      price: 50,
      userId: 'qsomihvqios',
    },
    {
      _id: 'oeihfzeomoihi',
      title: 'Ballon de foot',
      description: 'Les infos de mon deuxième objet',
      imageUrl: 'https://m.media-amazon.com/images/I/91lVJo77UIS._AC_SX425_.jpg',
      price: 4.9,
      userId: 'qsomihvqios',
    },
  ];
  res.status(200).json(fakedata);
});

// Post One
app.post('/api/stuff', (req, res, next) => {
  const article = new Article({
    ...req.body.formulaire
  });
  article.save()
    .then(() => res.status(201).json({
      message: 'Objet enregistré !'
    }))
    .catch(error => console.log(error));
});


// Find All
app.get('/api/stuff', (req, res, next) => {
  Article.find()
    .then(articles => res.status(200).json(articles))
    .catch(error => res.status(400).json({
      error
    }));
});


// Find One
app.get('/api/stuff/:id', (req, res, next) => {
  Article.findOne({
      _id: req.params.id
    })
    .then(article => res.status(200).json(article))
    .catch(error => res.status(404).json({
      error
    }));
});


// Update One
app.put('/api/stuff/:id', (req, res, next) => {
  Article.updateOne({
      _id: req.params.id
    }, {
      ...req.body.data
    })
    .then(() => res.status(200).json({
      message: 'Objet modifié !'
    }))
    .catch(error => res.status(400).json({
      error
    }));
});


// Delete One
app.delete('/api/stuff/:id', (req, res, next) => {
  Article.deleteOne({
      _id: req.params.id
    })
    .then(() => res.status(201).json({
      message: 'Objet supprimé !'
    }))
    .catch(error => res.status(400).json({
      error
    }));
});


app.post('/api/auth/signin', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })
      user.save()
        .then(() => {
          res.status(201).json({
            message: 'Utilisateur créé !'
          })
        })
        .catch(error => {
          res.status(400).json({
            error
          })
        });
    })
    .catch(error => {
      res.status(500).json({
        error
      })
    });
})




app.post('/api/auth/login', (req, res, next) => {
  User.findOne({
      email: req.body.email
    })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          error: 'Utilisateur non trouvé !'
        });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({
              error: 'Mot de passe incorrect !'
            });
          }
          res.status(200).json({
            userId: user._id,
            token: 'TOKEN'
          });
        })
        .catch(error => {
          res.status(500).json({
            error
          })
        });
    })
    .catch(error => {
      res.status(500).json({
        error
      })
    });
})


// const userRoutes = require ('./routes/user');
// app.use('/api/auth', userRoutes);


module.exports = app;