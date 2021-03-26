
const tarkistaSahkoposti = (email) => {
    if (email === undefined) {
        throw new Error('Sähköpostia ei välitetty, tarkista lomake!');
    }
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

const tarkistaSalasana = (str) => {
    // at least one number, one lowercase and one uppercase letter
    // at least six characters
    if (str === undefined) {
        throw new Error('Salasanaa ei välitetty, tarkista lomake!');
    }var res = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return res.test(str);
  }

const autentikoitu = () => {

  // palauttaa joko falsen tai tokenin

  let loggedUser = JSON.parse(JSON.stringify(window.localStorage.getItem('jwtToken')));
  if (!loggedUser) {
    return false;
  }
  
  return loggedUser;
}

const hakuId = (state,currentExamId,currentExamIndex,setCurrentExamIndex) => { 
  idToIndex(state,currentExamId,setCurrentExamIndex)
  if (currentExamIndex === -1 || !state[currentExamIndex]){
      return ""
  } else {
      return state[currentExamIndex].nimi
  }      
}

const idToIndex = (state,currentExamId,setCurrentExamIndex) => {
  let viesti = ""
  setCurrentExamIndex(-1)
  if (currentExamId!==-1){
      state.map((exam,index)=>{
          if(exam.id===currentExamId){
              setCurrentExamIndex(index)
              viesti="ExamIndex löytyi!"
          } else {
              viesti="ExamId:tä vastaavaa indexiä ei ole!"
          }              
      })
  } else {
      setCurrentExamIndex(-1)
      viesti="Id:tä ei ole"
  }
  console.log(viesti)
}

const kysymysLista = (currentExamIndex, kaikkiKysymykset, tentinKysymykset, setRows) => {
  let lista=kaikkiKysymykset
  tentinKysymykset.map((item,kysymysIndex) => {
      lista.map((listaItem,listaId) => {
          if (listaItem.id === item.id) {
              lista.splice(listaId,1)
          }
      })
  })
  setRows(lista)
}

  export {
      tarkistaSahkoposti, 
      tarkistaSalasana,
      autentikoitu,
      hakuId,
      idToIndex,
      kysymysLista
  }