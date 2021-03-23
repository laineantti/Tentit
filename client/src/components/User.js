import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import {
    Card, CardContent, CardMedia, Container, Button,
    List, ListItem, Box, Checkbox, CssBaseline, IconButton
} from '@material-ui/core'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import { strings } from './Locale'
import { fetchUser, fetchData, valintaMuuttui } from './axiosreqs'
import CodeComponent from './CodeComponent'
import { store } from './store.js'
import { idToIndex } from './helpers'

function App({ currentUser, setCurrentUser, setCurrentUserName, currentExamId, setCurrentExamId,
    currentExamIndex, setCurrentExamIndex }) {
    const { state, dispatch } = useContext(store)
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
    const [currentCourse, setCurrentCourse] = useState(1)
    const classes = useStyles()

    const allCorrect = (cardChoisesArray) => {
        cardChoisesArray.forEach((choise, i) =>
            (choise.oikea_vastaus === null) && (cardChoisesArray[i].oikea_vastaus = false)
        )
        return (cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length === cardChoisesArray.length)
    }


    useEffect(() => {           // tekee tämän kun Useriin tullaan
        if (!currentUser) {     // hakee käyttäjän jos currentUser vielä "", eli eka kierros
            fetchUser(setCurrentUser, setCurrentUserName)   // asettaa currentUserin arvoksi kirjautuneen käyttäjän
        } else {                // toisella kierroksella haetaan käyttäjän data
            fetchData(currentUser, dispatch, false) // admin_sivulla? --> true/false
        }
    }, [currentUser])           // tekee toisen kierroksen kun käyttäjän arvo asetettu


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
                                                <div style={{ padding: "25px" }} className={classes.root}>
                                                    <GridList cellHeight={68} className={classes.gridList}>
                                                        {card.kuvat.map((tile) => (
                                                            <GridListTile key={uuid()} width={240} height={240}>
                                                                {console.log(tile)}
                                                                <img
                                                                    src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                    alt={tile.tiedostonimi}
                                                                    loading="lazy"
                                                                />
                                                                <GridListTileBar
                                                                    title={<>
                                                                        {tile.tiedostonimi}
                                                                    </>}
                                                                    subtitle={<span>id: {tile.id}</span>}
                                                                    actionIcon={
                                                                        <a href={"//localhost:4000/uploads/" + tile.tiedostonimi} target="_blank" rel="noreferrer">
                                                                            <IconButton aria-label={`info about ${tile.tiedostonimi}`} className={classes.icon}>
                                                                                <ZoomInIcon style={{ color: "white" }} />
                                                                            </IconButton>
                                                                        </a>
                                                                    }
                                                                />
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
                                                            <div style={{ padding: "25px" }} className={classes.root}>
                                                                <GridList cellHeight={68} className={classes.gridList}>
                                                                    {listItem.kuvat.map((tile) => (
                                                                        <GridListTile key={uuid()} width={240} height={240}>
                                                                            <img
                                                                                src={"//localhost:4000/uploads_thumbnails/thumbnail_" + tile.tiedostonimi}
                                                                                alt={tile.tiedostonimi}
                                                                                loading="lazy"
                                                                            />
                                                                            <GridListTileBar
                                                                                title={<>
                                                                                    {tile.tiedostonimi}
                                                                                </>}
                                                                                subtitle={<span>id: {tile.id}</span>}
                                                                                actionIcon={
                                                                                    <a href={"//localhost:4000/uploads/" + tile.tiedostonimi} target="_blank" rel="noreferrer">
                                                                                        <IconButton aria-label={`info about ${tile.tiedostonimi}`} className={classes.icon}>
                                                                                            <ZoomInIcon style={{ color: "white" }} />
                                                                                        </IconButton>
                                                                                    </a>
                                                                                }
                                                                            />
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