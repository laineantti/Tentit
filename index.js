require('dotenv').config()
const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require("cors")
const path = require('path')
const bodyParser = require("body-parser")
const port = process.env.PORT
const morgan = require('morgan')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const app = express()
var jwt = require('jsonwebtoken');
app.use(express.static('./client/build'))

/* Valmistellaan käytettävät osoitteet oikeaan muotoon sen mukaan ollaanko heroku vai localhost */
/* ======================================================================================== */
let path_domain = null
let path_protocol = null
let appOrigin = null
let con_string = null
let cors_origin = null
let default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

if (!process.env.HEROKU) {
  con_string = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`
  appOrigin = 'http://localhost:3000'
  console.log("front:", appOrigin)

} else {
  con_string = process.env.DATABASE_URL
  appOrigin = 'https://tentti-fullstack.herokuapp.com/'
  console.log("front:", appOrigin)
}

// // tarkistetaan onko noden ympäristö production, development vai test
// switch (environment) {
//   case 'production':
//     path_domain = 'tentti-fullstack.herokuapp.com'
//     // protocol erikseen, koska con_string vaatii tcp-version siitä
//     path_protocol = 'https://'
//     // herokussa oleva postgress tietokannan osoite herokun config-muuttujasta
//     const heroku_database_url = process.env.DATABASE_URL
//     // karsitaan edellämainitusta 11 ekaa merkkiä eli protokolla pois
//     const modified_version = heroku_database_url.slice(11)
//     // lisätään tilalle tcp-alku
//     con_string = 'tcp://' + modified_version
//     // asetetaan cors origin
//     cors_origin = path_protocol + path_domain
//     break
//   case 'development':
//     // localhostissa käytetään alkuperäistä tapaa muodostaa con_string
//     path_protocol = 'http://'
//     path_domain = 'localhost'
//     con_string = 'tcp://'+process.env.DB_USERNAME+':'+process.env.DB_PASSWORD+'@'+path_domain+'/'+process.env.DB_NAME
//     // asetetaan cors origin, client on portissa 3000 (mihin on tarkoitus luottaa) ja serveri 4000
//     cors_origin = path_protocol + path_domain + ':3000'
//     break
//   case 'test':
//     path_protocol = 'http://'
//     path_domain = 'localhost'
//     con_string = `tcp://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${path_domain}/${process.env.DB_NAME}`
//     cors_origin = path_protocol + path_domain + ':3000'
//     break
//   default:
//     throw default_error
// }

/* ======================================================================================== */

// tiedostojen lataaminen serverille (tiedostokokorajana 50MB)
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 50 * 1024 * 1024 * 1024
  },
}))

module.exports = app
// serverin portti on joko herokun asettama tai 4000
// const port = process.env.PORT || 4000
const db = require('./db')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
// asetetaan node.js osoite, vakio-portti sekä cors (clientin portti 3000)
// app.options(path_protocol + path_domain + ':3000/', cors())
// app.options(appOrigin, cors())
// app.use(cors())

var corsOptions = {  // tietoturva: määritellään mistä originista sallitaan http-pyynnöt
  origin: appOrigin,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET,PUT,POST,DELETE"
}
app.use(cors(corsOptions))
/* WEBSOCKET NOTIFICAATIO-SERVERI MUUTOKSILLE TIETOKANNASSA.
-----------------------------------------------------------------
Socket.io toimii nyt (localhostissa ja Herokussa odotetusti) samassa portissa kuin express, mutta se ei haittaa, koska socket.io käyttää
eri protokollaa (ws://) */
/* ======================================================================================== */
// const http = require('http').Server(app);
const httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer, {
  cors: {
    origin: appOrigin,
    methods: ["GET", "POST"]
  }
})

var pg = require('pg');
const { result } = require('lodash')
var pg_client = new pg.Client(con_string);
/* pg_client.connect() */
pg_client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

/*
// addedrecord edustaa kaikkia muutoksia (insert/delete tentti/kurssi)
const query = pg_client.query('LISTEN addedrecord');

io.sockets.on('connection', function (socket) {
  socket.emit('connected', { connected: true });

  socket.on('ready for data', function (data) {
    console.log('socket.io server ready')
    pg_client.on('notification', function (title) {
      socket.emit('update', { message: title });
    });
  });
}); */

/* ======================================================================================== */

/* TÄSTÄ ALKAA NODE.JS/EXPRESS REST API -PYYNNÖT */
/* ======================================================================================== */

