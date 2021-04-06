import { React, useState, useContext, useEffect } from 'react'
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
import Skeleton from '@material-ui/lab/Skeleton'
import { fetchImage, liitaKuvaKysymykseen, liitaKuvaVaihtoehtoon, } from './axiosreqs'
import { store } from './store.js'
import uuid from 'react-uuid'

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
        width: "490px",
    },
    gridList: {
        width: "480px",
        height: "470px",
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

export default function ImageSelector({ examIndex, cardIndex, listItemIndex, sijainti, setNewImageId }) {
    const { state, dispatch } = useContext(store)
    const [open, setOpen] = useState(false)
    const [tileData, setTileData] = useState([])
    const [imageLoaded, setImageLoaded] = useState([])
    const [selectedImages, setSelectedImages] = useState([])
    const [limit/* , setLimit */] = useState(6)
    const [offset, setOffset] = useState(0)
    const [fullCount, setFullCount] = useState(0)
    const classes = useStyles()

    useEffect(() => {
        const getTileData = async () => {
            // hakee kuvat serveriltä ja muuntaa tietokannasta
            // saadun taulun material-ui:n tileData-muotoon
            let kuvat = []
            let kuvatMuunnettu = []
            kuvat = await fetchImage(limit, offset)
            if (fullCount === 0) {
                setFullCount(kuvat[0].full_count)
            }
            if (kuvat.length > 0) {
                for (const kuva of kuvat) {
                    kuvatMuunnettu.push({
                        id: kuva.id,
                        img: kuva.tiedostonimi,
                        title: kuva.tiedostonimi,
                        author: 'tentit-app',
                        cols: 2,
                    })
                }
            }
            setTileData(kuvatMuunnettu)
            setImageLoaded([])
        }
        getTileData()
        /* console.log("limit : " + limit + ". offset: " + offset + ". fullCount: " + fullCount + ".") */
    }, [offset, limit, fullCount])

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
        setSelectedImages(selectedImages => [...selectedImages, id])
    }

    const poistaValinta = (id) => {
        if (selectedImages.length > 0) {
            for (let i in selectedImages) {
                if (selectedImages[i] === id) {
                    const filteredSelectedImages = selectedImages.filter(kuvan_id => kuvan_id !== id)
                    setSelectedImages(filteredSelectedImages)
                }
            }
        }
    }

    return (
        <div>
            <IconButton style={{ float: "left" }} label="delete" color="primary"
                onClick={() => { handleClickOpen() }}>
                <ImageSearch />
            </IconButton >
            <Dialog classes={{ paper: classes.dialogPaper }} fullWidth={true} maxWidth={'sm'} onClose={handleClose}
                aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Kuvan lisääminen {
                        sijainti === "kysymys" ?
                            "kysymykseen" :
                            "vaihtoehtoon"
                    }.

                </DialogTitle>
                <DialogContent dividers>
                    <div className={classes.root}>
                        <GridList cellHeight={150} className={classes.gridList} cols={4}>
                            {tileData.map((tile) => (
                                <GridListTile key={uuid()} style={{ width: "240px", maxHeight: "150" }} cols={tile.cols || 1}>
                                    <a href={"//localhost:4000/uploads/" + tile.img} target="_blank" rel="noreferrer">
                                        <img style={{ width: "100%", height: "100%", objectFit: "cover", display: imageLoaded.includes(tile.id) ? "block" : "none" }}
                                            src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.img}
                                            alt={tile.title}
                                            /* loading="lazy" */
                                            onLoad={() => {
                                                !imageLoaded.includes(tile.id)
                                                    && setImageLoaded(imageLoaded => [...imageLoaded, tile.id])
                                            }}
                                        />
                                        {!imageLoaded.includes(tile.id) && <Skeleton animation="wave" variant="rect" width={512} height={512} />}
                                    </a>
                                    <GridListTileBar
                                        title={tile.title}
                                        subtitle={<span>id: {tile.id}</span>}
                                        actionIcon={
                                            <Checkbox
                                                style={{ color: "white" }}
                                                color="primary"
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                onClick={() => {
                                                    onkoKuvaValittu(tile.id) ? poistaValinta(tile.id) : asetaValinta(tile.id);
                                                }}
                                            />
                                        }
                                    />
                                </GridListTile>
                            ))}
                        </GridList>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography>Sivu {(offset / limit) + 1}/{Math.ceil(fullCount / limit)}</Typography>
                    <Button disabled={offset > 0 ? false : true} autoFocus onClick={() => {
                        let tempOffset = (offset - limit)
                        setOffset(tempOffset)
                    }} color="default">
                        {
                            ("Edellinen")
                        }
                    </Button>
                    <Button disabled={offset < (fullCount - limit) ? false : true} autoFocus onClick={() => {
                        let tempOffset = (offset + limit)
                        setOffset(tempOffset)

                    }} color="default">
                        {
                            ("Seuraava")
                        }
                    </Button>
                    <Button autoFocus onClick={() => {
                        let kysymys_id = state[examIndex].kysymykset[cardIndex].id
                        if (sijainti === "kysymys") {
                            setNewImageId(liitaKuvaKysymykseen(dispatch, examIndex, cardIndex, selectedImages, kysymys_id))
                        } else {
                            let vaihtoehto_id = state[examIndex].kysymykset[cardIndex].vaihtoehdot[listItemIndex].id
                            setNewImageId(liitaKuvaVaihtoehtoon(dispatch, examIndex, cardIndex, selectedImages, kysymys_id, listItemIndex, vaihtoehto_id))
                        }
                        handleClose()
                    }} color={"secondary"}>
                        {
                            selectedImages.length <= 1 ?
                                "Lisää kuva"
                                : "Lisää kuvat (" + selectedImages.length + ")"
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
            </Dialog >
        </div >
    )
}
