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
const sharp = require('sharp')
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
});

/* ======================================================================================== */

/* TÄSTÄ ALKAA NODE.JS/EXPRESS REST API -PYYNNÖT */
/* ======================================================================================== */

// lisätään käyttäjä + salasana_hash
app.post('/lisaa_kayttaja', (req, response, next) => {
  const body = req.body
  if (!(body.sahkoposti && body.salasana_hash && body.rooli)) {
    return response.status(400).json({ error: 'Tallennettava tieto puuttuu!' })
  }
  try { // tarkistetaan onko sähköpostiosoitteella jo luotu käyttäjä...
    db.query('SELECT * FROM kayttaja WHERE sahkoposti = $1 ORDER BY id', [body.sahkoposti], (err, result) => {
      if (err) {
        return next(err)
      }
      if (result.rows.length > 0) {
        return response.status(401).json({ error: 'Rekisteröintivirhe' })
      } else { // ...jos ei ole luotu niin luodaan uusi käyttäjä kyseisellä sähköpostiosoitteella
        bcrypt.hash(body.salasana_hash, 12, (err, bcrypt_hashatty_salasana) => {
          db.query("INSERT INTO kayttaja (etunimi, sukunimi, sahkoposti, salasana_hash, rooli) values ($1,$2,$3,$4,$5) RETURNING id",
            [body.etunimi, body.sukunimi, body.sahkoposti, bcrypt_hashatty_salasana, body.rooli],
            (err, res) => {
              if (res.rows[0].id != undefined) {
                // jos käyttäjä luotiin onnistuneesti niin lisätään kyseiselle käyttäjälle "alkutentti" (kovakoodattu tentti_id 1)
                db.query("INSERT INTO kayttajan_tentit (kayttaja_id, tentti_id) values (" + res.rows[0].id + ",$1)",
                  [1],
                  (err1, res1) => {
                    if (err1) {
                      return next(err1)
                    }
                  })
                response.status(200).send("Käyttäjä ja alkutentti lisätty onnistuneesti!")
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
  db.query("SELECT * FROM kayttaja WHERE sahkoposti = $1 ORDER BY id", [client_body.sahkoposti], async (err, result) => {

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

// tarjotaan /uploads-sijainti ulkomaailmaan (tarvitaaan kuvien jakamiseen)
// esim. http://localhost:4000/uploads/3FT0OAPBoKw.jpg
/* app.use(express.static('uploads')) */
const uploads_directory = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploads_directory))

const uploads_thumbnails_directory = path.join(__dirname, 'uploads_thumbnails')
app.use('/uploads_thumbnails', express.static(uploads_thumbnails_directory))

// lataa useita tiedostoja serverille
app.post('/upload', async (req, res) => {

  const createThumbnail = async (tiedostonimi) => {
    // luodaan _thumbnail ja lisätään se uploads_thumbnails-kansioon
    console.log('Luodaan esikatselukuva ./uploads_thumbnails/thumbnail_' + tiedostonimi)
    await sharp('./uploads/' + tiedostonimi)
      .resize({ width: 240 })
      .toFile('./uploads_thumbnails/thumbnail_' + tiedostonimi)
      /* .then(info => {
        console.log(info)
      }) */
      .catch(err => {
        console.log(err)
      })
  }

  const addImageToDatabase = async (tiedostonimi) => {
    await db.query("INSERT INTO kuva (tiedostonimi) values ($1)",
      [tiedostonimi],
      (err, res) => {
        if (err) {
          return next(err)
        } else {
          console.log(tiedostonimi + " lisätty.")
        }
      }
    )
  }

  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'Tiedoston lataus epäonnistui.'
      })
    } else {
      let data = []                         // yksittäinen tiedosto ei tule taulukkona
      if (!Array.isArray(req.files.photos)) { // eli tässä tulee vain yksittäinen tiedosto
        console.log("Vastaanotetaan yksi kuva.")
        console.log('Luotiin tiedosto ./uploads/' + req.files.photos.name)
        await req.files.photos.mv('./uploads/' + req.files.photos.name, (err) => {
          if (err) {
            throw err
          } else {
            createThumbnail(req.files.photos.name)
            addImageToDatabase(req.files.photos.name)
          }
        })
        data.push({
          name: req.files.photos.name,
          type: req.files.photos.mimetype,
          size: req.files.photos.size
        })
      } else {
        // käydään kaikki tiedostot läpi
        console.log("Vastaanotetaan " + req.files.photos.length + " kuvaa.")
        _.forEach(_.keysIn(req.files.photos), async (key) => {
          let photo = req.files.photos[key]

          // siirretään tiedosto uploads-kansioon
          console.log('Luotiin tiedosto ./uploads/' + photo.name)
          await photo.mv('./uploads/' + photo.name, (err) => {
            if (err) {
              throw err
            } else {
              createThumbnail(photo.name)
              addImageToDatabase(photo.name)
            }
          })

          // työnnetään kaikki informaatio
          data.push({
            name: photo.name,
            mimetype: photo.mimetype,
            size: photo.size
          })
        })
      }
      // palautetaan response
      res.send({
        status: true,
        message: 'Tiedostot ladattu palvelimelle.',
        data: data
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

//----------------------------------------------------------------------------------------------
// autentikointi, jossa myös kaivetaan käyttäjä id tokenista
const isAuthenticated = require('./authentication')
app.use(isAuthenticated)
//----------------------------------------------------------------------------------------------

// tulostetaan kaikki kuvien tiedostonimet
app.get('/kuva', (req, response, next) => {
  db.query('SELECT * FROM kuva ORDER BY id', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// hae kuva id:n perusteella
app.get('/kuva/:id', (req, response, next) => {
  db.query('SELECT * FROM kuva WHERE id = $1 ORDER BY id', [req.params.id], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// haetaan käyttäjä id:n perusteella (id saadaan isAuthenticated-koodista ja tallennetaan userId-muuttujaan)
app.get('/kayttaja/', (req, response, next) => {
  const userId = response.authentication.userId
  db.query('SELECT * FROM kayttaja WHERE id = $1 ORDER BY id', [userId], (err, res) => {
    /* db.query('SELECT * FROM kayttaja WHERE id = $1', [req.params.id], (err, res) => { */
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
  db.query("SELECT * FROM vaihtoehto WHERE id = $1 ORDER BY id",
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
  db.query("SELECT * FROM kayttajan_vastaus WHERE kayttaja_id = $1 AND vaihtoehto_id = $2 ORDER BY id",
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
  db.query('SELECT * FROM kurssi WHERE id IN (SELECT kurssi_id FROM kayttajan_kurssit WHERE kayttaja_id = $1 ORDER BY id) ORDER BY id',
    [req.params.kayttaja_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa käyttäjän tentit, käyttäjän id perusteella
app.get('/kayttajan_tentit/:kayttaja_id', (req, response, next) => {
  db.query('SELECT * FROM tentti WHERE id IN (SELECT tentti_id FROM kayttajan_tentit WHERE kayttaja_id = $1 ORDER BY id) ORDER BY id',
    [req.params.kayttaja_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa käyttäjän omat tentit joihin hänellä on admin-oikeus, käyttäjän id perusteella
app.get('/oikeus_muokata_tenttia/:kayttaja_id', (req, response, next) => {
  db.query('SELECT * FROM tentti WHERE id IN (SELECT tentti_id FROM oikeus_muokata_tenttia WHERE kayttaja_id = $1 ORDER BY id) ORDER BY id',
    [req.params.kayttaja_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa kayttajan_vastaukset, kayttaja_id sekä tentti_id perusteella
app.get('/kayttajan_vastaukset/:kayttaja_id/:tentti_id', (req, response, next) => {
  db.query('SELECT * FROM kayttajan_vastaus WHERE kayttaja_id = $1 AND tentti_id = $2 ORDER BY id',
    [req.params.kayttaja_id, req.params.tentti_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// lisää tyhjä kysymys ja liitä se tenttiin
app.post('/lisaa_kysymys/:tentti_id', (req, response, next) => {
  try {
    db.query("INSERT INTO kysymys (lause) values ('Uusi kysymys') RETURNING id",
      (err, res) => {
        if (err) {
          return next(err)
        }
        db.query("INSERT INTO tentin_kysymykset (kysymys_id,tentti_id) values (" + res.rows[0].id + ",$1)",
          [req.params.tentti_id],
          (err) => {
            if (err) {
              return next(err)
            }
          })
        // "Uusi kysymys lisätty ja liitetty tenttiin onnistuneesti!"
        response.status(201).send(res.rows[0].id)
      })

  }
  catch (err) {
    response.send(err)
  }
})

// päivitetään kysymyksen tekstin muutos tietokantaan
app.put('/paivita_kysymys/:kysymys_id', (req, response, next) => {
  const body = req.body
  if (body.lause == undefined) {
    return response.status(400).json({
      error: 'Kysymys puuttuu!'
    })
  } else {
    db.query("SELECT * FROM kysymys WHERE id = $1 ORDER BY id",
      [req.params.kysymys_id],
      (err, res) => {
        if (err) {
          return next(err)
        }
        if (res.rows[0] !== undefined) {
          db.query("UPDATE kysymys SET lause = $2 WHERE id = $1",
            [req.params.kysymys_id, body.lause],
            (err, res) => {
              if (err) {
                return next(err)
              }
              response.send("Kysymyksen teksti päivitetty onnistuneesti!")
            })
        } else {
          response.send("Muutosta ei tallennettu, koska tällä id:llä ei ole kysymystä!")
        }
      })
  }
})

// poistetaan kysymyksen liitos tenttiin
app.delete('/poista_kysymyksen_liitos/:kysymys_id/:tentti_id', (req, res, next) => {
  db.query('DELETE FROM tentin_kysymykset WHERE kysymys_id=$1 AND tentti_id=$2',
    [req.params.kysymys_id, req.params.tentti_id], (err, result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
    })
})

// tulostetaan kaikkien kysymysten vaihtoehdot
app.get('/kysymyksen_vaihtoehdot', (req, response, next) => {
  db.query('SELECT * FROM kysymyksen_vaihtoehdot ORDER BY id', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// lisää kuvat kysymykseen
app.post('/lisaa_kuva/', (req, response, next) => {
  /* body = {
    kysymys_id: kysymys_id,
    vaihtoehto_id: vaihtoehto_id,
    sijainti: sijainti,
    selectedImages: selectedImages
  } */

  let reqBody = req.body

  if (reqBody.sijainti === "kysymys") {
    req.body.selectedImages.forEach(kuva_id => {
      db.query("INSERT INTO kysymyksen_kuvat (kuva_id,kysymys_id) values (" + kuva_id + ",$1)",
        [req.body.kysymys_id],
        (err) => {
          if (err) {
            return next(err)
          }
        })
    })
  } else if (reqBody.sijainti === "vaihtoehto") {
    req.body.selectedImages.forEach(kuva_id => {
      db.query("INSERT INTO vaihtoehdon_kuvat (kuva_id,vaihtoehto_id) values (" + kuva_id + ",$1)",
        [req.body.vaihtoehto_id],
        (err) => {
          if (err) {
            return next(err)
          }
        })
    })
  }
})

// palauttaa kysymyksen kuvat, kysymyksen id perusteella
app.get('/kysymyksen_kuvat/:kysymys_id', (req, response, next) => {
  db.query('SELECT * FROM kuva WHERE id IN (SELECT kuva_id FROM kysymyksen_kuvat WHERE kysymys_id = $1 ORDER BY id) ORDER BY id',
    [req.params.kysymys_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa vaihtoehdon kuvat, vaihtoehdon id perusteella
app.get('/vaihtoehdon_kuvat/:vaihtoehto_id', (req, response, next) => {
  db.query('SELECT * FROM kuva WHERE id IN (SELECT kuva_id FROM vaihtoehdon_kuvat WHERE vaihtoehto_id = $1 ORDER BY id) ORDER BY id',
    [req.params.vaihtoehto_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palauttaa kysymyksen vaihtoehdot, kysymyksen id perusteella
app.get('/kysymyksen_vaihtoehdot/:kysymys_id', (req, response, next) => {
  db.query('SELECT * FROM vaihtoehto WHERE id IN (SELECT vaihtoehto_id FROM kysymyksen_vaihtoehdot WHERE kysymys_id = $1 ORDER BY id) ORDER BY id',
    [req.params.kysymys_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// lisää tyhjä vaihtoehto ja liitä se kysymykseen
app.post('/lisaa_vaihtoehto/:kysymys_id', (req, response, next) => {
  try {
    db.query("INSERT INTO vaihtoehto (vaihtoehto) values ('Uusi vaihtoehto') RETURNING id",
      (err, res) => {
        if (err) {
          return next(err)
        }
        db.query("INSERT INTO kysymyksen_vaihtoehdot (vaihtoehto_id,kysymys_id) values (" + res.rows[0].id + ",$1)",
          [req.params.kysymys_id],
          (err) => {
            if (err) {
              return next(err)
            }
          })
        response.status(201).send("Uusi vaihtoehto lisätty ja liitetty kysymykseen onnistuneesti!")
      })

  }
  catch (err) {
    response.send(err)
  }
})

// päivitetään vaihtoehdon teksti
app.put('/paivita_vaihtoehto/:id/:teksti', (req, response, next) => {
  db.query("UPDATE vaihtoehto SET vaihtoehto = $2 where id = $1",
    [req.params.id, req.params.teksti],
    (err, res) => {
      if (err) {
        return next(err)
      }
      response.send("Vaihtoehdon teksti päivitetty onnistuneesti!")
    })
})

// poistetaan vaihtoehdon liitos kysymykseen
app.delete('/poista_vaihtoehdon_liitos/:vaihtoehto_id/:kysymys_id', (req, res, next) => {
  db.query('DELETE FROM kysymyksen_vaihtoehdot WHERE vaihtoehto_id=$1 AND kysymys_id=$2',
    [req.params.vaihtoehto_id, req.params.kysymys_id], (err, result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
    })
})

// tulostetaan kaikki kysymykset
app.get('/kysymys', (req, response, next) => {
  db.query('SELECT * FROM kysymys ORDER BY id', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// tulostetaan kaikki kysymykset id:n perusteella
app.get('/kysymys/:id', (req, response, next) => {
  db.query('SELECT * FROM kysymys WHERE id = $1 ORDER BY id', [req.params.id], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// palauttaa tentin kysymykset tentin id perusteella
app.get('/tentin_kysymykset/:tentti_id', (req, response, next) => {
  db.query('SELECT * FROM kysymys WHERE id IN (SELECT kysymys_id FROM tentin_kysymykset WHERE tentti_id = $1 ORDER BY id) ORDER BY id',
    [req.params.tentti_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows)
    })
})

// palautetaan tentit
app.get('/tentti', (req, response, next) => {
  db.query('SELECT * FROM tentti ORDER BY id', (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows)
  })
})

// palautetaan tentit id:n perusteella
app.get('/tentti/:id', (req, response, next) => {
  db.query('SELECT * FROM tentti WHERE id = $1 ORDER BY id', [req.params.id], (err, res) => {
    if (err) {
      return next(err)
    }
    response.send(res.rows[0])
  })
})

// lisää tyhjä tentti
app.post('/lisaa_tentti/:kayttaja_id', (req, res, next) => {
  try {
    db.query("INSERT INTO tentti (nimi, suoritettu, aloitus, lopetus, minimipisteraja) values ('Uusi tentti',false,now(),now(),'65') RETURNING id",
      (err, response) => {
        if (err) {
          return next(err)
        }
        db.query("INSERT INTO oikeus_muokata_tenttia (kayttaja_id,tentti_id) values ($1," + response.rows[0].id + ")",
          [req.params.kayttaja_id],
          (err) => {
            if (err) {
              return next(err)
            }
          })
        // Uusi tentti lisätty onnistuneesti!
        res.status(201).send(response.rows[0].id)
      })
  }
  catch (err) {
    res.send(err)
  }
})

// päivitetään tentin nimi
app.put('/paivita_tentti/:id/:nimi', (req, response, next) => {
  db.query("UPDATE tentti SET nimi = $2 where id = $1",
    [req.params.id, req.params.nimi],
    (err, res) => {
      if (err) {
        return next(err)
      }
      response.send("Tentin nimi päivitetty onnistuneesti!")
    })
})



// poista tentti
app.delete('/poista_tentti/:tentti_id/:voimalla', (req, response, next) => {
  // poistoa tekevä käyttäjä:
  const userId = response.authentication.userId
  // tehdäänkö poistoa "väkisin/voimalla"
  // muunnetaan string -> boolean
  let voimalla = (req.params.voimalla === 'true')

  // tarkistetaan onko käyttäjä admin
  db.query('SELECT * FROM kayttaja WHERE id = $1', [userId], (err, res) => {
    let admin = false
    if (res.rows[0].rooli === 'admin') {
      admin = true
    }
    try {
      let tiedot_poistettavasta_tentista = {
        poistettu: false,
        admin: admin,
        liitokset: {
          kurssi_id: [],
          kysymys_id: [],
          kayttaja_id_luoja: [],
          kayttaja_id_tilaaja: [],
          kayttaja_id_vastaaja: []
        }
      }
      let saa_poistaa = false
      // tarkistetaan onko tentti linkattu kurssiin
      db.query("SELECT * FROM kurssin_tentit WHERE tentti_id = $1 ORDER BY id",
        [req.params.tentti_id],
        (err, res) => {
          if (err) { return next(err) }
          // jos kursseihin liitoksia; tallennetaan tietoihin kurssi_id:t
          if (res.rows.length > 0) {
            if (voimalla) {
              saa_poistaa = true
              // poistetaan tentin liitos kurssin_tentit-taulusta
              db.query("DELETE FROM kurssin_tentit WHERE tentti_id = $1",
                [req.params.tentti_id],
                (err) => {
                  if (err) { return next(err) }
                }
              )
            } else {
              res.rows.map((row, i) => {
                tiedot_poistettavasta_tentista.liitokset.kurssi_id.push(row.kurssi_id)
              })
            }
          }
          // tarkistetaan onko tentti linkattu kysymykseen
          db.query("SELECT * FROM tentin_kysymykset WHERE tentti_id = $1 ORDER BY id",
            [req.params.tentti_id],
            (err, res) => {
              if (err) { return next(err) }
              // jos kysymyksiin liitoksia; tallennetaan tietoihin kysymys_id:t
              if (res.rows.length > 0) {
                if (voimalla) {
                  saa_poistaa = true
                  // poistetaan tentin liitos tentin_kysymykset-taulusta
                  db.query("DELETE FROM tentin_kysymykset WHERE tentti_id = $1",
                    [req.params.tentti_id],
                    (err) => {
                      if (err) { return next(err) }
                    }
                  )
                } else {
                  res.rows.map((row, i) => {
                    tiedot_poistettavasta_tentista.liitokset.kysymys_id.push(row.kysymys_id)
                  })
                }
              }
              // tarkistetaan onko tentin "tilannut" joku käyttäjä (onko liitos kayttajan_tentit)
              db.query("SELECT * FROM kayttajan_tentit WHERE tentti_id = $1 ORDER BY id",
                [req.params.tentti_id],
                (err, res) => {
                  if (err) { return next(err) }
                  // poistetaan käyttäjän liitos ensin
                  if (res.rows.length > 0) {
                    if (voimalla) {
                      saa_poistaa = true
                      // poistetaan tentin liitos kayttajan_tentit-taulusta
                      db.query("DELETE FROM kayttajan_tentit WHERE tentti_id = $1",
                        [req.params.tentti_id],
                        (err) => {
                          if (err) { return next(err) }
                        })
                    } else {
                      res.rows.map((row) => {
                        tiedot_poistettavasta_tentista.liitokset.kayttaja_id_tilaaja.push(row.kayttaja_id)
                      })
                    }
                  }

                  // tarkistetaan onko tentti linkattu käyttäjän vastauksiin
                  db.query("SELECT * FROM kayttajan_vastaus WHERE tentti_id = $1 ORDER BY id",
                    [req.params.tentti_id],
                    (err, res) => {
                      if (err) { return next(err) }
                      // jos jonkun käyttäjän vastauksiin liitoksia; tallennetaan tietoihin kayttaja_id:t
                      if (res.rows.length > 0) {
                        if (voimalla) {
                          saa_poistaa = true
                          // poistetaan tentin liitos kayttajan_vastaus-taulusta
                          db.query("DELETE FROM kayttajan_vastaus WHERE tentti_id = $1",
                            [req.params.tentti_id],
                            (err) => {
                              if (err) { return next(err) }
                            }
                          )
                        } else {
                          res.rows.map((row, i) => {
                            // tarkistetaan onko käyttäjä jo vastannut johonkin vaihtoehtoon,
                            // että samaa käyttäjää ei lisätä taulukkoon uudestaan turhaan
                            let id_on_jo_taulukossa = false
                            // käydään map:lla läpi "muistiinpanot" joissa on vastausten käyttäjät, että
                            // voidaan verrata onko siellä jo sama käyttäjä yhteen kertaan (ei haluta muistiin
                            // kuin ainoastaan jokainen yksittäinen eri käyttäjä)
                            tiedot_poistettavasta_tentista.liitokset.kayttaja_id_vastaaja.map((kayttaja_id) => {
                              // jos vastannut käyttäjä on sama kuin "muistiinpanoissa" oleva käyttäjä
                              if (row.kayttaja_id === kayttaja_id) {
                                // käyttäjä on tietenkin jo siellä joten halutaan pois tästä loopista ja
                                // siirtyä seuraavaan vastaukseen tarkistamaan sitä käyttäjää
                                id_on_jo_taulukossa = true
                              }
                            })
                            // jos käyttäjä ei ollut ennestään "muistiinpanoissa", lisätään se sinne
                            if (id_on_jo_taulukossa !== true) {
                              tiedot_poistettavasta_tentista.liitokset.kayttaja_id_vastaaja.push(row.kayttaja_id)
                            }
                          })
                        }
                      }

                      // tarkistetaan onko tentti linkattu sen luojaan (käyttäjään)
                      db.query("SELECT * FROM oikeus_muokata_tenttia WHERE tentti_id = $1 ORDER BY id",
                        [req.params.tentti_id],
                        (err, res) => {
                          if (err) { return next(err) }
                          // jos johonkin käyttäjään liitoksia; tallennetaan tietoihin kayttaja_id:t
                          if (res.rows.length > 0) {
                            // tentti (ja sen oikeus_muokata_tenttia-liitos) poistetaan suoraan,
                            // jos tentillä ei ole mitään muuta kuin nimi ja luoja (käyttäjä)
                            if (saa_poistaa || voimalla) {
                              // poistetaan tentin liitos oikeus_muokata_tenttia-taulusta
                              db.query("DELETE FROM oikeus_muokata_tenttia WHERE tentti_id = $1",
                                [req.params.tentti_id],
                                (err) => {
                                  if (err) { return next(err) }
                                })
                            } else {
                              res.rows.map((row, i) => {
                                tiedot_poistettavasta_tentista.liitokset.kayttaja_id_luoja[i] = row.kayttaja_id
                              })
                            }
                          }

                          // jos tenttiä ei ole linkattu, se voidaan poistaa
                          if (saa_poistaa || voimalla) {
                            // tentti poistetaan lopullisesti (edelleen olettaen, että liitoksia ei (enää) ole)
                            db.query("DELETE FROM tentti WHERE id = $1",
                              [req.params.tentti_id],
                              (err) => {
                                if (err) {
                                  return next(err)
                                } else {
                                  tiedot_poistettavasta_tentista.poistettu = true
                                  // palautetaan tentin tiedot
                                  response.status(201).send(tiedot_poistettavasta_tentista)
                                  /* console.log(tiedot_poistettavasta_tentista) */
                                }
                              })
                          } else {
                            // palautetaan tentin tiedot
                            response.status(201).send(tiedot_poistettavasta_tentista)
                            /* console.log(tiedot_poistettavasta_tentista) */
                          }
                        })
                    })
                })
            }
          )
        })
    }
    catch (err) {
      response.send(err)
    }
  })
})

// palauttaa tentin luojan id, tentin id perusteella
app.get('/tentin_luoja/:tentti_id', (req, response, next) => {
  db.query('SELECT * FROM kayttajan_tentit WHERE tentti_id = $1 ORDER BY id',
    [req.params.tentti_id], (err, res) => {
      if (err) {
        return next(err)
      }
      response.send(res.rows[0].kayttaja_id)
    })
})

// palautetaan vaihtoehdot
app.get('/vaihtoehto', (req, response, next) => {
  db.query('SELECT * FROM vaihtoehto ORDER BY id', (err, res) => {
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