import { React, useState, useContext } from 'react'
import { poistaTentti } from './axiosreqs'
import { store } from './store.js'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
})

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    )
})

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent)

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions)

export default function DeleteExamDialog({ currentExamIndex, setCurrentExamIndex, currentDatabaseExamIdChanged }) {
    const { state, dispatch } = useContext(store)
    const [examDeleteResult, setExamDeleteResult] = useState("")
    const [deleting, setDeleting] = useState(true)
    const [force, setForce] = useState(false)

    const [open, setOpen] = useState(false)

    async function tentinPoistoLogiikka(voimalla) {
        try {
            await poistaTentti(dispatch, currentExamIndex, currentDatabaseExamIdChanged, voimalla)
                .then(tiedot => {
                    console.log(tiedot)

                    // Tieto kayttaja-liitoksista mihin tentti on liitettynä.
                    let kayttaja_string = ""
                    let kayttaja_id_luoja_string = ""
                    let kayttaja_id_tilaaja_string = ""
                    let kayttaja_id_vastaaja_string = ""
                    let liitos = false

                    // tentin luoja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_luoja.length > 0) {
                        liitos = true
                        let loppuosa = " luoma."
                        if (tiedot.liitokset.kayttaja_id_luoja.length === 1) {
                            kayttaja_id_luoja_string = "Tämä tentti on käyttäjän " +
                                tiedot.liitokset.kayttaja_id_luoja[0] + loppuosa
                        } else {
                            kayttaja_id_luoja_string = "Tätä tenttiä on muokannut käyttäjät "
                            tiedot.liitokset.kayttaja_id_luoja.forEach((value, i) => {
                                if (i === tiedot.liitokset.kayttaja_id_luoja.length - 1) {
                                    kayttaja_id_luoja_string += value + loppuosa
                                } else if (i === tiedot.liitokset.kayttaja_id_luoja.length - 2) {
                                    kayttaja_id_luoja_string += value + " ja "
                                } else {
                                    kayttaja_id_luoja_string += value + ", "
                                }
                            })
                        }
                        kayttaja_string += kayttaja_id_luoja_string
                    }
                    // tentin tilaaja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_tilaaja.length > 0) {
                        liitos = true
                        let loppuosa = "."
                        if (tiedot.liitokset.kayttaja_id_tilaaja.length === 1) {
                            kayttaja_id_tilaaja_string = "Tentin on tilannut käyttäjä " +
                                tiedot.liitokset.kayttaja_id_tilaaja[0] + loppuosa
                        } else {
                            kayttaja_id_tilaaja_string = "Tentin on tilannut käyttäjät "
                            tiedot.liitokset.kayttaja_id_tilaaja.forEach((value, i) => {
                                if (i === tiedot.liitokset.kayttaja_id_tilaaja.length - 1) {
                                    kayttaja_id_tilaaja_string += value + loppuosa
                                } else if (i === tiedot.liitokset.kayttaja_id_tilaaja.length - 2) {
                                    kayttaja_id_tilaaja_string += value + " ja "
                                } else {
                                    kayttaja_id_tilaaja_string += value + ", "
                                }
                            })
                        }
                        kayttaja_string += " " + kayttaja_id_tilaaja_string
                    }
                    // tentin vastaaja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_vastaaja.length > 0) {
                        liitos = true
                        let loppuosa = "."
                        if (tiedot.liitokset.kayttaja_id_vastaaja.length === 1) {
                            kayttaja_id_vastaaja_string = "Tenttiin on vastannut käyttäjä " +
                                tiedot.liitokset.kayttaja_id_vastaaja[0] + loppuosa
                        } else {
                            kayttaja_id_vastaaja_string = "Tenttiin on vastannut käyttäjät "
                            tiedot.liitokset.kayttaja_id_vastaaja.forEach((value, i) => {
                                if (i === tiedot.liitokset.kayttaja_id_vastaaja.length - 1) {
                                    kayttaja_id_vastaaja_string += value + loppuosa
                                } else if (i === tiedot.liitokset.kayttaja_id_vastaaja.length - 2) {
                                    kayttaja_id_vastaaja_string += value + " ja "
                                } else {
                                    kayttaja_id_vastaaja_string += value + ", "
                                }
                            })
                        }
                        kayttaja_string += " " + kayttaja_id_vastaaja_string
                    }

                    // Tieto kursseista mihin tentti on liitettynä.
                    let kurssi_id_string = ""
                    if (!tiedot.poistettu && tiedot.liitokset.kurssi_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.kurssi_id.length === 1) {
                            kurssi_id_string = "Tentti on liitetty kurssiin " +
                                tiedot.liitokset.kurssi_id[0] + "."
                        } else {
                            kurssi_id_string = "Tentti on liitetty kursseihin "
                            tiedot.liitokset.kurssi_id.forEach((value, i) => {
                                if (i === tiedot.liitokset.kurssi_id.length - 1) {
                                    kurssi_id_string += value + "."
                                } else if (i === tiedot.liitokset.kurssi_id.length - 2) {
                                    kurssi_id_string += value + " ja "
                                } else {
                                    kurssi_id_string += value + ", "
                                }
                            })
                        }
                    } /* else {
                        kurssi_id_string = "Tentti ei ole millään kurssilla."
                    } */
                    // Tieto kysymyksistä mihin tentti on liitettynä.
                    let kysymys_id_string = ""
                    if (tiedot.liitokset.kysymys_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.kysymys_id.length === 1) {
                            kysymys_id_string = "Se on liitetty kysymykseen " +
                                tiedot.liitokset.kysymys_id[0] + "."
                        } else {
                            kysymys_id_string = "Se on liitetty kysymyksiin "
                            tiedot.liitokset.kysymys_id.forEach((value, i) => {
                                if (i === tiedot.liitokset.kysymys_id.length - 1) {
                                    kysymys_id_string += value + "."
                                } else if (i === tiedot.liitokset.kysymys_id.length - 2) {
                                    kysymys_id_string += value + " ja "
                                } else {
                                    kysymys_id_string += value + ", "
                                }
                            })
                        }
                    } /* else {
                        kysymys_id_string = "Siihen ei ole liitetty yhtään kysymystä."
                    } */
                    // tarkistetaan onko oikeasti poistettu
                    let poistoviesti = ""
                    if (tiedot.poistettu) {
                        poistoviesti = "Tentti poistettiin onnistuneesti."
                        // kun tentti on poistettu, asetetaan ja välitetään Admin-sivulla 
                        // valituksi tentiksi -1 (= tenttiä ei valittuna)
                        setCurrentExamIndex(-1)
                    } else {
                        if (liitos) {
                            poistoviesti = "Tenttiä ei poistettu, koska muut käyttävät sitä. Voit siitä huolimatta halutessasi poistaa sen LOPULLISESTI."
                        } else {
                            poistoviesti = "Tenttiä ei voitu juuri nyt poistaa. Yritä myöhemmin uudelleen."
                        }
                    }

                    if (force === false) {
                        setExamDeleteResult(kayttaja_string + " " + kurssi_id_string
                            + " " + kysymys_id_string + " " + poistoviesti)
                        setForce(true)
                    } else {
                        setExamDeleteResult(poistoviesti)
                        setForce(false)
                        setDeleting(false)
                    }
                })
        } catch (err) {
            console.log(err)
        }
    }

    const handleClickOpen = () => {
        setExamDeleteResult("")
        setDeleting(true)
        setForce(false)
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open dialog
      </Button> */}
            <IconButton style={{ float: "right" }} label="delete" color="primary"
                onClick={handleClickOpen}>
                <DeleteIcon />
            </IconButton >
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>Tentin poistaminen</DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>{
                        (examDeleteResult === "") ?
                            `Haluatko varmasti poistaa tentin ${state[currentExamIndex].nimi}?` :
                            examDeleteResult
                    }</Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        deleting ?
                            tentinPoistoLogiikka(force)
                            : handleClose()

                    }} color={deleting?"secondary":"default"}>
                        {
                            deleting ?
                                force ?
                                    ("POISTA LOPULLISESTI") :
                                    ("Poista")
                                : ("ok")
                        }
                    </Button>
                    <Button autoFocus onClick={() => {
                        handleClose()

                    }} color="default">
                        {
                            ("Peruuta")
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}
