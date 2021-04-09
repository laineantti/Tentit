import { React, useState, useEffect, useContext, useRef, Fragment } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
/* import axios from 'axios' */
import {
    Card, CardContent, TextField, Container, Badge,
    List, ListItem, Box, Icon, CssBaseline, IconButton, MenuItem
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
import DeleteCardDialog from './DeleteCardDialog'
import { DataGrid } from '@material-ui/data-grid';
import { store } from './store.js'
import { MainContext } from './globalContext.js'
import {
    fetchData,
    kysymysJaAihe,
    /* valintaMuuttui, */
    haeAiheet,
    lisaaKysymys,
    lisaaKysymysTenttiin,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    poistaKuvanLiitos,
    muutaTentti,
    muutaKysymys,
    muutaKysymyksenAihe,
    lisaaKysymykselleUusiAihe,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos
} from './axiosreqs'
import CodeComponent from './CodeComponent'
import ImageSelector from './ImageSelector'
import { hakuId, idToIndex } from './helpers'


function App({ currentUser, currentExamId, setCurrentExamId, currentExamIndex, setCurrentExamIndex, kaikkiKysymykset, setKaikkiKysymykset, rows, setRows }) {

    const { globalShowAllCardImages, globalShowAllChoiseImages } = useContext(MainContext)
    const [showAllCardImages, setShowAllCardImages] = globalShowAllCardImages
    const [showAllChoiseImages, setShowAllChoiseImages] = globalShowAllChoiseImages

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', flex: 0.25 },
        { field: 'lause', headerName: 'Kysymys', flex: 1.5 },
        { field: 'aihe', headerName: 'Aihealue', flex: 0.75 },
    ];


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
    // const [kaikkiKysymykset, setKaikkiKysymykset] = useState([])
    const [kaikkiAiheet, setKaikkiAiheet] = useState([])
    const [dataGridSelection, setDataGridSelection] = useState([])
    const [lisaaAihe, setLisaaAihe] = useState([])
    // const [rows, setRows] = useState([])
    const classes = useStyles()


    useEffect(() => {
        fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
        kysymysJaAihe(setKaikkiKysymykset)
        haeAiheet(setKaikkiAiheet)
    }, [currentUser, setKaikkiKysymykset, dispatch, newExamId, newCardId, newChoiseId, currentExamIndex, rows, newImageId])

    const [examName, setExamName] = useState(hakuId(state, currentExamId, currentExamIndex))

    const kysymysLista = (currentExamIndex) => {
        let lista = kaikkiKysymykset
        state[currentExamIndex].kysymykset.forEach((item, kysymysIndex) => {
            lista.forEach((listaItem, listaId) => {
                if (listaItem.id === item.id) {
                    lista.splice(listaId, 1)
                }
            })
        })
        return (lista)
    }

    useEffect(() => {
        setLisaaAihe([])
    }, [])

    useEffect(() => {
        setCurrentExamIndex(idToIndex(state, currentExamId))
    }, [state, currentExamId])

    let textInput = useRef(null)

    return (
        currentExamIndex >= 0
            && state
            && state[currentExamIndex]
            && state[currentExamIndex].id
            && state[currentExamIndex].kysymykset
            && examName
            ?
            <Box key={uuid()}>
                <CssBaseline />
                <Container key={uuid()} style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                    component="main">

                    <h2 key={uuid()}>
                        <TextField key={uuid()} type="text" style={{ width: "85%" }} value={examName} id={state[currentExamIndex].id}
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
                        <DeleteExamDialog key={uuid()}
                            /* tentin poistonappi */
                            currentExamIndex={currentExamIndex}
                            setCurrentExamIndex={setCurrentExamIndex}
                            currentDatabaseExamIdChanged={currentDatabaseExamIdChanged}
                        />

                    </h2>

                    {/* {console.log("state[currentExamIndex].id (tietokannan tentin id): ", state[currentExamIndex].id)}
                                {console.log("currentExamIndex (taulukon index): ", currentExamIndex)} */}
                    {state[currentExamIndex].kysymykset
                        .map((card, cardIndex) =>
                            <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                <CardContent key={uuid()} style={{ width: "100%" }} className={classes.content}>
                                    <List key={uuid()}>
                                        <CodeComponent key={uuid()} style={{ width: "100%" }} questionString={card.lause} background="darkBlue" />
                                        <ImageSelector key={uuid()}
                                            examIndex={currentExamIndex}
                                            cardIndex={cardIndex}
                                            sijainti="kysymys"
                                            setNewImageId={setNewImageId}
                                        />
                                        <TextField key={uuid()} multiline type="text" style={{ minWidth: "93%" }} defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                            muutaKysymys(dispatch, currentExamIndex, event.target.value, card.id, cardIndex)
                                        }}>
                                        </TextField>
                                        <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                            color="primary" onClick={() => {
                                                poistaKysymyksenLiitos(dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id)
                                                let addRow = [{
                                                    id: card.id,
                                                    lause: card.lause,
                                                    aihe: card.aihe
                                                }]
                                                setRows([...rows, ...addRow])
                                            }}>
                                            <DeleteIcon />
                                        </IconButton >
                                        {lisaaAihe.includes(card.id) ?
                                            <TextField key={uuid()}
                                                type="text"
                                                defaultValue={""}
                                                inputRef={textInput}
                                                onBlur={(event) => {
                                                    if (event.target.value) {
                                                        lisaaKysymykselleUusiAihe(dispatch, currentExamIndex, event.target.value, card.id, cardIndex, kaikkiAiheet, setKaikkiAiheet)
                                                        console.log("Ja eikun uusi aihe " + event.target.value + " talteen!")
                                                        setLisaaAihe([])
                                                    } else {
                                                        setLisaaAihe([])
                                                    }
                                                }}>

                                            </TextField>
                                            :
                                            <span key={uuid()}>{card.aihe}</span>
                                        }
                                        <TextField key={uuid()} style={{ minWidth: "2%" }}
                                            value={''}
                                            select
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    muutaKysymyksenAihe(dispatch, currentExamIndex, event.target.value, card.id, cardIndex, kaikkiAiheet)
                                                } else {
                                                    setLisaaAihe(lisaaAihe => [...lisaaAihe, card.id])
                                                    setTimeout(() => { textInput.current.focus() }, 100)
                                                }
                                            }}
                                            InputProps={{ disableUnderline: true }}>
                                            {kaikkiAiheet.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.aihe}
                                                </MenuItem>
                                            ))}
                                            <MenuItem key={uuid()}>
                                                ...lisää aihe
                                            </MenuItem>
                                            Focus TextField
                                        </TextField><br />
                                        <div style={{ paddingTop: "30px" }} className={classes.root}>
                                            <GridList cellHeight={150} style={{ width: "100%" }}>
                                                <GridListTile key={uuid()} cols={2} style={{ height: 'auto' }}>
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
                                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: imageLoaded.includes(tile.id) ? "block" : "none" }}
                                                                src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                alt={tile.tiedostonimi}
                                                                /* loading="lazy" */
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
                                            <Fragment key={uuid()}>
                                                <ListItem key={uuid()}><CodeComponent key={uuid()} style={{ width: "100%" }} questionString={listItem.vaihtoehto} /></ListItem>
                                                <ListItem key={uuid()}>
                                                    <ImageSelector key={uuid()}
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
                                                            <GridListTile key={uuid()} cols={2} style={{ height: 'auto' }}>
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
                                                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: imageLoaded.includes(tile.id) ? "block" : "none" }}
                                                                            src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                            alt={tile.tiedostonimi}
                                                                            /* loading="lazy" */
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
                                            </Fragment>
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

                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <IconButton
                            onClick={() => {
                                if (dataGridSelection.length > 0) {
                                    console.log(dataGridSelection)
                                    dataGridSelection.forEach((item, kysymysIndex) => {
                                        setNewCardId(lisaaKysymysTenttiin(item, state[currentExamIndex].id))
                                    })
                                    setRows(rows.filter((row) => !dataGridSelection.includes(row.id)))
                                    setDataGridSelection([])
                                } else {
                                    setNewCardId(lisaaKysymys(currentDatabaseExamIdChanged, dispatch, currentExamIndex))
                                    setRows(rows.filter((row) => !dataGridSelection.includes(row.id)))
                                }
                            }
                            }>
                            <Icon>add_circle</Icon>
                        </IconButton>
                        <DeleteCardDialog
                            currentExamIndex={currentExamIndex}
                            dataGridSelection={dataGridSelection}
                            setDataGridSelection={setDataGridSelection}
                            setRows={setRows}
                            rows={rows}
                        />
                    </div>
                    <Card style={{ marginTop: "10px" }} className={classes.root}>
                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid columns={columns} rows={rows} pageSize={7} checkboxSelection
                                onSelectionModelChange={(newSelection) => {
                                    setDataGridSelection(newSelection.selectionModel)
                                }}
                            />
                        </div>
                    </Card>

                </Container>
            </Box >
            :
            <Box key={uuid()}>
                <CssBaseline key={uuid()} />
                <Container key={uuid()} style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                    component="main">
                    {Object.values(state).map((exam, examIndex) =>
                        <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                            setCurrentExamIndex(examIndex)
                            if (exam.id) {
                                setCurrentDatabaseExamIdChanged(exam.id)
                                setCurrentExamId(exam.id)
                                setExamName(exam.nimi)
                                setRows(kysymysLista(examIndex))
                            } else {
                                setCurrentDatabaseExamIdChanged(newExamId)
                            }
                        }}>
                            {exam.nimi}
                        </ExamButton>
                    )}
                    <IconButton key={uuid()} onClick={() => {
                        setNewExamId(lisaaTentti(dispatch, currentUser))
                    }}>
                        <Icon key={uuid()}> add_circle</Icon>
                    </IconButton>
                </Container>
            </Box >)

}

export default App