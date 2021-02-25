import { React, useState, useEffect, useReducer } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import {
    Card, CardContent, CardMedia, Container, Button,
    List, ListItem, Box, Checkbox, CssBaseline
} from '@material-ui/core'
import { strings } from './Locale'
import { fetchUser, fetchData, valintaMuuttui } from './axiosreqs'
import {autentikoitu} from './helpers'


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
    const [currentUser, setCurrentUser] = useState("")
    const [currentCourse, setCurrentCourse] = useState(1)
    const classes = useStyles()

    const currentExamIndexChanged = (value) => {
        setCurrentExamIndex(value)
        setShowCorrectAnswers(false)
    }

    const allCorrect = (cardChoisesArray) => {
        return (cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length === cardChoisesArray.length)
    }

    // const authToken = () => {
    //     let paluuarvo = autentikoitu()
    //     if (paluuarvo){
    //         return 
    //     }
    // }

    useEffect(()=>{
        console.log("kukkuu: ",autentikoitu())
        fetchUser(setCurrentUser, autentikoitu())
        fetchData(currentUser, autentikoitu(), dispatch, false) // admin? --> true/false
    },[currentUser])  
    
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
                                                                valintaMuuttui(
                                                                    cardIndex, event.target.checked, 
                                                                    listItem.id, listItemIndex, 
                                                                    state[currentExamIndex].id, 
                                                                    currentUser, currentCourse, 
                                                                    currentExamIndex, dispatch, 
                                                                    autentikoitu())
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