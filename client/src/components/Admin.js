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

var path = null
var default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

switch (environment) {
    case 'production':
        path = 'https://tentti-fullstack.herokuapp.com/'
        break
    case 'development':
        path = 'http://localhost:4000/'
        break
    case 'test':
        path = 'http://localhost:4000/'
        break
    default:
        throw default_error
}

function App() {
    const storeContext = useContext(store)
    const { state } = storeContext
    const { dispatch } = storeContext
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const classes = useStyles()
    
    useEffect(() => {
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
    }, [])

    const lisaaKysymys = async () => {
        try {
            console.log(path + "lisaa_kysymys/" + currentDatabaseExamIdChanged)
            await axios.post(path + "lisaa_kysymys/" + currentDatabaseExamIdChanged)
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({ type: "add_card", data: { examIndex: currentExamIndex } })
    }

    const lisaaVaihtoehto = async (cardIndex, kysymys_id) => {
        try {
            console.log(path + "lisaa_vaihtoehto/" + kysymys_id)
            await axios.post(path + "lisaa_vaihtoehto/" + kysymys_id)
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({ type: "add_choise", data: { cardIndex: cardIndex, examIndex: currentExamIndex } })
    }

    const oikeaValintaMuuttui = async (kysymys_id, checkedValue, vaihtoehto_id, listItemIndex) => {
        try {
            await axios.put(path + "paivita_oikea_valinta/"
                + vaihtoehto_id + "/"
                + checkedValue)
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({
            type: "correct_checked_changed",
            data: {
                examIndex: currentExamIndex,
                cardIndex: kysymys_id,
                listItemIndex: listItemIndex,
                checkedValue: checkedValue
            }
        })
    }

    const lisaaTentti = async () => {
        try {
            await axios.post(path + "lisaa_tentti/")
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({ type: "add_exam" })
    }

    const currentExamIndexChanged = (value) => {
        setCurrentExamIndex(value)
    }

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
                                                <TextField key={uuid()} style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}
                                                    onChange={(event) => dispatch({
                                                        type: "card_label_changed",
                                                        data: {
                                                            newCardLabel: event.target.value,
                                                            examIndex: currentExamIndex,
                                                            cardIndex: cardIndex
                                                        }
                                                    })}
                                                    value={card.lause} />
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
                                onClick={() => lisaaKysymys()}>
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