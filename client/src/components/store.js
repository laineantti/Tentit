import React, { createContext, useReducer } from 'react'
/* import uuid from 'react-uuid' */

// alkuperäinen tapa luoda reducer
// const [state, dispatch] = useReducer(reducer, [])

const initialState = []
const store = createContext(initialState)
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {

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
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex].lause =
                    action.data.newCardLabel
                return tempCopy

            case "card_deleted":
                tempCopy[action.data.examIndex].cards[action.data.cardIndex].cards
                    .splice(action.data.cardIndex, 1)
                return tempCopy

            case "add_exam":
                let newExam = {
                    aloitus: "",
                    kysymykset: [
                        {
                            label: "",
                            choises: [
                                { choise: "", checked: false, correctAnswer: false }
                            ]
                        }
                    ],
                    lopetus: "",
                    minimipisteraja: "",
                    nimi: action.data.examName,
                    suoritettu: false,

                }
                tempCopy.push(newExam)
                return tempCopy

            case "correct_checked_changed":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].oikea_vastaus = action.data.checkedValue
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
    }, initialState)

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

export { store, StateProvider }