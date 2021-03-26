import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
/* import axios from 'axios' */
import {
    Card, CardContent, TextField, Container, Badge,
    List, ListItem, Box, Icon, CssBaseline, IconButton
} from '@material-ui/core'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import ListSubheader from '@material-ui/core/ListSubheader'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import Skeleton from '@material-ui/lab/Skeleton'
import ImageIcon from '@material-ui/icons/Image'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import DeleteExamDialog from './DeleteExamDialog'
import { store } from './store.js'
import { MainContext } from './globalContext.js'
import {
    fetchUser,
    fetchData,
    /* valintaMuuttui, */
    lisaaKysymys,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    poistaKuvanLiitos,
    muutaTentti,
    muutaKysymys,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos
} from './axiosreqs'
import CodeComponent from './CodeComponent'
import { idToIndex, hakuId } from './helpers'
import ImageSelector from './ImageSelector'

function App({ currentUser, setCurrentUser, setCurrentUserName, currentExamId, setCurrentExamId, currentExamIndex, setCurrentExamIndex }) {

    const { globalShowAllCardImages, globalShowAllChoiseImages } = useContext(MainContext)
    const [showAllCardImages, setShowAllCardImages] = globalShowAllCardImages
    const [showAllChoiseImages, setShowAllChoiseImages] = globalShowAllChoiseImages

    const { state, dispatch } = useContext(store)
    // const storeContext = useContext(store)
    // const { state } = storeContext
    // const { dispatch } = storeContext

    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const [newExamId, setNewExamId] = useState(-1)
    const [newCardId, setNewCardId] = useState(-1)
    const [newChoiseId, setNewChoiseId] = useState(-1)
    const [newImageId, setNewImageId] = useState(-1)
    const [imageLoaded, setImageLoaded] = useState([])
    const classes = useStyles()

    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser, setCurrentUserName)
        } else {
            fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
        }
    }, [currentUser, newExamId, newCardId, newChoiseId, newImageId])


    const [examName, setExamName] = useState(hakuId(state, currentExamId, currentExamIndex, setCurrentExamIndex))

    return (
        <>
            <Box>
                <CssBaseline />
                <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                    component="main">
                    {idToIndex(state, currentExamId, setCurrentExamIndex)}
                    {currentExamIndex >= 0
                        && state
                        && state[currentExamIndex]
                        && state[currentExamIndex].id
                        && state[currentExamIndex].kysymykset
                        && examName
                        ? (

                            <>

                                <h2>
                                    <TextField type="text" value={examName} id={state[currentExamIndex].id}
                                        onChange={(event) => {
                                            setExamName(event.target.value)
                                        }}
                                        onBlur={() => {
                                            if (examName === "") {
                                                setExamName("Nimetön")
                                                muutaTentti(dispatch, currentExamIndex, state[currentExamIndex].id, "Nimetön")
                                            }
                                            muutaTentti(dispatch, currentExamIndex, state[currentExamIndex].id, examName)
                                        }}> {/* Logiikka tehty, mutta heittää [object Promise] */}
                                    </TextField> {/* {"(luoja_id: " + haeTentinLuojanId(state[currentExamIndex].id) + ")"} */}
                                </h2>
                                <DeleteExamDialog
                                    /* tentin poistonappi */
                                    currentExamIndex={currentExamIndex}
                                    setCurrentExamIndex={setCurrentExamIndex}
                                    currentDatabaseExamIdChanged={currentDatabaseExamIdChanged}
                                />

                                {/* {console.log("state[currentExamIndex].id (tietokannan tentin id): ", state[currentExamIndex].id)}
                            {console.log("currentExamIndex (taulukon index): ", currentExamIndex)} */}
                                {state[currentExamIndex].kysymykset
                                    .map((card, cardIndex) =>
                                        <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                            <CardContent style={{ width: "100%" }} className={classes.content}>
                                                <List>
                                                    <CodeComponent style={{ width: "100%" }} questionString={card.lause} background="darkBlue" />
                                                    <ImageSelector
                                                        examIndex={currentExamIndex}
                                                        cardIndex={cardIndex}
                                                        sijainti="kysymys"
                                                        setNewImageId={setNewImageId}
                                                    />
                                                    <TextField multiline type="text" style={{ minWidth: "93%" }} defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                                        muutaKysymys(dispatch, currentExamIndex, event.target.value, card.id, cardIndex)
                                                    }}>
                                                    </TextField>
                                                    <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                        color="primary" onClick={() => poistaKysymyksenLiitos(dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id)}>
                                                        <DeleteIcon />
                                                    </IconButton >
                                                    <div style={{ paddingTop: "30px" }} className={classes.root}>
                                                        <GridList cellHeight={150} style={{ width: "100%" }}>
                                                            <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                                                                <ListSubheader component="div" style={{ width: "100%" }}>
                                                                    {card.kuvat.length > 2 &&
                                                                        <IconButton style={{ float: "right" }} aria-label="expand"
                                                                            onClick={() => {
                                                                                showAllCardImages.includes(cardIndex) ?
                                                                                    setShowAllCardImages(showAllCardImages.filter(index => index !== cardIndex))
                                                                                    : setShowAllCardImages(showAllCardImages => [...showAllCardImages, cardIndex])
                                                                            }}>
                                                                            <Badge badgeContent={showAllCardImages.includes(cardIndex) ? 0 : card.kuvat.length - 2} color="primary">
                                                                                {showAllCardImages.includes(cardIndex) ?
                                                                                    <CloseIcon />
                                                                                    : <ImageIcon />
                                                                                }
                                                                            </Badge>
                                                                        </IconButton>
                                                                    }
                                                                </ListSubheader>
                                                            </GridListTile>
                                                            {card.kuvat.map((tile, tileIndex) => (
                                                                (tileIndex < 2 || showAllCardImages.includes(cardIndex)) && <GridListTile key={uuid()} style={{ width: "240px", maxHeight: "150" }}>
                                                                    <a href={"//localhost:4000/uploads/" + tile.tiedostonimi} target="_blank" rel="noreferrer">
                                                                        <img
                                                                            style={{ width: "100%", height: "100%", objectFit: "cover", overflow: imageLoaded.includes(tile.id) ? "visible" : "hidden" }}
                                                                            src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                            alt={tile.tiedostonimi}
                                                                            loading="lazy"
                                                                            onLoad={() => {
                                                                                !imageLoaded.includes(tile.id)
                                                                                    && setImageLoaded(imageLoaded => [...imageLoaded, tile.id])
                                                                            }}
                                                                            onError={(e) => { e.target.onerror = null; e.target.style.display = "none" }}
                                                                        />
                                                                    </a>
                                                                    {!imageLoaded.includes(tile.id) ?
                                                                        <Skeleton variant="rect" width={512} height={512} />
                                                                        : <GridListTileBar
                                                                            title={<>
                                                                                {<span>id: {tile.id}</span>}
                                                                            </>}
                                                                            subtitle={tile.tiedostonimi}
                                                                            actionIcon={
                                                                                <IconButton key={uuid()} style={{ color: "white", float: "right" }} label="delete"
                                                                                    color="primary" onClick={() =>
                                                                                        setNewImageId(poistaKuvanLiitos(dispatch, currentExamIndex, cardIndex, "kysymys", tile.id, card.id, tileIndex))
                                                                                    }>
                                                                                    <DeleteIcon />
                                                                                </IconButton >
                                                                            }
                                                                        />}
                                                                </GridListTile>
                                                            ))}
                                                        </GridList>
                                                    </div>
                                                    {card.vaihtoehdot.map((listItem, listItemIndex) => (
                                                        <>
                                                            <ListItem key={uuid()}><CodeComponent style={{ width: "100%" }} questionString={listItem.vaihtoehto} /></ListItem>
                                                            <ListItem key={uuid()}>
                                                                <ImageSelector
                                                                    examIndex={currentExamIndex}
                                                                    cardIndex={cardIndex}
                                                                    listItemIndex={listItemIndex}
                                                                    sijainti="vaihtoehto"
                                                                    setNewImageId={setNewImageId}
                                                                />
                                                                <GreenCheckbox checked={listItem.oikea_vastaus} color="primary"
                                                                    onChange={(event) => {
                                                                        oikeaValintaMuuttui(dispatch, currentExamIndex, cardIndex, event.target.checked, listItem.id, listItemIndex, state[currentExamIndex].id)
                                                                    }} />
                                                                <TextField multiline key={listItem.id} style={{
                                                                    minWidth: "80%", overflow: "hidden",
                                                                    textOverflow: "ellipsis"
                                                                }} defaultValue={listItem.vaihtoehto}
                                                                    onBlur={(event) => {
                                                                        muutaVaihtoehto(dispatch, currentExamIndex, event.target.value, listItem.id, cardIndex, listItemIndex)
                                                                    }} />
                                                                <IconButton style={{ float: "right" }} label="delete" color="primary"

                                                                    onClick={() => poistaVaihtoehdonLiitos(dispatch, currentExamIndex, listItem.id, cardIndex, card.id, listItemIndex)}>
                                                                    <DeleteIcon />
                                                                </IconButton >
                                                            </ListItem>
                                                            <ListItem key={uuid()}>
                                                                <div style={{ paddingLeft: "45px", width: "100%" }} className={classes.root}>
                                                                    <GridList cellHeight={150} style={{ width: "100%" }} className={classes.gridList}>
                                                                        <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                                                                            <ListSubheader component="div" style={{ width: "100%" }}>
                                                                                {listItem.kuvat.length > 2 &&
                                                                                    <IconButton style={{ float: "right" }} aria-label="expand"
                                                                                        onClick={() => {
                                                                                            showAllChoiseImages.includes(listItemIndex) ?
                                                                                                setShowAllChoiseImages(showAllChoiseImages.filter(index => index !== listItemIndex))
                                                                                                : setShowAllChoiseImages(showAllChoiseImages => [...showAllChoiseImages, listItemIndex])
                                                                                        }}>
                                                                                        <Badge badgeContent={showAllChoiseImages.includes(listItemIndex) ? 0 : listItem.kuvat.length - 2} color="primary">
                                                                                            {showAllChoiseImages.includes(listItemIndex) ?
                                                                                                <CloseIcon />
                                                                                                : <ImageIcon />
                                                                                            }
                                                                                        </Badge>
                                                                                    </IconButton>
                                                                                }
                                                                            </ListSubheader>
                                                                        </GridListTile>
                                                                        {listItem.kuvat.map((tile, tileIndex) => (
                                                                            (tileIndex < 2 || showAllChoiseImages.includes(listItemIndex)) && <GridListTile key={uuid()} style={{ width: "240px", maxHeight: "150" }}>
                                                                                <a href={"//localhost:4000/uploads/" + tile.tiedostonimi} target="_blank" rel="noreferrer">
                                                                                    <img
                                                                                        style={{ width: "100%", height: "100%", objectFit: "cover", overflow: imageLoaded.includes(tile.id) ? "visible" : "hidden" }}
                                                                                        src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                                        alt={tile.tiedostonimi}
                                                                                        loading="lazy"
                                                                                        onLoad={() => {
                                                                                            !imageLoaded.includes(tile.id)
                                                                                                && setImageLoaded(imageLoaded => [...imageLoaded, tile.id])
                                                                                        }}
                                                                                        onError={(e) => { e.target.onerror = null; e.target.style.display = "none" }}
                                                                                    />
                                                                                </a>
                                                                                {!imageLoaded.includes(tile.id) ?
                                                                                    <Skeleton variant="rect" width={512} height={512} />
                                                                                    : <GridListTileBar
                                                                                        title={<>
                                                                                            {<span>id: {tile.id}</span>}
                                                                                        </>}
                                                                                        subtitle={tile.tiedostonimi}
                                                                                        actionIcon={
                                                                                            <IconButton key={uuid()} style={{ color: "white", float: "right" }} label="delete"
                                                                                                color="primary" onClick={() =>
                                                                                                    setNewImageId(poistaKuvanLiitos(dispatch, currentExamIndex, cardIndex, "vaihtoehto", tile.id, card.id, tileIndex, listItem.id, listItemIndex))
                                                                                                }>
                                                                                                <DeleteIcon />
                                                                                            </IconButton >
                                                                                        }
                                                                                    />}
                                                                            </GridListTile>
                                                                        ))}
                                                                    </GridList>
                                                                </div>
                                                            </ListItem>
                                                        </>
                                                    ))}
                                                    <IconButton onClick={() => {
                                                        let kysymys_id = null
                                                        if (card.id) {
                                                            kysymys_id = card.id
                                                        } else {
                                                            kysymys_id = newCardId
                                                        }

                                                        setNewChoiseId(lisaaVaihtoehto(dispatch, cardIndex, kysymys_id, currentExamIndex))

                                                    }}>
                                                        <Icon>add_circle</Icon>
                                                    </IconButton>
                                                </List>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                                <IconButton style={{ float: "right" }}
                                    onClick={() => setNewCardId(lisaaKysymys(currentDatabaseExamIdChanged, dispatch, currentExamIndex))}>
                                    <Icon>add_circle</Icon>
                                </IconButton>
                            </>
                        )
                        : (
                            <>
                                {Object.values(state).map((exam, examIndex) =>
                                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                                        setCurrentExamIndex(examIndex)
                                        if (exam.id) {
                                            setCurrentDatabaseExamIdChanged(exam.id)
                                            setCurrentExamId(exam.id)
                                            setExamName(exam.nimi)
                                        } else {
                                            setCurrentDatabaseExamIdChanged(newExamId)
                                        }
                                    }}>
                                        {exam.nimi}
                                    </ExamButton>
                                )}
                                <IconButton onClick={() => {
                                    setNewExamId(lisaaTentti(dispatch, currentUser))
                                }}>
                                    <Icon>add_circle</Icon>
                                </IconButton>
                            </>)}
                </Container>
            </Box >
        </>
    )
}

export default App