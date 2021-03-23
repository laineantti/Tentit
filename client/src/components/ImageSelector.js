import { React, useState } from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import ImageSearch from '@material-ui/icons/ImageSearch'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import Checkbox from '@material-ui/core/Checkbox'
import HdIcon from '@material-ui/icons/Hd'
import Skeleton from '@material-ui/lab/Skeleton'
import { fetchImage } from './axiosreqs'

// Dialog
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

// GridTile
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        width: '100% !important',
        height: '100% !important',
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
}))

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
    const [open, setOpen] = useState(false)
    const [tileData, setTileData] = useState([])
    const classes = useStyles()
    let selectedImages = []
    let imageLoaded = []

    const getTileData = async () => {
        // hakee kuvat serveriltä ja muuntaa tietokannasta
        // saadun taulun material-ui:n tileData-muotoon
        let kuvat = []
        let kuvatMuunnettu = []
        kuvat = await fetchImage()
        for (const kuva of kuvat) {
            kuvatMuunnettu.push({
                id: kuva.id,
                img: kuva.tiedostonimi,
                title: kuva.tiedostonimi,
                author: 'tentit-app',
                cols: 2,
            })
        }
        setTileData(kuvatMuunnettu)
    }

    const handleClickOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const onkoKuvaValittu = (id) => {
        let valittu = false
        if (selectedImages.length > 0) {
            for (let i in selectedImages) {
                if (selectedImages[i] === id) {
                    valittu = true
                }
            }
        }
        return valittu
    }

    const asetaValinta = (id) => {
        selectedImages.push(id)
    }

    const poistaValinta = (id) => {
        if (selectedImages.length > 0) {
            for (let i in selectedImages) {
                if (selectedImages[i] === id) {
                    let temp = selectedImages
                    selectedImages = temp.filter(kuvan_id => kuvan_id !== id)
                }
            }
        }
    }

    return (
        <div>
            <IconButton style={{ float: "left" }} label="delete" color="primary"
                onClick={() => { handleClickOpen(); getTileData(); }}>
                <ImageSearch />
            </IconButton >
            <Dialog classes={{ paper: classes.dialogPaper }} fullWidth={true} maxWidth={'xl'} onClose={handleClose}
                aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Kuvan lisääminen {
                        location === "kysymys" ?
                            "kysymykseen" :
                            "vaihtoehtoon"
                    }.

                </DialogTitle>
                <DialogContent style={{ display: "flex", justifyContent: "center" }} dividers>
                    <div className={classes.root}>
                        <GridList cellHeight={240} className={classes.gridList}>
                            {tileData.map((tile) => (
                                <GridListTile key={tile.img} width={240} height={135}>
                                    <img style={{ overflow: imageLoaded.includes(tile.id) ? "visible" : "hidden" }}
                                        src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.img}
                                        alt={tile.title}
                                        loading="lazy"
                                        onLoad={() => { imageLoaded.push(tile.id); console.log("Valmis: " + tile.id) }}
                                    />
                                    {!imageLoaded.includes(tile.id) && <Skeleton variant="rect" width={512} height={512} />}
                                    <GridListTileBar
                                        title={<>

                                            <Checkbox
                                                color="primary"
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                onClick={() => {
                                                    onkoKuvaValittu(tile.id) ? poistaValinta(tile.id) : asetaValinta(tile.id);
                                                }}
                                            />
                                            {tile.title}
                                        </>}
                                        subtitle={<span>id: {tile.id}</span>}
                                        actionIcon={
                                            <a href={"//localhost:4000/uploads/" + tile.img} target="_blank" rel="noreferrer">
                                                <IconButton aria-label={`info about ${tile.title}`} className={classes.icon}>
                                                    <HdIcon />
                                                </IconButton>
                                            </a>
                                        }
                                    />
                                </GridListTile>
                            ))}
                        </GridList>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        handleClose()

                    }} color={"secondary"}>
                        {
                            selectedImages.length === 1 ?
                                "Lisää kuva"
                                : "Lisää kuvat"
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
