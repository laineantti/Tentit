import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
/* import axios from 'axios' */
import {
    Card, CardContent, Container, List, ListItem, Box, Icon,
    IconButton, CssBaseline, TextField
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { store } from './store.js'
import {
    fetchUser,
    fetchData,
    /* valintaMuuttui, */
    lisaaKysymys,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    muutaKysymys,
    poistaKysymyksenLiitos
} from './axiosreqs'

function App() {
    const { state, dispatch } = useContext(store)
    // const storeContext = useContext(store)
    // const { state } = storeContext
    // const { dispatch } = storeContext
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const [currentUser, setCurrentUser] = useState("")
    const classes = useStyles()

    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser)
        } else {
            fetchData(currentUser, dispatch, true) // admin? --> true/false
        }
    }, [currentUser])

    return (
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                        setCurrentExamIndex(examIndex)
                        setCurrentDatabaseExamIdChanged(exam.id)
                    }}>
                        {exam.nimi}
                    </ExamButton>
                )}
                <IconButton onClick={() => { lisaaTentti(dispatch) }}>
                    <Icon>add_circle</Icon>
                </IconButton>
                {currentExamIndex >= 0 &&
                    (
                        <>
                            <h2>{state[currentExamIndex].nimi}</h2>
                            {/* {console.log("state[currentExamIndex].id (tietokannan tentin id): ", state[currentExamIndex].id)}
                            {console.log("currentExamIndex (taulukon index): ", currentExamIndex)} */}
                            {state[currentExamIndex].kysymykset
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <TextField type="text" defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                                    muutaKysymys(dispatch, currentExamIndex, event.target.value, card.id, cardIndex)
                                                }}>
                                                </TextField>
                                                <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                    color="primary" onClick={() => poistaKysymyksenLiitos(dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id)}>
                                                    <DeleteIcon />
                                                </IconButton >
                                                {card.vaihtoehdot.map((listItem, listItemIndex) => (
                                                    <ListItem key={uuid()}>
                                                        <GreenCheckbox checked={listItem.oikea_vastaus} color="primary"
                                                            onChange={(event) => {
                                                                oikeaValintaMuuttui(dispatch, currentExamIndex, cardIndex, event.target.checked, listItem.id, listItemIndex, state[currentExamIndex].id)
                                                            }} />
                                                        <TextField key={uuid()} style={{
                                                            minWidth: "600px", overflow: "hidden",
                                                            textOverflow: "ellipsis"
                                                        }} value={listItem.vaihtoehto}
                                                            onChange={(event) => dispatch(
                                                                {
                                                                    type: "choise_changed", data: {
                                                                        examIndex: currentExamIndex,
                                                                        cardIndex: cardIndex,
                                                                        listItemIndex: listItemIndex,
                                                                        newChoise: event.target.value
                                                                    }
                                                                }
                                                            )} />
                                                        <IconButton style={{ float: "right" }} label="delete" color="primary"
                                                            onClick={() => dispatch(
                                                                {
                                                                    type: "choise_deleted", data: {
                                                                        examIndex: currentExamIndex,
                                                                        cardIndex: cardIndex,
                                                                        listItemIndex: listItemIndex
                                                                    }
                                                                }
                                                            )}>
                                                            <DeleteIcon /></IconButton >
                                                    </ListItem>
                                                ))}
                                                <IconButton onClick={() => lisaaVaihtoehto(dispatch, cardIndex, card.id, currentExamIndex)}>
                                                    <Icon>add_circle</Icon>
                                                </IconButton>
                                            </List>
                                        </CardContent>
                                    </Card>
                                )
                            }
                            <IconButton style={{ float: "right" }}
                                onClick={() => lisaaKysymys(currentDatabaseExamIdChanged, dispatch, currentExamIndex)}>
                                <Icon>add_circle</Icon>
                            </IconButton>
                        </>
                    )
                }
            </Container>
        </Box>
    )
}

export default App