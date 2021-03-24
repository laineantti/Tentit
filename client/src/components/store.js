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
                let newChoise = {
                    oikea_vastaus: false,
                    vaihtoehto: "Uusi vaihtoehto",
                    kuvat: []
                }
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex].vaihtoehdot
                    .push(newChoise)
                return tempCopy

            case "add_card":
                let newCard = {
                    lause: "Uusi kysymys",
                    vaihtoehdot: [],
                    kuvat: []
                }
                tempCopy[action.data.examIndex].kysymykset.push(newCard)
                return tempCopy

            case "card_label_changed":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex].lause =
                    action.data.newCardLabel
                return tempCopy

            case "card_deleted":
                tempCopy[action.data.examIndex].kysymykset.splice(action.data.cardIndex, 1)
                return tempCopy

            case "add_exam":
                let newExam = {
                    aloitus: "",
                    kysymykset: [],
                    lopetus: "",
                    minimipisteraja: "",
                    nimi: "Uusi tentti",
                    suoritettu: false,

                }
                tempCopy.push(newExam)
                return tempCopy

            case "add_image_card":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .kuvat = action.data.kuvat
                return tempCopy

            case "add_image_choise":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].kuvat = action.data.kuvat
                return tempCopy

            case "image_deleted_card":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex].kuvat.splice(action.data.imageIndex, 1)
                return tempCopy

            case "image_deleted_choise":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].kuvat.splice(action.data.imageIndex, 1)
                return tempCopy

            case "exam_changed":
                tempCopy[action.data.examIndex].nimi = action.data.newExam
                return tempCopy

            case "exam_deleted":
                tempCopy.splice(action.data.examIndex, 1)
                return tempCopy

            case "correct_checked_changed":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].oikea_vastaus = action.data.checkedValue
                console.log(tempCopy)
                return tempCopy

            case "checked_changed":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].vastaus = action.data.checkedValue
                return tempCopy

            case "choise_changed":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot[action.data.listItemIndex].vaihtoehto = action.data.newChoise
                return tempCopy

            case "choise_deleted":
                tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                    .vaihtoehdot.splice(action.data.listItemIndex, 1)
                return tempCopy

            case "answer_changed":
                tempCopy[action.data.examIndex].cards[action.data.cardIndex]
                    .choises[action.data.listItemIndex].correctAnswer
                    = action.data.checkedValue
                return tempCopy

            case "LOGOUT_USER":
                state = initialState
                return initialState

            case "INIT_DATA":
                return action.data

            default:
                throw new Error()

        }
    }, initialState)

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

export { store, StateProvider }