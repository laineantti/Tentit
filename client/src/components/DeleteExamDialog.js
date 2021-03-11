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

    const [open, setOpen] = useState(false)

    async function tentinPoistoLogiikka() {
        try {
            await poistaTentti(dispatch, currentExamIndex, currentDatabaseExamIdChanged)
                .then(tiedot => {
                    console.log(tiedot)
                    // Tieto kursseista mihin tentti on liitettynä.
                    let kurssi_id_string = ""
                    let liitos = false
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
                            poistoviesti = "Tämän vuoksi tenttiä ei voitu poistaa tietokannasta."
                        } else {
                            poistoviesti = "Tenttiä ei voitu juuri nyt poistaa. Yritä myöhemmin uudelleen."
                        }
                    }
                    setExamDeleteResult(kurssi_id_string + " " + kysymys_id_string + " " + poistoviesti)
                    setDeleting(false)
                })
        } catch (err) {
            console.log(err)
        }
    }

    const handleClickOpen = () => {
        setExamDeleteResult("")
        setDeleting(true)
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
                            tentinPoistoLogiikka() :
                            handleClose()

                    }} color="primary">
                        {
                            deleting ?
                                ("Poista pysyvästi") :
                                ("ok")
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}
