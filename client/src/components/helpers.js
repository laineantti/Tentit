
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

const hakuId = (state,currentExamId,currentExamIndex) => { 
  let paluu=idToIndex(state,currentExamId)
  if (paluu === -1 || !state[currentExamIndex]){
      return ""
  } else {
      return state[currentExamIndex].nimi
  }      
}

const idToIndex = (state,currentExamId) => {
  let paluu = -1
  if (currentExamId!==-1){
      state.map((exam,index)=>{
          if(exam.id===currentExamId){
              paluu=index
          }            
      })
  }
  console.log("CurrentExamIndex "+paluu)
  return paluu
}

  export {
      tarkistaSahkoposti, 
      tarkistaSalasana,
      autentikoitu,
      hakuId,
      idToIndex,
  }