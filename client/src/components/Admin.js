import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import axios from 'axios'
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
    currentExamIndexChanged
} from './axiosreqs'
import { autentikoitu } from './helpers'

function App() {
    const storeContext = useContext(store)
    const { state } = storeContext
    const { dispatch } = storeContext
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const [currentUser, setCurrentUser] = useState("")
    const classes = useStyles()

    useEffect(() => {
        console.log("kukkuu: ", autentikoitu())
        fetchUser(setCurrentUser, autentikoitu())
        fetchData(currentUser, autentikoitu(), dispatch)
    }, [currentUser])

    /* useEffect(() => {
        const fetchData = async () => {
            try {
                let tentit_data = await axios.get(path + "tentti")
                let tentit = tentit_data.data

                if (tentit.length > 0) {
                    // käydään tentit läpi
                    for (var i = 0; i < tentit.length; i++) {
                        // haetaan tentin kysymykset
                        tentit[i].kysymykset = []
                        let kysymykset_taulu = await axios.get(path + "tentin_kysymykset/" + tentit[i].id)
                        tentit[i].kysymykset = kysymykset_taulu.data
                        // käydään tentin kysymykset läpi
                        for (var j = 0; j < tentit[i].kysymykset.length; j++) {
                            // haetaan kysymyksen vaihtoehdot
                            tentit[i].kysymykset[j].vaihtoehdot = []
                            let vaihtoehdot_taulu =
                                await axios.get(path + "kysymyksen_vaihtoehdot/" + tentit[i].kysymykset[j].id)
                            tentit[i].kysymykset[j].vaihtoehdot = vaihtoehdot_taulu.data
                        }
                    }
                    dispatch({ type: "INIT_DATA", data: tentit })
                } else {
                    throw console.log("Dataa ei saatu palvelimelta.")
                }
            }
            catch (exception) {
                console.log(exception)
            }
        }
        fetchData()
    }, []) */

    return (
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                        currentExamIndexChanged(examIndex)
                        setCurrentDatabaseExamIdChanged(exam.id)
                    }}>
                        {exam.nimi}
                    </ExamButton>
                )}
                <IconButton onClick={() => { lisaaTentti() }}>
                    <Icon>add_circle</Icon>
                </IconButton>
                {currentExamIndex >= 0 &&
                    (
                        <>
                            <h2>{state[currentExamIndex].nimi}</h2>
                            {state[currentExamIndex].kysymykset
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <TextField type="text" defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                                    muutaKysymys(event.target.value, card.id, cardIndex)
                                                }}>
                                                </TextField>
                                                <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                    color="primary" onClick={() => dispatch(
                                                        {
                                                            type: "card_deleted", data: {
                                                                examIndex: currentExamIndex,
                                                                cardIndex: cardIndex
                                                            }
                                                        }
                                                    )}>
                                                    <DeleteIcon />
                                                </IconButton >
                                                {card.vaihtoehdot.map((listItem, listItemIndex) => (
                                                    <ListItem key={uuid()}>
                                                        <GreenCheckbox checked={listItem.oikea_vastaus} color="primary"
                                                            onChange={(event) => {
                                                                oikeaValintaMuuttui(cardIndex, event.target.checked, listItem.id, listItemIndex, state[currentExamIndex].id)
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
                                                <IconButton onClick={() => lisaaVaihtoehto(cardIndex, card.id)}>
                                                    <Icon>add_circle</Icon>
                                                </IconButton>
                                            </List>
                                        </CardContent>
                                    </Card>
                                )
                            }
                            <IconButton style={{ float: "right" }}
                                onClick={() => lisaaKysymys(currentDatabaseExamIdChanged)}>
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