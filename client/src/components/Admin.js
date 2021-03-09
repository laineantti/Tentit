import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
/* import axios from 'axios' */
import {
    Card, CardContent, Container, List, ListItem, Box, Icon,
    IconButton, CssBaseline, TextField, Input
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import DeleteExamDialog from './DeleteExamDialog'
import { store } from './store.js'
import {
    fetchUser,
    fetchData,
    /* valintaMuuttui, */
    lisaaKysymys,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    haeTentinLuojanId,
    muutaTentti,
    muutaKysymys,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos
} from './axiosreqs'
import CodeComponent from './CodeComponent'

function App({ currentUser, setCurrentUser, currentUserName, setCurrentUserName }) {
    const { state, dispatch } = useContext(store)
    // const storeContext = useContext(store)
    // const { state } = storeContext
    // const { dispatch } = storeContext
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const [newExamId, setNewExamId] = useState(-1)
    const [newCardId, setNewCardId] = useState(-1)
    const [newChoiseId, setNewChoiseId] = useState(-1)
    const [examName, setExamName] = useState("")
    const classes = useStyles()

    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser, setCurrentUserName)
        } else {
            fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
        }
    }, [currentUser, newExamId, newCardId, newChoiseId])

    return (
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                        setCurrentExamIndex(examIndex)
                        if (exam.id) {
                            setCurrentDatabaseExamIdChanged(exam.id)
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
                {currentExamIndex >= 0 &&
                    (
                        <>
                            <h2>
                                <TextField type="text" value={examName} /*value={state[currentExamIndex].nimi}*/ id={state[currentExamIndex].id}
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
                                <DeleteExamDialog
                                    /* tentin poistonappi */
                                    currentExamIndex={currentExamIndex}
                                    /* setCurrentExamIndex={setCurrentExamIndex} */
                                    currentDatabaseExamIdChanged={currentDatabaseExamIdChanged}
                                />
                            </h2>

                            {/* {console.log("state[currentExamIndex].id (tietokannan tentin id): ", state[currentExamIndex].id)}
                            {console.log("currentExamIndex (taulukon index): ", currentExamIndex)} */}
                            {state[currentExamIndex].kysymykset
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <CodeComponent style={{ width: "100%" }} questionString={card.lause} background="darkBlue" />
                                                <TextField multiline type="text" style={{ minWidth: "93%" }} defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                                    muutaKysymys(dispatch, currentExamIndex, event.target.value, card.id, cardIndex)
                                                }}>
                                                </TextField>
                                                <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                    color="primary" onClick={() => poistaKysymyksenLiitos(dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id)}>
                                                    <DeleteIcon />
                                                </IconButton >
                                                {card.vaihtoehdot.map((listItem, listItemIndex) => (
                                                    <>
                                                        <ListItem key={uuid()}><CodeComponent style={{ width: "100%" }} questionString={listItem.vaihtoehto} /></ListItem>
                                                        <ListItem key={uuid()}>
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
                                                                <DeleteIcon /></IconButton >
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
                }
            </Container>
        </Box >
    )
}

export default App