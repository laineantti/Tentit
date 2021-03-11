import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import {
    Card, CardContent, CardMedia, Container, Button,
    List, ListItem, Box, Checkbox, CssBaseline, emphasize
} from '@material-ui/core'
import { strings } from './Locale'
import { fetchUser, fetchData, valintaMuuttui } from './axiosreqs'
import CodeComponent from './CodeComponent'
import { store } from './store.js'
import { NavBar } from './NavBar'


function App({kirjautunut,setKirjautunut,currentUser,setCurrentUser,
    currentUserName,setCurrentUserName,currentExamId,setCurrentExamId,currentExamIndex,setCurrentExamIndex,examEdit,setExamEdit}) {
    const { state, dispatch } = useContext(store) 
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
    const [currentCourse, setCurrentCourse] = useState(1)
    const classes = useStyles()

    const currentExamIndexChanged = (value) => {
        setCurrentExamIndex(value)
        setShowCorrectAnswers(false)
    }

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

    const idToIndex = (currentExamId) => {
        if (currentExamId!==-1){
            state.map((exam,index)=>{
                if(exam.id===currentExamId){
                    setCurrentExamIndex(index)
                    console.log("ExamIndex löytyi!")
                } else {
                    setCurrentExamIndex(-1)
                    console.log("ExamIndexiä ei löytynyt!")
                }                
            })
        } else {
            setCurrentExamIndex(-1)
            console.log("Id:tä ei ole")
        }
    }

    return (
        <>
        <Box>
            <CssBaseline />
            <Container key="container1_user" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {idToIndex()}
                {currentExamIndex >= 0 ?
                    (
                        <>
                            <h2>{state[currentExamIndex].nimi}</h2>
                            {Object.values(state[currentExamIndex].kysymykset)
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                <p className="label" style={{ whiteSpace: "pre-wrap" }}>
                                                    <CodeComponent questionString={card.lause} />
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
                                                                    currentExamIndex, dispatch)
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
                : (
                <>
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                                currentExamIndexChanged(examIndex)
                                setCurrentExamId(examIndex)}}>
                        {exam.nimi}
                    </ExamButton>
                )}
                </> )}
            </Container>
        </Box>
    </>
    )
}

export default App