import { React, useState, useContext } from 'react'
import { store } from './store.js'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import ImageSearch from '@material-ui/icons/ImageSearch';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { fetchImage } from './axiosreqs'

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

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        width: 500,
        height: 450,
    },
}));

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

export default function ImageSelector({ location }) {
    /* const { state, dispatch } = useContext(store) */
    const [tileData, setTileData] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const classes = useStyles()

    const getTileData = async () => {
        setLoading(true)
        // hakee kuvat serveriltä ja muuntaa tietokannasta
        // saadun taulun material-ui:n tileData-muotoon
        let kuvat = []
        let kuvatMuunnettu = []
        kuvat = await fetchImage()
        /* console.log(kuvat) */
        for (const kuva of kuvat) {
            kuvatMuunnettu.push({
                img: kuva.tiedostonimi,
                title: kuva.tiedostonimi,
                author: 'tentit-app',
                cols: 2,
            })
        }
        setTileData(kuvatMuunnettu)
        setLoading(false)
    }

    const handleClickOpen = async () => {
        await getTileData()
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <IconButton style={{ float: "left" }} label="delete" color="primary"
                onClick={handleClickOpen}>
                <ImageSearch />
            </IconButton >
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Kuvan lisääminen {
                        location === "kysymys" ?
                            "kysymykseen" :
                            "vaihtoehtoon"
                    }.
                </DialogTitle>
                <DialogContent dividers>
                    {/* <Typography gutterBottom>{location}</Typography> */}
                    <div className={classes.root}>
                        <GridList cellHeight={160} className={classes.gridList} cols={3}>
                            {loading ?
                                <img src={"http://localhost:3000/images/selma.gif"} alt={"koira pyörii"} />
                                : tileData.map((tile) => (
                                    <GridListTile key={tile.img} cols={tile.cols || 1}>
                                        <img src={"http://localhost:4000/uploads/" + tile.img} alt={tile.title} />
                                        {console.log("http://localhost:4000/uploads/" + tile.img)}
                                    </GridListTile>
                                ))
                            }
                        </GridList>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        handleClose()

                    }} color={"secondary"}>
                        {
                            "Lisää kuva"
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
