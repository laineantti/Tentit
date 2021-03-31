import { React, useState, useContext } from 'react'
import { poistaKysymys } from './axiosreqs'
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

export default function DeleteCardDialog({ currentExamIndex, setCurrentExamIndex, cardIndex, examIndex, kysymys_id }) {
    const { state, dispatch } = useContext(store)
    const [cardDeleteResult, setCardDeleteResult] = useState("")
    const [deleting, setDeleting] = useState(true)
    const [force, setForce] = useState(false)

    const [open, setOpen] = useState(false)

    async function kysymyksenPoistoLogiikka(voimalla) {
        let isMounted = true
        try {
            await poistaKysymys(dispatch, kysymys_id, cardIndex, examIndex, voimalla)
                .then(tiedot => {
                    // Tieto kayttaja-liitoksista mihin tentti on liitettynä.
                    let kayttaja_string = ""
                    let kayttaja_id_luoja_string = ""
                    let kayttaja_id_tilaaja_string = ""
                    let kayttaja_id_vastaaja_string = ""
                    let liitos = false

                    console.log(tiedot)

                    // tentin luoja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_luoja.length > 0) {
                        liitos = true
                        let loppuosa = " luomassa tentissä."
                        if (tiedot.liitokset.kayttaja_id_luoja.length === 1) {
                            kayttaja_id_luoja_string = "Tämä kysymys on käyttäjän " +
                                tiedot.liitokset.kayttaja_id_luoja[0] + loppuosa
                        } else {
                            kayttaja_id_luoja_string = "Tätä kysymyksen sisältävää tenttiä on muokannut käyttäjät "
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
                    // kysymyksen sisältävän tentin tilaaja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_tilaaja.length > 0) {
                        liitos = true
                        let loppuosa = "."
                        if (tiedot.liitokset.kayttaja_id_tilaaja.length === 1) {
                            kayttaja_id_tilaaja_string = "Kysymyksen sisältävän tentin on tilannut käyttäjä " +
                                tiedot.liitokset.kayttaja_id_tilaaja[0] + loppuosa
                        } else {
                            kayttaja_id_tilaaja_string = "Kysymyksen sisältävän tentin on tilannut käyttäjät "
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
                    // Kysymyksen sisältävän tentin vastaaja:
                    if (!tiedot.poistettu && tiedot.liitokset.kayttaja_id_vastaaja.length > 0) {
                        liitos = true
                        let loppuosa = "."
                        if (tiedot.liitokset.kayttaja_id_vastaaja.length === 1) {
                            kayttaja_id_vastaaja_string = "Kysymyksen sisältävään tenttiin on vastannut käyttäjä " +
                                tiedot.liitokset.kayttaja_id_vastaaja[0] + loppuosa
                        } else {
                            kayttaja_id_vastaaja_string = "Kysymyksen sisältävään tenttiin on vastannut käyttäjät "
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

                    // Tieto kursseista mihin kysymyksen sisältävä tentti on liitettynä.
                    let kurssi_id_string = ""
                    if (!tiedot.poistettu && tiedot.liitokset.kurssi_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.kurssi_id.length === 1) {
                            kurssi_id_string = "Kysymyksen sisältävän tentti on liitetty kurssiin " +
                                tiedot.liitokset.kurssi_id[0] + "."
                        } else {
                            kurssi_id_string = "Kysymyksen sisältävän tentti on liitetty kursseihin "
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
                    // Tieto vaihtoehdoista mihin kysymys on liitettynä.
                    let vaihtoehto_id_string = ""
                    if (tiedot.liitokset.vaihtoehto_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.vaihtoehto_id.length === 1) {
                            vaihtoehto_id_string = "Se on liitetty vaihtoehtoon " +
                                tiedot.liitokset.vaihtoehto_id[0] + "."
                        } else {
                            vaihtoehto_id_string = "Se on liitetty vaihtoehtoihin "
                            tiedot.liitokset.vaihtoehto_id.forEach((value, i) => {
                                if (i === tiedot.liitokset.vaihtoehto_id.length - 1) {
                                    vaihtoehto_id_string += value + "."
                                } else if (i === tiedot.liitokset.vaihtoehto_id.length - 2) {
                                    vaihtoehto_id_string += value + " ja "
                                } else {
                                    vaihtoehto_id_string += value + ", "
                                }
                            })
                        }
                    }
                    // Tieto kuvista mihin kysymys on liitettynä.
                    let kuva_id_string = ""
                    if (tiedot.liitokset.kuva_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.kuva_id.length === 1) {
                            kuva_id_string = "Se on liitetty kuvaan " +
                                tiedot.liitokset.kuva_id[0] + "."
                        } else {
                            kuva_id_string = "Se on liitetty kuviin "
                            tiedot.liitokset.kuva_id.forEach((value, i) => {
                                if (i === tiedot.liitokset.kuva_id.length - 1) {
                                    kuva_id_string += value + "."
                                } else if (i === tiedot.liitokset.kuva_id.length - 2) {
                                    kuva_id_string += value + " ja "
                                } else {
                                    kuva_id_string += value + ", "
                                }
                            })
                        }
                    }
                    // Tieto aiheista mihin kysymys on liitettynä.
                    let aihe_id_string = ""
                    if (tiedot.liitokset.aihe_id.length > 0) {
                        liitos = true
                        if (tiedot.liitokset.aihe_id.length === 1) {
                            aihe_id_string = "Se on liitetty aiheeseen " +
                                tiedot.liitokset.aihe_id[0] + "."
                        } else {
                            aihe_id_string = "Se on liitetty aiheisiin "
                            tiedot.liitokset.aihe_id.forEach((value, i) => {
                                if (i === tiedot.liitokset.aihe_id.length - 1) {
                                    aihe_id_string += value + "."
                                } else if (i === tiedot.liitokset.aihe_id.length - 2) {
                                    aihe_id_string += value + " ja "
                                } else {
                                    aihe_id_string += value + ", "
                                }
                            })
                        }
                    }
                    // tarkistetaan onko oikeasti poistettu
                    let poistoviesti = ""
                    if (tiedot.poistettu) {
                        poistoviesti = "Kysymys poistettiin onnistuneesti."
                    } else {
                        if (liitos) {
                            let tentti_id_string = ""
                            tiedot.liitokset.tentti_id.forEach((value, i) => {
                                tentti_id_string += value
                                if (i === tiedot.liitokset.tentti_id.length - 2) {
                                    tentti_id_string += " ja "
                                } else if (i + 1 !== tiedot.liitokset.tentti_id.length) {
                                    tentti_id_string += ", "
                                }
                            })
                            poistoviesti = "Kysymystä ei poistettu, koska muut käyttävät tenttejä (" + tentti_id_string + ") joissa kysymys on osana. Voit siitä huolimatta halutessasi poistaa sen LOPULLISESTI."
                        } else {
                            poistoviesti = "Kysymystä ei voitu juuri nyt poistaa. Yritä myöhemmin uudelleen."
                        }
                    }
                    if (isMounted === true) {
                        if (force === false) {
                            setCardDeleteResult(kayttaja_string + " " + kurssi_id_string
                                + " " + vaihtoehto_id_string + " " + kuva_id_string + " " + aihe_id_string + " " + poistoviesti)
                            setForce(true)
                        } else {
                            setCardDeleteResult(poistoviesti)
                            setForce(false)
                            setDeleting(false)
                        }
                    }
                })
        } catch (err) {
            console.log(err)
        }
        return () => { isMounted = false }
    }

    const handleClickOpen = () => {
        setCardDeleteResult("")
        setDeleting(true)
        setForce(false)
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open dialog
      </Button> */}
            <IconButton label="delete" color="primary"
                onClick={handleClickOpen}>
                <DeleteIcon />
            </IconButton >
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>Kysymyksen poistaminen</DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>{
                        (cardDeleteResult === "") ?
                            `Haluatko varmasti poistaa kysymyksen ${state[currentExamIndex].kysymykset[cardIndex].lause
                                .substring(0, 10) + (state[currentExamIndex].kysymykset[cardIndex].lause.length > 10 ? "... " : "")}?` :
                            cardDeleteResult
                    }</Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        if (deleting) {
                            kysymyksenPoistoLogiikka(force)
                        } else {
                            handleClose()
                        }
                        // deleting ?
                        //     tentinPoistoLogiikka(force)
                        //     : handleClose()
                    }
                    } color={deleting ? "secondary" : "default"}>
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
        </>
    )
}
