import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import {
    Card, CardContent, CardMedia, Container, Button, Badge,
    List, ListItem, Box, Checkbox, CssBaseline, IconButton
} from '@material-ui/core'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import ListSubheader from '@material-ui/core/ListSubheader'
/* import GridListTileBar from '@material-ui/core/GridListTileBar' */
import Skeleton from '@material-ui/lab/Skeleton'
import ImageIcon from '@material-ui/icons/Image'
import CloseIcon from '@material-ui/icons/Close'
import { strings } from './Locale'
import { fetchData, valintaMuuttui } from './axiosreqs'
import CodeComponent from './CodeComponent'
import { store } from './store.js'
import { MainContext } from './globalContext.js'
import { idToIndex } from './helpers'

function App({ currentUser, currentExamId, setCurrentExamId, currentExamIndex, setCurrentExamIndex, kaikkiKysymykset, rows, setRows }) {

    const { globalShowAllCardImages, globalShowAllChoiseImages } = useContext(MainContext)
    const [showAllCardImages, setShowAllCardImages] = globalShowAllCardImages
    const [showAllChoiseImages, setShowAllChoiseImages] = globalShowAllChoiseImages

    const { state, dispatch } = useContext(store)
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
    const [currentCourse, setCurrentCourse] = useState(1)
    const [imageLoaded, setImageLoaded] = useState([])
    const classes = useStyles()

    const allCorrect = (cardChoisesArray) => {
        cardChoisesArray.forEach((choise, i) =>
            (choise.oikea_vastaus === null) && (cardChoisesArray[i].oikea_vastaus = false)
        )
        return (cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length === cardChoisesArray.length)
    }


    useEffect(() => {           // tekee tämän kun Useriin tullaan
            fetchData(currentUser, dispatch, false) // admin_sivulla? --> true/false
    }, [currentUser])           

    const kysymysLista = (currentExamIndex) => {
        let lista = kaikkiKysymykset
        state[currentExamIndex].kysymykset.map((item, kysymysIndex) => {
            lista.map((listaItem, listaId) => {
                if (listaItem.id === item.id) {
                    lista.splice(listaId, 1)
                }
            })
        })
        return (lista)
    }

    return (
        <>
            <Box>
                <CssBaseline />
                <Container key="container1_user" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                    component="main">
                    {idToIndex(state, currentExamId, setCurrentExamIndex)}
                    {currentExamIndex >= 0
                        && state
                        && state[currentExamIndex]
                        && state[currentExamIndex].id
                        && state[currentExamIndex].kysymykset
                        ? (<>
                            <h2>{state[currentExamIndex].nimi}</h2>
                            {Object.values(state[currentExamIndex].kysymykset)
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <p className="label" style={{ whiteSpace: "pre-wrap" }}>
                                                    <CodeComponent questionString={card.lause} />
                                                </p>
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
                                                                {!imageLoaded.includes(tile.id) && <Skeleton variant="rect" width={512} height={512} />}
                                                            </GridListTile>
                                                        ))}
                                                    </GridList>
                                                </div>
                                                {Object.values(card.vaihtoehdot).map((listItem, listItemIndex) => (
                                                    <>
                                                        <ListItem key={uuid()}>
                                                            <Checkbox checked={listItem.vastaus} disabled={showCorrectAnswers}
                                                                onChange={(event) => {
                                                                    valintaMuuttui(
                                                                        cardIndex, event.target.checked,
                                                                        listItem.id, listItemIndex,
                                                                        state[currentExamIndex].id,
                                                                        currentUser, currentCourse,
                                                                        currentExamIndex, dispatch)
                                                                }}
                                                            />
                                                            {showCorrectAnswers && <GreenCheckbox disabled checked={listItem.oikea_vastaus} color="primary" />}
                                                            <p style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                {listItem.vaihtoehto}
                                                            </p>
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
                                                                            {!imageLoaded.includes(tile.id) && <Skeleton variant="rect" width={512} height={512} />}
                                                                        </GridListTile>
                                                                    ))}
                                                                </GridList>
                                                            </div>
                                                        </ListItem>
                                                    </>
                                                ))}
                                            </List>
                                        </CardContent>
                                        {(showCorrectAnswers && (allCorrect(Object.values(card.vaihtoehdot))) ? (
                                            <CardMedia className={classes.cover}>
                                                <img className="image" src="/images/selma.png"
                                                    height="30px" width="30px" alt="Selma" />
                                            </CardMedia>
                                        ) : (null))}
                                    </Card>
                                )
                            }

                            <Button style={{ marginTop: "10px", marginRight: "10px" }} name="vastaukset" variant="contained" color="primary"
                                onClick={() => (
                                    (showCorrectAnswers ? setShowCorrectAnswers(false) : setShowCorrectAnswers(true))
                                )}>{strings.nayta} {strings.vastaukset}</Button>
                        </>
                        )
                        : (
                            <>
                                {Object.values(state).map((exam, examIndex) =>
                                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                                        setCurrentExamIndex(examIndex)
                                        setCurrentExamId(exam.id)
                                        setRows(kysymysLista(examIndex))
                                    }}>
                                        {exam.nimi}
                                    </ExamButton>
                                )}
                            </>)}
                </Container>
            </Box>
        </>
    )
}

export default App