// lisätään käyttäjä + salasana_hash
app.post('/lisaa_kayttaja', (req, response, next) => {
  const body = req.body
  if (!(body.sahkoposti && body.salasana_hash && body.rooli)) {
    return response.status(400).json({ error: 'Tallennettava tieto puuttuu!' })
  }
  try {
    db.query('SELECT * FROM kayttaja WHERE sahkoposti = $1', [body.sahkoposti], (err, result) => {
      if (err) {
        return next(err)
      }
      if (result.rows.length > 0) {
        return response.status(401).json({ error: 'Rekisteröintivirhe' })
      } else {
        bcrypt.hash(body.salasana_hash, 12, (err, bcrypt_hashatty_salasana) => {
          db.query("INSERT INTO kayttaja (etunimi, sukunimi, sahkoposti, salasana_hash, rooli) values ($1,$2,$3,$4,$5) RETURNING id",
            [body.etunimi, body.sukunimi, body.sahkoposti, bcrypt_hashatty_salasana, body.rooli],
            (err, res) => {
              if (res.rows[0].id != undefined) {
                response.status(200).send("Käyttäjä lisätty onnistuneesti!")
              }
              if (err) {
                return next(err)
              }
            })
        })
      }
    })
  } catch (ex) {
    console.log(ex.message)
  }
})

// kirjaudutaan käyttäjällä sisään

app.post('/kirjaudu', (req, res, next) => {

  const client_body = req.body

  // tarkistetaan tietokannasta kayttaja annetulla sahkopostilla
  db.query("SELECT * FROM kayttaja WHERE sahkoposti = $1", [client_body.sahkoposti], async (err, result) => {

    const db_body = result.rows[0]

    // palautetaan 401, jos tarvittavaa dataa ei saada clientiltä
    if (!(db_body)) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }

    const passwordCorrect = await bcrypt.compare(client_body.salasana, db_body.salasana_hash)

    // palautetaan 401, jos salasana oli väärä
    if (!(passwordCorrect)) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }

    // tokeniin tallennettavat tiedot
    const userForToken = {
      id: db_body.id,
      sahkoposti: db_body.sahkoposti,
      etunimi: db_body.etunimi,
      sukunimi: db_body.sukunimi,
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET)

    // lähetetään token clientille
    res.status(200).send({ token })
  })
})

