const { findLastKey } = require("lodash");

const autentikoitu = () => {
    const loggedUserJSON = window.localStorage.getItem('jwtToken')
    if (!loggedUserJSON) {
       return false
    }
    return true
}

export {autentikoitu}