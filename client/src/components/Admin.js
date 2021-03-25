import { React, useState, useEffect, useContext, useCallback } from 'react'
import uuid from 'react-uuid'
import { useStyles, GreenCheckbox, ExamButton } from './Style'
/* import axios from 'axios' */
import {
    Card, CardContent, Container, List, ListItem, Box, Icon,
    IconButton, CssBaseline, TextField, MenuItem
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import DeleteExamDialog from './DeleteExamDialog'
import { DataGrid } from '@material-ui/data-grid';
import { store } from './store.js'
import {
    fetchUser,
    fetchData,
    /* valintaMuuttui, */
    kysymysJaAihe,
    haeAiheet,
    lisaaKysymys,
    lisaaKysymysTenttiin,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    haeTentinLuojanId,
    muutaTentti,
    muutaKysymys,
    muutaKysymyksenAihe,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos
} from './axiosreqs'
import CodeComponent from './CodeComponent'
import { idToIndex, hakuId, kysymysLista } from './helpers'

const columns = [
    { field: 'id', headerName: 'ID', type: 'number', flex: 0.25 },
    { field: 'lause', headerName: 'Kysymys', flex: 1.5 },
    { field: 'aihe', headerName: 'Aihealue', flex: 0.75 },
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
    const [kaikkiKysymykset, setKaikkiKysymykset] = useState([])
    const [kaikkiAiheet, setKaikkiAiheet] = useState([])
    const [dataGridSelection, setDataGridSelection] = useState([])
    const [rows, setRows] = useState([])
    const classes = useStyles()
    
    
    useEffect(() => {
        if (!currentUser) {
            fetchUser(setCurrentUser, setCurrentUserName)
        } else {
            fetchData(currentUser, dispatch, true) // admin_sivulla? --> true/false
            kysymysJaAihe(setKaikkiKysymykset)
            haeAiheet(setKaikkiAiheet)
        }
    }, [currentUser, newExamId, newCardId, newChoiseId, currentExamIndex, dataGridSelection, rows])


    const [examName, setExamName] = useState(hakuId(state,currentExamId,currentExamIndex,setCurrentExamIndex))

    const kysymysLista = (currentExamIndex) => {
        let lista=kaikkiKysymykset
        state[currentExamIndex].kysymykset.map((item,kysymysIndex) => {
            lista.map((listaItem,listaId) => {
                if (listaItem.id === item.id) {
                    lista.splice(listaId,1)
                }
            })
        })
        return (lista)
    }


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
                                                <CodeComponent style={{ width: "82%" }} questionString={card.lause} background="darkBlue" />
                                                <TextField multiline type="text" style={{ minWidth: "82%" }} defaultValue={card.lause} id={card.id} onBlur={(event) => {
                                                    muutaKysymys(dispatch, currentExamIndex, event.target.value, card.id, cardIndex)
                                                }}>
                                                </TextField>
                                                
                                                <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                    color="primary" onClick={() => {
                                                        poistaKysymyksenLiitos(dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id)
                                                        let addRow = kaikkiKysymykset.filter((kysymys)=> kysymys.id===card.id) 
                                                        setRows([...rows, ...addRow])   
                                                    }}>
                                                    <DeleteIcon />
                                                </IconButton ><br/>
                                                <span>{card.aihe}</span>
                                                <TextField style={{ minWidth: "3%"  }}
                                                        value={''} 
                                                        select
                                                        onChange={(event)=>{muutaKysymyksenAihe(dispatch, currentExamIndex, event.target.value, card.id, cardIndex, kaikkiAiheet)}}
                                                        InputProps={{disableUnderline: true}}>
                                                        {kaikkiAiheet.map((option)=>(
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.aihe}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField><br/>
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
                                onClick={() => {
                                        if (dataGridSelection.length > 0) {
                                            console.log(dataGridSelection)
                                            dataGridSelection.map((item, kysymysIndex) => {
                                                setNewCardId(lisaaKysymysTenttiin(item,state[currentExamIndex].id))                                         
                                            })
                                            setRows(rows.filter((row)=> !dataGridSelection.includes(row.id)))
                                            setDataGridSelection([])
                                        } else {
                                            setNewCardId(lisaaKysymys(currentDatabaseExamIdChanged, dispatch, currentExamIndex))
                                            setRows(rows.filter((row)=> !dataGridSelection.includes(row.id))) 
                                        }
                                    }
                                }>
                                <Icon>add_circle</Icon>
                            </IconButton>
                            </div>
                            <Card style={{ marginTop: "10px" }}  className={classes.root}>
                            <div style={{ height: 460, width: '100%' }}>
                                <DataGrid columns={columns} rows={rows} pageSize={7} checkboxSelection
                                onSelectionModelChange={(newSelection)=>{
                                    setDataGridSelection(newSelection.selectionModel) 
                                }}
                                />
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
                            setRows(kysymysLista(examIndex))
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