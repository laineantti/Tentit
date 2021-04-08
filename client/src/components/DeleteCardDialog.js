import { React, useState, useEffect, useRef, useContext } from 'react'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import WarningIcon from '@material-ui/icons/Warning'
import DeleteIcon from '@material-ui/icons/Delete'
import ListItem from '@material-ui/core/ListItem'
import CloseIcon from '@material-ui/icons/Close'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import { poistaKysymys } from './axiosreqs'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import { store } from './store.js'
import uuid from 'react-uuid'

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

export default function DeleteCardDialog({ currentExamIndex, dataGridSelection, setDataGridSelection, setRows, rows }) {
    const { state, dispatch } = useContext(store)
    const [cardDeleteResult, setCardDeleteResult] = useState([])
    const [deleting, setDeleting] = useState(true)
    const [force, setForce] = useState(false)
    const _isMounted = useRef(true)

    const [open, setOpen] = useState(false)

    useEffect(() => {
        return () => {
            _isMounted.current = false;
        }
    }, [])

    const getCardIndex = (card_id) => {
        state[currentExamIndex].kysymykset.forEach((kysymys, i) => {
            if (state[currentExamIndex].kysymykset[i].id === card_id)
                return i
        })
    }

    async function kysymyksenPoistoLogiikka(voimalla, kysymys_id, cardIndex, examIndex) {
        try {
            await poistaKysymys(dispatch, kysymys_id, cardIndex, examIndex, voimalla)
                .then(tiedot => {
                    if (_isMounted.current === true) {
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
                        }
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
                            setDataGridSelection([])
                            paivitaDataGrid()
                        } else {
                            if (liitos) {
                                let tentti_id_string = ""
                                if (tiedot.liitokset.tentti_id > 0) {
                                    tiedot.liitokset.tentti_id.forEach((value, i) => {
                                        tentti_id_string += value
                                        if (i === tiedot.liitokset.tentti_id.length - 2) {
                                            tentti_id_string += " ja "
                                        } else if (i + 1 !== tiedot.liitokset.tentti_id.length) {
                                            tentti_id_string += ", "
                                        }
                                    })
                                    poistoviesti = "Kysymystä ei poistettu, koska muut käyttävät tenttejä (" + tentti_id_string + ") joissa kysymys on osana."
                                }
                            } else {
                                poistoviesti = "Kysymystä ei voitu juuri nyt poistaa. Yritä myöhemmin uudelleen."
                            }
                        }
                        if (force === false) {
                            setCardDeleteResult(cardDeleteResult => [...cardDeleteResult, kayttaja_string + " " + kurssi_id_string
                                + " " + vaihtoehto_id_string + " " + kuva_id_string + " " + aihe_id_string + " " + poistoviesti])
                            setForce(true)
                        } else {
                            setCardDeleteResult(cardDeleteResult => [...cardDeleteResult, poistoviesti])
                            setForce(false)
                            setDeleting(false)
                        }
                    }
                })
        } catch (err) {
            console.log(err)
        }
    }

    const handleClickOpen = () => {
        setCardDeleteResult([])
        setDeleting(true)
        setForce(false)
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const paivitaDataGrid = () => {
        setRows(rows.filter((row) => !dataGridSelection.includes(row.id)))
        setDataGridSelection([])
    }

    return (
        <>
            <IconButton style={{ float: "right" }} label="delete" color="secondary"
                disabled={(dataGridSelection.length > 0) ? false : true}
                onClick={handleClickOpen}>
                <DeleteIcon />
            </IconButton >
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>Poista useita kysymyksiä</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={1}>
                        <Grid item xs={1}>
                            <WarningIcon />
                        </Grid>
                        <Grid item xs={11}>
                            <Typography component={'span'} gutterBottom>{
                                (cardDeleteResult.length === 0) ?
                                    `Oletko varma, että haluat poistaa pysyvästi nämä valitsemasi ${dataGridSelection.length} kysymystä? Niiden palauttaminen jälkikäteen ei ole mahdollista! Ota myös huomioon, että kysymykset poistuvat jokaisesta tentistä missä niitä tällä hetkellä käytetään!`
                                    : <List>
                                        {cardDeleteResult.map((result, i) =>
                                            <ListItem key={uuid()}>Kysymys {dataGridSelection[i]} ({result})</ListItem>
                                        )}
                                    </List>
                            }</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        if (deleting) {
                            dataGridSelection.forEach(selection => {
                                kysymyksenPoistoLogiikka(force, selection, getCardIndex(selection), currentExamIndex)
                            })
                        } else {
                            handleClose()
                        }
                    }
                    } color={deleting ? "secondary" : "default"}>
                        {
                            deleting ?
                                force ?
                                    ("Poista pysyvästi!")
                                    : ("Kyllä")
                                : ("Ok")
                        }
                    </Button>
                    {deleting &&
                        <Button autoFocus onClick={() => {
                            handleClose()

                        }} color="default">
                            {
                                ("Ei")
                            }
                        </Button>}
                </DialogActions>
            </Dialog>
        </>
    )
}