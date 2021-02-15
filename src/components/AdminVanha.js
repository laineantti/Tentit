import { React, useState, useEffect, useReducer } from 'react'
import DeleteIcon from '@material-ui/icons/Delete'
import uuid from 'react-uuid'
import { useStyles, ExamButton } from './Style'
import { initialData } from './InitialData'
import axios from 'axios'
import {
  Button, Card, CardContent,
  CardMedia, Container, List,
  ListItem, Box,
  CssBaseline, IconButton, TextField,
  Icon, Dialog, DialogActions, DialogContent, DialogTitle
} from '@material-ui/core'

function reducer(state, action) {

  let tempCopy = JSON.parse(JSON.stringify(state))

  switch (action.type) {

    case "add_choise":
      let newChoise = { choise: "", checked: false, correctAnswer: false }
      tempCopy[action.data.examIndex].cards[action.data.cardIndex].choises
        .push(newChoise)
      return tempCopy

    case "add_card":
      let newCard = {
        label: "", choises: [{ choise: "", checked: false, correctAnswer: false }]
      }
      tempCopy[action.data.examIndex].cards[action.data.cardIndex].cards
        .push(newCard)
      return tempCopy

    case "card_label_changed":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex].label =
        action.data.newCardLabel
      return tempCopy

    case "card_deleted":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex].cards
        .splice(action.data.cardIndex, 1)
      return tempCopy

    case "add_exam":
      let newExam = [
        {
          uuid: uuid(),
          name: action.data.examName,
          cards: [
            {
              label: "",
              choises: [
                { choise: "", checked: false, correctAnswer: false }
              ]
            }
          ]
        }
      ]
      action.data.handle_close()
      tempCopy.push(newExam)
      return tempCopy

    case "checked_changed":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex]
        .choises[action.data.listItemIndex].checked = action.data.checkedValue
      return tempCopy

    case "choise_changed":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex]
        .choises[action.data.listItemIndex].choise = action.data.newChoise
      return tempCopy

    case "choise_deleted":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex]
        .choises.splice(action.data.listItemIndex, 1)
      return tempCopy

    case "answer_changed":
      tempCopy[action.data.examIndex].cards[action.data.cardIndex]
        .choises[action.data.listItemIndex].correctAnswer
        = action.data.checkedValue
      return tempCopy

    case "INIT_DATA":
      return action.data

    default:
      throw new Error()

  }
}

function Admin() {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
  const [dataInitialized, setdataInitialized] = useState(false)
  const [currentExamIndex, setCurrentExamIndex] = useState(-1)
  const [state, dispatch] = useReducer(reducer, [])
  const [examName, setExamName] = useState("")
  const [open, setOpen] = useState(false)
  const classes = useStyles()

  useEffect(() => {

    const createData = async () => {
      try {
        await axios.post("http://localhost:4000/tentit", initialData)
        dispatch({ type: "INIT_DATA", data: initialData })
        setdataInitialized(true)
      } catch (exception) {
        console.log("Tietokannan alustaminen epäonnistui.")
      }
    }

    const fetchData = async () => {
      try {
        let result = await axios.get("http://localhost:4000/tentit")
        if (result.data.length > 0) {
          dispatch({ type: "INIT_DATA", data: result.data })
          setdataInitialized(true)
        } else {
          throw console.log("Data on alustettava.")
        }
      }
      catch (exception) {
        createData()
        console.log(exception)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {

    const updateData = async () => {
      try {
        await axios.put("http://localhost:4000/tentit", state)
      } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
      }
      finally {

      }
    }

    if (dataInitialized) {
      updateData()
    }
  }, [state, dataInitialized])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const currentExamIndexChanged = (value) => {
    setCurrentExamIndex(value)
    setShowCorrectAnswers(false)
  }

  const allCorrect = (cardChoisesArray) => {
    return (cardChoisesArray.filter(choise => choise.checked
      === choise.correctAnswer).length === cardChoisesArray.length)
  }

  return (
    <Box>
      <CssBaseline />
      <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
        component="main">
        {Object.values(state).map((exam, examIndex) =>
          <ExamButton style={{ marginTop: "10px" }} key={uuid()} onClick={() => currentExamIndexChanged(examIndex)}>
            {exam.name}
          </ExamButton>
        )}
        <IconButton onClick={handleClickOpen}>
          <Icon>add_circle</Icon>
        </IconButton>
        <Dialog open={open} onClose={handleClose}
          aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Lisää uusi tentti</DialogTitle>
          <DialogContent>
            {/* TextField, defaultValue, onBlur = toimii */}
            <TextField
              autoFocus
              margin="dense"
              id="examName"
              label="Tentin nimi"
              type="exam"
              fullWidth
              value={examName}
              onChange={(event) => setExamName(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Peruuta
              </Button>
            <Button style={{ marginTop: "10px" }} onClick={() => dispatch(
              {
                type: "add_exam", data: {
                  examName: examName,
                  handle_close: handleClose
                }
              }
            )} color="primary">
              Lisää tentti
              </Button>
          </DialogActions>
        </Dialog>

        {currentExamIndex >= 0 &&
          (
            <>
              {Object.values(state[currentExamIndex].cards)
                .map((card, cardIndex) =>
                  <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                    <CardContent key={uuid()} style={{ width: "100%" }} className={classes.content}>
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
                          value={card.label} />
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
                        {Object.values(card.choises).map((listItem, listItemIndex) => (
                          <ListItem key={uuid()}>
                            <TextField key={uuid()} style={{
                              minWidth: "600px", overflow: "hidden",
                              textOverflow: "ellipsis"
                            }} value={listItem.choise}
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
                        <IconButton onClick={() => dispatch({
                          type: "add_choise",
                          data: { cardIndex: cardIndex }
                        })}>
                          <Icon>add_circle</Icon>
                        </IconButton>
                      </List>
                    </CardContent>
                    {(showCorrectAnswers && (allCorrect(Object.values(card.choises))) ? (
                      <CardMedia className={classes.cover}>
                        <img className="image" src="images/selma.png"
                          height="30px" width="30px" alt="Selma" />
                      </CardMedia>
                    ) : (null))}
                  </Card>
                )}
              < IconButton style={{ float: "right" }}
                onClick={() => dispatch({ type: "add_card" })}>
                <Icon>add_circle</Icon>
              </IconButton>
              <Button style={{ marginTop: "10px" }} variant="contained" color="primary"
                onClick={() => (showCorrectAnswers ? setShowCorrectAnswers(false) :
                  setShowCorrectAnswers(true))}>Näytä vastaukset</Button>
            </>
          )
        }
      </Container >
    </Box >
  )
}

export default Admin