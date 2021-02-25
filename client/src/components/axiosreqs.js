import axios from 'axios'

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



const fetchUser = async (setCurrentUser, authToken) => {
    let headers = {headers:{ Authorization: `bearer ${authToken}`},} 
    try {
        let userData = await axios.get(path + "kayttaja/", headers)
        if (userData.data.id){
          let userId = Number(userData.data.id)
          setCurrentUser(userId)
          console.log(userData.data.id, userData.data.etunimi, userData.data.sukunimi)
        } else {
          console.log("kirjautunut käyttäjä hukassa")
        }
    } catch (exception) {
        console.log(exception)
    }
} 

const fetchData = async (currentUser, authToken, dispatch) => {
    let headers = {headers:{ Authorization: `bearer ${authToken}`},} 
    try {
        let tentit = []
        let tentit_data = await axios.get(path + "kayttajan_tentit/" + currentUser, headers )
        tentit = tentit_data.data
        if (tentit.length > 0) {
            // käydään tentit läpi
            for (var i = 0; i < tentit.length; i++) {
                // haetaan tentin kysymykset
                tentit[i].kysymykset = []
                let kysymykset_taulu = await axios.get(path + "tentin_kysymykset/" + tentit[i].id, headers)
                tentit[i].kysymykset = kysymykset_taulu.data
                // haetaan kayttajan_vastaukset
                if (tentit[i].kysymykset.length > 0){
                    let kayttajan_vastaukset = 
                        await axios.get(path + "kayttajan_vastaukset/" + currentUser + "/" + tentit[i].id, headers)
                    // käydään tentin kysymykset läpi
                    for (var j = 0; j < tentit[i].kysymykset.length; j++) {
                        // haetaan kysymyksen vaihtoehdot
                        tentit[i].kysymykset[j].vaihtoehdot = []
                        let vaihtoehdot_taulu =
                            await axios.get(path + "kysymyksen_vaihtoehdot/" + tentit[i].kysymykset[j].id, headers)
                            tentit[i].kysymykset[j].vaihtoehdot = vaihtoehdot_taulu.data
                        // käydään kayttajan_vastaukset läpi
                        for (var k = 0; k < tentit[i].kysymykset[j].vaihtoehdot.length; k++) {
                            tentit[i].kysymykset[j].vaihtoehdot[k].vastaus = null
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

// /paivita_valinta/:kayttaja_id/:vaihtoehto_id/:tentti_id/:kurssi_id/:vastaus
const valintaMuuttui = async (kysymys_id, checkedValue, vaihtoehto_id, listItemIndex, exam_id, currentUser, currentCourse, currentExamIndex, dispatch, authToken) => {
    let v_id = Number(vaihtoehto_id)
    let e_id = Number(exam_id)
    try {
        await axios({
            method: 'put',
            url: `${path}paivita_valinta/${currentUser}/${v_id}/${e_id}/${currentCourse}/${checkedValue}`, 
            headers: {'Authorization': `bearer ${authToken}`}
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

export {
    fetchUser,
    fetchData,
    valintaMuuttui
}