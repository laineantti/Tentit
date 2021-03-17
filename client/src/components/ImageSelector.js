import { React, useState, /* useContext */ } from 'react'
/* import { store } from './store.js' */
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
import HdIcon from '@material-ui/icons/Hd';
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
        width: '100%',
        height: '100%',
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
    /* const { state, dispatch } = useContext(store) */
    const [tileData, setTileData] = useState([])
    /* const [loading, setLoading] = useState(false) */
    const [open, setOpen] = useState(false)
    const classes = useStyles()

    const getTileData = async () => {
        /* setLoading(true) */
        // hakee kuvat serveriltä ja muuntaa tietokannasta
        // saadun taulun material-ui:n tileData-muotoon
        let kuvat = []
        let kuvatMuunnettu = []
        kuvat = await fetchImage()
        /* console.log(kuvat) */
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
        /* setLoading(false) */
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
            <Dialog fullWidth={true} maxWidth={'xl'} onClose={handleClose}
                aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Kuvan lisääminen {
                        location === "kysymys" ?
                            "kysymykseen" :
                            "vaihtoehtoon"
                    }.
                </DialogTitle>
                <DialogContent dividers>
                    <div className={classes.root}>
                        <GridList cellHeight={180} className={classes.gridList}>
                            {/* <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                                <ListSubheader component="div">December</ListSubheader>
                            </GridListTile> */}
                            {tileData.map((tile) => (
                                <GridListTile key={tile.img}>
                                    <img src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.img} alt={tile.title} />
                                    <GridListTileBar
                                        title={tile.title}
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