// lataa useita tiedostoja serverille
app.post('/upload', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      let data = [];

      // käydään kaikki tiedostot läpi
      _.forEach(_.keysIn(req.files.photos), (key) => {
        let photo = req.files.photos[key];

        // siirretään tiedosto uploads-kansioon
        photo.mv('./uploads/' + photo.name);

        //työnnetään kaikki informaatio
        data.push({
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size
        });
      });

      // palautetaan response
      res.send({
        status: true,
        message: 'Files are uploaded',
        data: data
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// tehdään uploads-sijainnista staattinen
app.use(express.static('uploads'));

//----------------------------------------------------------------------------------------------
// autentikointi, jossa myös kaivetaan käyttäjä id tokenista
const isAuthenticated = require('./authentication')
app.use(isAuthenticated)
//----------------------------------------------------------------------------------------------
// tarkistetaan onko käyttäjä admin
app.get('/onko_admin/:id', (req, response, next) => {
  db.query('SELECT * FROM kayttaja WHERE id = $1', [req.params.id], (err, res) => {
    console.log(res.rows[0].rooli)
    if (res.rows[0].rooli === 'admin') {
      next()
    } else {
      return res.send(401)
    }
  })
})

// haetaan käyttäjä id:n perusteella (id saadaan isAuthenticated-koodista ja tallennetaan userId-muuttujaan)
app.get('/kayttaja/', (req, response, next) => {
  const userId = response.authentication.userId
  db.query('SELECT * FROM kayttaja WHERE id = $1', [userId], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// päivitetään käyttäjän tietoja
app.put('/paivita_kayttaja/:id/:etunimi/:sukunimi/:sahkoposti/:salasana_hash/:rooli', (req, response, next) => {
  db.query("UPDATE kayttaja SET etunimi = $2, sukunimi = $3, sahkoposti = $4, salasana_hash = $5, rooli = $6 where id = $1",
    [req.params.id, req.params.etunimi, req.params.sukunimi, req.params.sahkoposti,
    req.params.salasana_hash, req.params.rooli],
    (err, res) => {
      if (err) {
        return next(err)
      }
      response.send("Käyttäjän tiedot päivitetty onnistuneesti!")
    })
})

// päivitetään tentin oikea_valinta-ruudun muutos tietokantaan
app.put('/paivita_oikea_valinta/:vaihtoehto_id/:oikea_vastaus', (req, response, next) => {
  db.query("SELECT * FROM vaihtoehto WHERE id = $1",
    [req.params.vaihtoehto_id],
    (err, res) => {
      if (err) {
        return next(err)
      }
      if (res.rows[0] !== undefined) {
        db.query("UPDATE vaihtoehto SET oikea_vastaus = $2 WHERE id = $1",
          [req.params.vaihtoehto_id, req.params.oikea_vastaus],
          (err, res) => {
            if (err) {
              return next(err)
            }
            response.send("Tentin oikea vastaus päivitetty onnistuneesti!")
          })
      } else {
        response.send("Muutosta ei tallennettu, koska tällä id:llä ei ole oikeaa vastausta!")
      }
    })
})

// päivitetään tentin valinta-ruudun muutos tietokantaan
app.put('/paivita_valinta/:kayttaja_id/:vaihtoehto_id/:tentti_id/:kurssi_id/:vastaus', (req, response, next) => {
  db.query("SELECT * FROM kayttajan_vastaus WHERE kayttaja_id = $1 AND vaihtoehto_id = $2",
    [req.params.kayttaja_id, req.params.vaihtoehto_id],
    (err, res) => {
      if (err) {
        return next(err)
      }
      if (res.rows[0] !== undefined) {
        db.query("UPDATE kayttajan_vastaus SET vastaus = $3 WHERE kayttaja_id = $1 AND vaihtoehto_id = $2",
          [req.params.kayttaja_id, req.params.vaihtoehto_id, req.params.vastaus],
          (err, res) => {
            if (err) {
              return next(err)
            }
            response.send("Käyttäjän vastaus päivitetty onnistuneesti!")
          })
      } else {
        db.query("INSERT INTO kayttajan_vastaus (kayttaja_id,vaihtoehto_id,tentti_id,kurssi_id,vastaus) VALUES($1,$2,$3,$4,$5)",
          [
            req.params.kayttaja_id,
            req.params.vaihtoehto_id,
            req.params.tentti_id,
            req.params.kurssi_id,
            req.params.vastaus
          ],
          (err, res) => {
            if (err) {
              return next(err)
            }
            response.send("Käyttäjän vastaus tallennettu onnistuneesti!")
          })
      }
    })
})

// palauttaa käyttäjän kurssit, käyttäjän id perusteella
app.get('/kayttajan_kurssit/:kayttaja_id', (req, response, next) => {
  db.query('SELECT * FROM kurssi WHERE id IN (SELECT kurssi_id FROM kayttajan_kurssit WHERE kayttaja_id = $1)',
    [req.params.kayttaja_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa käyttäjän tentit, käyttäjän id perusteella
app.get('/kayttajan_tentit/:kayttaja_id', (req, response, next) => {
  db.query('SELECT * FROM tentti WHERE id IN (SELECT tentti_id FROM kayttajan_tentit WHERE kayttaja_id = $1)',
    [req.params.kayttaja_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa kayttajan_vastaukset, kayttaja_id sekä tentti_id perusteella
app.get('/kayttajan_vastaukset/:kayttaja_id/:tentti_id', (req, response, next) => {
  db.query('SELECT * FROM kayttajan_vastaus WHERE kayttaja_id = $1 AND tentti_id = $2',
    [req.params.kayttaja_id, req.params.tentti_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// tulostetaan kaikkien kysymysten vaihtoehdot
app.get('/kysymyksen_vaihtoehdot', (req, response, next) => {
  db.query('SELECT * FROM kysymyksen_vaihtoehdot', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// palauttaa kysymyksen vaihtoehdot, kysymyksen id perusteella
app.get('/kysymyksen_vaihtoehdot/:kysymys_id', (req, response, next) => {
  db.query('SELECT * FROM vaihtoehto WHERE id IN (SELECT vaihtoehto_id FROM kysymyksen_vaihtoehdot WHERE kysymys_id = $1)',
    [req.params.kysymys_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// tulostetaan kaikki kysymykset
app.get('/kysymys', (req, response, next) => {
  db.query('SELECT * FROM kysymys', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// tulostetaan kaikki kysymykset id:n perusteella
app.get('/kysymys/:id', (req, response, next) => {
  db.query('SELECT * FROM kysymys WHERE id = $1', [req.params.id], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// palauttaa tentin kysymykset tentin id perusteella
app.get('/tentin_kysymykset/:tentti_id', (req, response, next) => {
  db.query('SELECT * FROM kysymys WHERE id IN (SELECT kysymys_id FROM tentin_kysymykset WHERE tentti_id = $1)',
    [req.params.tentti_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palautetaan tentit
app.get('/tentti', (req, response, next) => {
  db.query('SELECT * FROM tentti', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// palautetaan tentit id:n perusteella
app.get('/tentti/:id', (req, response, next) => {
  db.query('SELECT * FROM tentti WHERE id = $1', [req.params.id], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// päivitetään tentin nimi
app.put('/paivita_tentti/:id/:nimi', (req, response, next) => {
  try {
    db.query('UPDATE tentti SET nimi = $2 WHERE id = $1', [req.params.id], [req.params.nimi], (err, res) => {
      if (err) {
        return next(err)
      }
      response.status(201).send("Tentin nimi päivitetty!")
    })
  }
  catch (err) {
    response.send(err)
  }
}) 

// palautetaan vaihtoehdot
app.get('/vaihtoehto', (req, response, next) => {
  db.query('SELECT * FROM vaihtoehto', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

// MÄÄRITELTY TIEDOSTOSSA YLEMPÄNÄ: const port = process.env.PORT || 4000
// const server = http.listen(port, () => {
httpServer.listen(port, () => {
  console.log('Palvelin käynnistyi portissa:' + port);
});