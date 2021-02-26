
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

  export {
      tarkistaSahkoposti, 
      tarkistaSalasana,
      autentikoitu
  }