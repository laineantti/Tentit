import axios from 'axios'
import { autentikoitu } from './helpers'

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

const fetchUser = async (setCurrentUser, setCurrentUserName, paluuarvo) => {
    // let headers = { headers: { Authorization: `bearer ${autentikoitu()}` }, }
    let headers = { headers: { Authorization: `bearer ${paluuarvo}` }, }
    try {
        let userData = await axios.get(path + "kayttaja/", headers)
        if (userData.data.id) {
            let userId = Number(userData.data.id)
            let user = `${userData.data.etunimi} ${userData.data.sukunimi}`
            setCurrentUser(userId)
            setCurrentUserName(user)
            console.log(userData.data.id, userData.data.etunimi, userData.data.sukunimi)
        } else {
            console.log("kirjautunut käyttäjä hukassa")
        }
    } catch (exception) {
        console.log(exception)
    }
}

const fetchData = async (currentUser, dispatch, admin_sivulla) => { // admin_sivulla? --> true/false
    // ensin tarkistetaan admin-oikeus
    let adminOikeus = false
    try {
        let response = await axios({
            method: 'get',
            url: `${path}kayttaja/`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // asettaa admin tiedon (true/false)
        if (response.data.rooli === "admin") {
            adminOikeus = true
        } else {
            adminOikeus = false
        }

    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }

    // haetaan data edeltävä sivu ja admin-oikeus huomioon ottaen
    let headers = { headers: { Authorization: `bearer ${autentikoitu()}` }, }
    try {
        let tentit_string = ""
        if (admin_sivulla) { // admin_sivulla? --> true/false
            if (adminOikeus) {
                tentit_string = path + "tentti"
            } else {
                tentit_string = path + "oikeus_muokata_tenttia/" + currentUser
            }
        } else {
            tentit_string = path + "kayttajan_tentit/" + currentUser
        }
        let tentit_data = await axios.get(tentit_string, headers)
        let tentit = tentit_data.data

        if (tentit.length > 0) {
            // käydään tentit läpi
            for (var i = 0; i < tentit.length; i++) {
                // haetaan tentin kysymykset
                tentit[i].kysymykset = []
                let kysymykset_taulu = await axios.get(path + "tentin_kysymykset/" + tentit[i].id, headers)
                tentit[i].kysymykset = kysymykset_taulu.data
                // haetaan kayttajan_vastaukset

                if (tentit[i].kysymykset.length > 0) {
                    let kayttajan_vastaukset =
                        await axios.get(path + "kayttajan_vastaukset/" + currentUser + "/" + tentit[i].id, headers)
                    // käydään tentin kysymykset läpi
                    for (var j = 0; j < tentit[i].kysymykset.length; j++) {
                        // haetaan kysymyksen vaihtoehdot
                        tentit[i].kysymykset[j].vaihtoehdot = []
                        tentit[i].kysymykset[j].kuvat = []
                        let vaihtoehdot_taulu =
                            await axios.get(path + "kysymyksen_vaihtoehdot/" + tentit[i].kysymykset[j].id, headers)
                        let kysymyksen_kuvat_taulu =
                            await axios.get(path + "kysymyksen_kuvat/" + tentit[i].kysymykset[j].id, headers)
                        tentit[i].kysymykset[j].vaihtoehdot = vaihtoehdot_taulu.data
                        tentit[i].kysymykset[j].kuvat = kysymyksen_kuvat_taulu.data
                        // käydään kayttajan_vastaukset läpi
                        for (var k = 0; k < tentit[i].kysymykset[j].vaihtoehdot.length; k++) {
                            tentit[i].kysymykset[j].vaihtoehdot[k].vastaus = null
                            let vaihtoehdon_kuvat_taulu =
                                await axios.get(path + "vaihtoehdon_kuvat/" + tentit[i].kysymykset[j].vaihtoehdot[k].id, headers)
                            tentit[i].kysymykset[j].vaihtoehdot[k].kuvat = vaihtoehdon_kuvat_taulu.data
                            if (kayttajan_vastaukset.data.length > 0) {
                                for (var l = 0; l < kayttajan_vastaukset.data.length; l++) {
                                    if (tentit[i].kysymykset[j].vaihtoehdot[k].id === kayttajan_vastaukset.data[l].vaihtoehto_id) {
                                        tentit[i].kysymykset[j].vaihtoehdot[k].vastaus = kayttajan_vastaukset.data[l].vastaus
                                    }
                                }

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

const fetchImage = async (maara, poikkeama) => {
    let headers = { headers: { Authorization: `bearer ${autentikoitu()}` }, }
    try {
        // taulukko näyttää tältä:
        // [{ id: '1', tiedostonimi: 'abc123.jpg'}]
        let response = await axios.get(path + "kuva/" + maara + "/" + poikkeama, headers)
        if (response.data[0].id) {
            return response.data
        }
    } catch (exception) {
        console.log(exception)
        return exception
    }

}

const logoutUser = (dispatch) => {
    dispatch({
        type: "LOGOUT_USER",
        data: {}
    })
}

const kysymysJaAihe = async (setKaikkiKysymykset) => {
    let headers = { headers: { Authorization: `bearer ${autentikoitu()}` }, }
    try {
        let result = await axios.get(path + "kysymys_aihe", headers)
        setKaikkiKysymykset(result.data)
    } catch (exception) {
        console.log("Virhe tietokantahaussa!")
    }
}

const haeAiheet = async (setKaikkiAiheet) => {
    let headers = { headers: { Authorization: `bearer ${autentikoitu()}` }, }
    try {
        let result = await axios.get(path + "aihe", headers)
        setKaikkiAiheet(result.data)
    } catch (exception) {
        console.log("Virhe tietokantahaussa!")
    }
}


// /paivita_valinta/:kayttaja_id/:vaihtoehto_id/:tentti_id/:kurssi_id/:vastaus
const valintaMuuttui = async (kysymys_id, checkedValue, vaihtoehto_id, listItemIndex, exam_id, currentUser, currentCourse, currentExamIndex, dispatch) => {
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_valinta/${currentUser}/${vaihtoehto_id}/${exam_id}/${currentCourse}/${checkedValue}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        });
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

const lisaaKysymys = async (currentDatabaseExamIdChanged, dispatch, currentExamIndex) => {
    try {
        console.log(path + "lisaa_kysymys/" + currentDatabaseExamIdChanged)
        let response = await axios({
            method: 'post',
            url: `${path}lisaa_kysymys/${currentDatabaseExamIdChanged}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // palauttaa uuden luodun kysymyksen id
        return response.data
    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
    dispatch({ type: "add_card", data: { examIndex: currentExamIndex } })
}

const lisaaKysymysTenttiin = async (item, currentExamIndex) => {
    try {
        console.log(path + "lisaa_kysymys_tenttiin/" + item + "/" + currentExamIndex)
        let response = await axios({
            method: 'post',
            url: `${path}lisaa_kysymys_tenttiin/${item}/${currentExamIndex}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        return response.data
    } catch (exception) {
        console.log("Kysymyksen liitos tenttiin epäonnistui!")
    }
}

const lisaaVaihtoehto = async (dispatch, cardIndex, kysymys_id, currentExamIndex) => {
    try {
        console.log(path + "lisaa_vaihtoehto/" + kysymys_id)
        let response = await axios({
            method: 'post',
            url: `${path}lisaa_vaihtoehto/${kysymys_id}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // palauttaa uuden luodun kysymyksen id
        return response.data
    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
    dispatch({ type: "add_choise", data: { cardIndex: cardIndex, examIndex: currentExamIndex } })
}

const oikeaValintaMuuttui = async (dispatch, currentExamIndex, kysymys_id, checkedValue, vaihtoehto_id, listItemIndex) => {
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_oikea_valinta/${vaihtoehto_id}/${checkedValue}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
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

const lisaaTentti = async (dispatch, currentUser) => {
    try {
        let response = await axios({
            method: 'post',
            url: `${path}lisaa_tentti/${currentUser}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        dispatch({ type: "add_exam" })
        // palauttaa uuden luodun tentin id
        return response.data

    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
}

const liitaKuvaKysymykseen = async (dispatch, examIndex, cardIndex, selectedImages, kysymys_id) => {
    let body = {
        kysymys_id: kysymys_id,
        selectedImages: selectedImages
    }
    try {
        let response = await axios({
            method: 'post',
            url: `${path}liita_kuva_kysymykseen/`,
            data: body,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // palauttaa uuden luodun kuvan id
        return response.data
    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
    console.log(examIndex)
    dispatch({
        type: "add_image_card",
        data: {
            examIndex: examIndex,
            cardIndex: cardIndex,
            kuvat: selectedImages
        }
    })
}

const liitaKuvaVaihtoehtoon = async (dispatch, examIndex, cardIndex, selectedImages, kysymys_id, listItemIndex, vaihtoehto_id) => {
    let body = {
        kysymys_id: kysymys_id,
        vaihtoehto_id: vaihtoehto_id,
        selectedImages: selectedImages
    }
    try {
        let response = await axios({
            method: 'post',
            url: `${path}liita_kuva_vaihtoehtoon/`,
            data: body,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // palauttaa uuden luodun kuvan id
        return response.data
    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
    dispatch({
        type: "add_image_choise",
        data: {
            examIndex: examIndex,
            cardIndex: cardIndex,
            listItemIndex: listItemIndex,
            kuvat: selectedImages
        }
    })
}

const poistaKuvanLiitos = async (dispatch, currentExamIndex, cardIndex, sijainti, kuva_id, kysymys_id, imageIndex, vaihtoehto_id, listItemIndex) => {
    let body = {
        kysymys_id: kysymys_id,
        vaihtoehto_id: vaihtoehto_id,
        sijainti: sijainti,
        kuva_id: kuva_id
    }
    try {
        sijainti === "kysymys" ?
            dispatch({
                type: "image_deleted_card",
                data: {
                    examIndex: currentExamIndex,
                    cardIndex: cardIndex,
                    imageIndex: imageIndex
                }
            })
            :
            dispatch({
                type: "image_deleted_choise",
                data: {
                    examIndex: currentExamIndex,
                    cardIndex: cardIndex,
                    listItemIndex: listItemIndex,
                    imageIndex: imageIndex
                }
            })
        await axios({
            method: 'delete',
            url: `${path}poista_kuvan_liitos/`,
            data: body,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
}

const haeTentinLuojanId = async (tentti_id) => {
    try {
        let response = await axios({
            method: 'get',
            url: `${path}tentin_luoja/${tentti_id}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        // palauttaa tentin luojan id
        return response.data

    } catch (exception) {
        console.log("Datan päivitäminen ei onnistunut.")
    }
}

const muutaTentti = async (dispatch, currentExamIndex, tentti_id, value) => {
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_tentti/${tentti_id}/${value}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch({
        type: "exam_changed",
        data: { examIndex: currentExamIndex, newExam: value }
    })
}

const muutaKysymys = async (dispatch, currentExamIndex, value, id, cardIndex) => {
    let body = {
        lause: value,
    }
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_kysymys/${id}`,
            data: body,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch({
        type: "card_label_changed",
        data: { examIndex: currentExamIndex, cardIndex: cardIndex, newCardLabel: value }
    })
}

const muutaKysymyksenAihe = async (dispatch, currentExamIndex, value, id, cardIndex, kaikkiAiheet) => {
    let newCardAihe = "";
    kaikkiAiheet.map((aihe, aiheIndex) => {
        if (aihe.id === value) {
            newCardAihe = aihe.aihe
        }
    })
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_kysymyksen_aihe/${id}/${value}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch({
        type: "card_aihe_changed",
        data: { examIndex: currentExamIndex, cardIndex: cardIndex, newCardAihe: newCardAihe }
    })
}

const lisaaKysymykselleUusiAihe = async (dispatch, currentExamIndex, value, id, cardIndex, kaikkiAiheet, setKaikkiAiheet) => {
    let body = {
        aihe: value,
    }
    try {
        let aihe = await axios({
            method: 'post',
            url: `${path}lisaa_aihe/${id}`,
            data: body,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        let uusiAihe = {
            id: aihe.data,
            aihe: body.aihe
        }
        setKaikkiAiheet([...kaikkiAiheet, uusiAihe])
    } catch (exception) {
        console.log(exception)
    }
    dispatch({
        type: "card_aihe_changed",
        data: { examIndex: currentExamIndex, cardIndex: cardIndex, newCardAihe: body.aihe }
    }) 
}

const muutaVaihtoehto = async (dispatch, currentExamIndex, value, vaihtoehto_id, cardIndex, listItemIndex) => {
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_vaihtoehto/${vaihtoehto_id}/${value}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch({
        type: "choise_changed",
        data: {
            examIndex: currentExamIndex,
            cardIndex: cardIndex,
            listItemIndex: listItemIndex,
            newChoise: value
        }
    })
}

// dispatch, currentExamIndex, card.id, cardIndex, state[currentExamIndex].id, autentikoitu()
const poistaKysymyksenLiitos = async (dispatch, currentExamIndex, kysymys_id, cardIndex, tentti_id) => {
    console.log("Kysymys_id " + kysymys_id + ", tentti_id " + tentti_id + ", liitos poistettu!")
    try {
        await axios({
            method: 'delete',
            url: `${path}poista_kysymyksen_liitos/${kysymys_id}/${tentti_id}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch(
        {
            type: "card_deleted", data: {
                examIndex: currentExamIndex,
                cardIndex: cardIndex
            }
        }
    )
}

const poistaVaihtoehdonLiitos = async (dispatch, currentExamIndex, vaihtoehto_id, cardIndex, kysymys_id, listItemIndex) => {
    console.log("Vaihtoehto_id " + vaihtoehto_id + ", kysymys_id " + kysymys_id + ", liitos poistettu!")
    try {
        await axios({
            method: 'delete',
            url: `${path}poista_vaihtoehdon_liitos/${vaihtoehto_id}/${kysymys_id}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
    } catch (exception) {
        console.log(exception)
    }
    dispatch(
        {
            type: "choise_deleted", data: {
                examIndex: currentExamIndex,
                cardIndex: cardIndex,
                listItemIndex: listItemIndex
            }
        }
    )
}

const poistaTentti = async (dispatch, currentExamIndex, tentti_id, voimalla) => {
    let tiedot_poistettavasta_tentista = null
    try {
        let result = await axios({
            method: 'delete',
            url: `${path}poista_tentti/${tentti_id}/${voimalla}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        tiedot_poistettavasta_tentista = result.data
        if (tiedot_poistettavasta_tentista.poistettu) {
            console.log("Tentti_id " + tentti_id + ", poistettu!")
            dispatch(
                {
                    type: "exam_deleted", data: {
                        examIndex: currentExamIndex
                    }
                }
            )
        } else {
            console.log("Tentti_id " + tentti_id + ", poistaminen epäonnistui liitoksien takia!")
        }
        return tiedot_poistettavasta_tentista
    } catch (exception) {
        console.log(exception)
    }
}

const poistaKysymys = async (dispatch, kysymys_id, cardIndex, examIndex, voimalla) => {
    let tiedot_poistettavasta_kysymyksesta = null
    try {
        let result = await axios({
            method: 'delete',
            url: `${path}poista_kysymys/${kysymys_id}/${voimalla}`,
            headers: { 'Authorization': `bearer ${autentikoitu()}` }
        })
        tiedot_poistettavasta_kysymyksesta = result.data
        if (tiedot_poistettavasta_kysymyksesta.poistettu) {
            console.log("Kysymys_id " + kysymys_id + ", poistettu!")
            dispatch(
                {
                    type: "card_deleted", data: {
                        cardIndex: cardIndex,
                        examIndex: examIndex
                    }
                }
            )
        } else {
            console.log("Kysymys_id " + kysymys_id + ", poistaminen epäonnistui liitoksien takia!")
        }
        return tiedot_poistettavasta_kysymyksesta
    } catch (exception) {
        console.log(exception)
    }
}

export {
    fetchUser,
    fetchData,
    fetchImage,
    logoutUser,
    kysymysJaAihe,
    haeAiheet,
    valintaMuuttui,
    lisaaKysymys,
    lisaaKysymysTenttiin,
    lisaaVaihtoehto,
    oikeaValintaMuuttui,
    lisaaTentti,
    liitaKuvaKysymykseen,
    liitaKuvaVaihtoehtoon,
    poistaKuvanLiitos,
    haeTentinLuojanId,
    muutaTentti,
    muutaKysymys,
    muutaKysymyksenAihe,
    lisaaKysymykselleUusiAihe,
    muutaVaihtoehto,
    poistaKysymyksenLiitos,
    poistaVaihtoehdonLiitos,
    poistaTentti,
    poistaKysymys
}