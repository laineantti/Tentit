import { React, useState, useEffect, useReducer } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import axios from 'axios'
import {
    Card, CardContent, CardMedia, Container, Button,
    List, ListItem, Box, Checkbox, CssBaseline
} from '@material-ui/core'
import { strings } from './Locale'

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

function reducer(state, action) {

    let tempCopy = JSON.parse(JSON.stringify(state))

    switch (action.type) {

        case "checked_changed":
            tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                .vaihtoehdot[action.data.listItemIndex].vastaus = action.data.checkedValue
            return tempCopy

        case "INIT_DATA":
            return action.data

        default:
            throw new Error()

    }
}

function App() {
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [state, dispatch] = useReducer(reducer, [])
    const classes = useStyles()
    const currentKurssiIndex = 1
    const currentUserIndex = 1

    useEffect(() => {

        const fetchData = async () => {
            try {
                let tentit_data = await axios.get(path + "kayttajan_tentit/" + currentUserIndex)
                let tentit = tentit_data.data

                if (tentit.length > 0) {
                    // käydään tentit läpi
                    for (var i = 0; i < tentit.length; i++) {
                        // haetaan tentin kysymykset
                        tentit[i].kysymykset = []
                        let kysymykset_taulu = await axios.get(path + "tentin_kysymykset/" + tentit[i].id)
                        tentit[i].kysymykset = kysymykset_taulu.data
                        // haetaan kayttajan_vastaukset
                        let kayttajan_vastaukset =
                            await axios.get(path + "kayttajan_vastaukset/"
                                + currentUserIndex + "/" + tentit[i].id)
                        // käydään tentin kysymykset läpi
                        for (var j = 0; j < tentit[i].kysymykset.length; j++) {
                            // haetaan kysymyksen vaihtoehdot
                            tentit[i].kysymykset[j].vaihtoehdot = []
                            let vaihtoehdot_taulu =
                                await axios.get(path + "kysymyksen_vaihtoehdot/" + tentit[i].kysymykset[j].id)
                            tentit[i].kysymykset[j].vaihtoehdot = vaihtoehdot_taulu.data
                            // käydään kayttajan_vastaukset läpi
                            for (var k = 0; k < tentit[i].kysymykset[j].vaihtoehdot.length; k++) {
                                for (var l = 0; l < kayttajan_vastaukset.data.length; l++) {
                                    if (tentit[i].kysymykset[j].vaihtoehdot[k].id === kayttajan_vastaukset.data[l].vaihtoehto_id) {
                                        tentit[i].kysymykset[j].vaihtoehdot[k]
                                            .vastaus = kayttajan_vastaukset.data[l].vastaus
                                    }
                                }
                            }
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

    const valintaMuuttui = async (kysymys_id, checkedValue, vaihtoehto_id, listItemIndex, exam_id) => {
        try {
            // /paivita_valinta/:kayttaja_id/:vaihtoehto_id/:tentti_id/:kurssi_id/:vastaus
            await axios.put(path + "paivita_valinta/"
                + currentUserIndex + "/"
                + vaihtoehto_id + "/"
                + exam_id + "/"
                + currentKurssiIndex + "/"
                + checkedValue)
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({
            type: "checked_changed",
            data: {
                examIndex: currentExamIndex,
                cardIndex: kysymys_id,
                listItemIndex: listItemIndex,
                checkedValue: checkedValue
            }
        })
    }

    const currentExamIndexChanged = (value) => {
        setCurrentExamIndex(value)
        setShowCorrectAnswers(false)
    }

    const allCorrect = (cardChoisesArray) => {
        return (cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length === cardChoisesArray.length)
    }

    return (
        <Box>
            <CssBaseline />
            <Container key="container1_user" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => currentExamIndexChanged(examIndex)}>
                        {exam.nimi}
                    </ExamButton>
                )}
                {currentExamIndex >= 0 &&
                    (
                        <>
                            <h2>{state[currentExamIndex].nimi}</h2>
                            {Object.values(state[currentExamIndex].kysymykset)
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <p className="label" style={{ whiteSpace: "pre-wrap" }}>
                                                    {card.lause}
                                                </p>
                                                {Object.values(card.vaihtoehdot).map((listItem, listItemIndex) => (
                                                    <ListItem key={uuid()}>
                                                        <Checkbox checked={listItem.vastaus} disabled={showCorrectAnswers}
                                                            onChange={(event) => {
                                                                valintaMuuttui(cardIndex, event.target.checked, listItem.id, listItemIndex, state[currentExamIndex].id)
                                                            }}
                                                        />
                                                        {showCorrectAnswers && <GreenCheckbox disabled checked={listItem.oikea_vastaus} color="primary" />}
                                                        <p style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {listItem.vaihtoehto}
                                                        </p>
                                                    </ListItem>
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
                }
            </Container>
        </Box>
    )
}

export default App