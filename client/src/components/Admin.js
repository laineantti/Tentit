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
import { DataGrid } from '@material-ui/data-grid';
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
import { idToIndex, hakuId } from './helpers'

const columns = [
    { field: 'id', headerName: 'ID', flex: 0.25 },
    { field: 'lause', headerName: 'Kysymys', flex: 1.5 },
    { field: 'aihe', headerName: 'Aihealue', flex: 0.75 },
    // {
    //   field: 'age',
    //   headerName: 'Age',
    //   type: 'number',
    //   width: 90,
    // },
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) =>
    //     `${params.getValue('firstName') || ''} ${params.getValue('lastName') || ''}`,
    // },
  ];
  
  const rows = [
    { id: 2, lause: 'Onko maa litteä vai pallo?', aihe: 'luonnontieteet' },
    { id: 3, lause: 'Montako puuta on olemassa?', aihe: 'luonnontieteet' },
    { id: 4, lause: 'Onko pizzassa yleensä majoneesia?', aihe: 'ravintotieto' },
    { id: 5, lause: 'Onko herkkusienet hyviä pizzassa?', aihe: 'ravintotieto' },
    { id: 6, lause: 'Montako planeettaa on olemassa?', aihe: 'tähtitiede' },
    { id: 7, lause: 'Onko aurinko kuuma?', aihe: 'tähtitiede' },  
    { id: 32, lause: `Mitä tämä ohjelma tekee? CODE import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const CodeComponent = ({questionString}) => {
    // tästä on poistettu kommentit
    let codePos = questionString.search("CODE")
    if (codePos !== -1) {    
        let code = questionString.substring(codePos+5)
        let question = questionString.slice(0,codePos-1)
        return (
            <>
                {question}
                <SyntaxHighlighter language="javascript" style={vs} wrapLongLines={true}
                showLineNumbers={true}>
                    {code}
                </SyntaxHighlighter>
            </>
        )
    } else {
        return (
            <>
                {questionString}
            </>
        )
    }
}

export default CodeComponent`, aihe: 'ohjelmointi' },

    // { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    // { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    // { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    // { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    // { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    // { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    // { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    // { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    // { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  ];

function App({currentUser,setCurrentUser,setCurrentUserName,currentExamId,setCurrentExamId,currentExamIndex,setCurrentExamIndex}) {
    const { state, dispatch } = useContext(store)
    // const storeContext = useContext(store)
    // const { state } = storeContext
    // const { dispatch } = storeContext
    
    const [currentDatabaseExamIdChanged, setCurrentDatabaseExamIdChanged] = useState(-1)
    const [newExamId, setNewExamId] = useState(-1)
    const [newCardId, setNewCardId] = useState(-1)
    const [newChoiseId, setNewChoiseId] = useState(-1)
    const classes = useStyles()

    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser, setCurrentUserName)
        } else {
            fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
        }
    }, [currentUser, newExamId, newCardId, newChoiseId,currentExamIndex])


    const [examName, setExamName] = useState(hakuId(state,currentExamId,currentExamIndex,setCurrentExamIndex))

    return (
        <>
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {idToIndex(state,currentExamId,setCurrentExamIndex)}
                {currentExamIndex >= 0
                    && state
                    && state[currentExamIndex]
                    && state[currentExamIndex].id
                    && state[currentExamIndex].kysymykset
                    && examName
                    ? (

                        <>
                            <h2> 
                                <TextField style={{ width: "85%" }} type="text" value={examName} id={state[currentExamIndex].id}
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
                                <DeleteExamDialog style={{ width : "15%", float: "right" }}
                                /* tentin poistonappi */
                                currentExamIndex={currentExamIndex}
                                setCurrentExamIndex={setCurrentExamIndex}
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
                                                <TextField multiline type="text" style={{ minWidth: "85%" }} defaultValue={card.lause} id={card.id} onBlur={(event) => {
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
                             <div style={{ width: '100%', textAlign : 'center' }}>
                            <IconButton 
                                onClick={() => setNewCardId(lisaaKysymys(currentDatabaseExamIdChanged, dispatch, currentExamIndex))}>
                                <Icon>add_circle</Icon>
                            </IconButton>
                            </div>
                            <Card style={{ marginTop: "10px" }}  className={classes.root}>
                            <div style={{ height: 450, width: '100%' }}>
                                <DataGrid columns={columns} rows={rows} pageSize={6} checkboxSelection />
                            </div>
                            </Card>
                        </>
                    )               
                : (
                <>
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => {
                        setCurrentExamIndex(examIndex)
                        if (exam.id) {
                            setCurrentDatabaseExamIdChanged(exam.id)
                            setCurrentExamId(exam.id)
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