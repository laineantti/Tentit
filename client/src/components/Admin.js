import { React, useState, useEffect, useContext } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
import CustomizedDialogs from './CustomizedDialogs'
/* import axios from 'axios' */
import {
    Card, CardContent, Container, List, ListItem, Box, Icon,
    IconButton, CssBaseline, TextField, Input
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
    haeTentinLuojanId,
    muutaTentti,
    muutaKysymys,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos,
    poistaTentti
} from './axiosreqs'
import CodeComponent from './CodeComponent'
import { NavBar } from './NavBar'

function App({kirjautunut,setKirjautunut,currentUser,setCurrentUser,currentUserName,setCurrentUserName}) {
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
    const [examDeleteResult, setExamDeleteResult] = useState("")
    const classes = useStyles()

    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser, setCurrentUserName)
        } else {
            fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
        }
    }, [currentUser, newExamId, newCardId, newChoiseId])

    return (
        <>
        <NavBar kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}
                 currentUser={currentUser} setCurrentUser={setCurrentUser} 
                 currentUserName={currentUserName} setCurrentUserName={setCurrentUserName}
                 currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex}/> 
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {currentExamIndex >= 0 ?
                    (
                        <>
                            {(state[currentExamIndex].nimi) && (<>
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
                                    {/* tentin poistonappi */}
                                    <CustomizedDialogs
                                        otsikko={"Tentin poistaminen"}
                                        sisalto={
                                            (examDeleteResult === "") ?
                                                ("Haluatko varmasti poistaa tentin " + state[currentExamIndex].nimi + "?"):
                                                (examDeleteResult)
                                        }
                                        napin_teksti={
                                            (examDeleteResult === "") ?
                                                ("Poista pysyvästi"):
                                                ("ok")
                                        }
                                        napin_funktio={
                                            (async () => {
                                                try {
                                                    await poistaTentti(dispatch, currentExamIndex, currentDatabaseExamIdChanged)
                                                        .then(tiedot => {
                                                            console.log(tiedot)
                                                            // Tieto kursseista mihin tentti on liitettynä.
                                                            let kurssi_id_string = ""
                                                            let liitos = false
                                                            if (tiedot.liitokset.kurssi_id.length > 0) {
                                                                liitos = true
                                                                if (tiedot.liitokset.kurssi_id.length === 1) {
                                                                    kurssi_id_string = "Tentti on liitetty kurssiin " +
                                                                        tiedot.liitokset.kurssi_id[0] + "."
                                                                } else {
                                                                    kurssi_id_string = "Tentti on liitetty kursseihin "
                                                                    tiedot.liitokset.kurssi_id.map((id, index) => {
                                                                        if (index === tiedot.liitokset.kurssi_id.length - 1) {
                                                                            kurssi_id_string += id + "."
                                                                        } else if (index === tiedot.liitokset.kurssi_id.length - 2) {
                                                                            kurssi_id_string += id + " ja "
                                                                        } else {
                                                                            kurssi_id_string += id + ", "
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                kurssi_id_string = "Tentti ei ole millään kurssilla."
                                                            }
                                                            // Tieto kysymyksistä mihin tentti on liitettynä.
                                                            let kysymys_id_string = ""
                                                            if (tiedot.liitokset.kysymys_id.length > 0) {
                                                                liitos = true
                                                                if (tiedot.liitokset.kysymys_id.length === 1) {
                                                                    kysymys_id_string = "Se on myös liitetty kysymykseen " +
                                                                        tiedot.liitokset.kysymys_id[0] + "."
                                                                } else {
                                                                    kysymys_id_string = "Se on myös liitetty kysymyksiin "
                                                                    tiedot.liitokset.kysymys_id.map((id, index) => {
                                                                        if (index === tiedot.liitokset.kysymys_id.length - 1) {
                                                                            kysymys_id_string += id + "."
                                                                        } else if (index === tiedot.liitokset.kysymys_id.length - 2) {
                                                                            kysymys_id_string += id + " ja "
                                                                        } else {
                                                                            kysymys_id_string += id + ", "
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                kysymys_id_string = "Siihen ei ole liitetty yhtään kysymystä."
                                                            }
                                                            // tarkistetaan onko oikeasti poistettu
                                                            let poistettu_teksti = ""
                                                            if (tiedot.liitokset.poistettu) {
                                                                poistettu_teksti = "Tentti voitiin poistaa tietokannasta."
                                                            } else {
                                                                if (liitos) {
                                                                    poistettu_teksti = "Tämän vuoksi tenttiä ei voitu poistaa tietokannasta."
                                                                } else {
                                                                    poistettu_teksti = "Se on kuitenkin liitettynä mm. käyttäjiin, joten sitä ei voida poistaa (backendistä puuttuu tähän tällä hetkellä logiikka)."
                                                                }
                                                            }

                                                            setExamDeleteResult(kurssi_id_string + " " + kysymys_id_string + " " + poistettu_teksti)
                                                        })

                                                    /* setCurrentExamIndex(-1) */
                                                } catch (err) {
                                                    console.log(err)
                                                    setExamDeleteResult(err)
                                                }
                                            })
                                        }
                                    />
                                </h2>
                            </>)}

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
                
                : (
                <>
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
                </> )}
            </Container>
        </Box >
    </>
    )
}

export default App