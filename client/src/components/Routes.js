
import { useState, useEffect } from 'react'
import User from './User'
import Admin from './Admin'
import Stats from './Stats'
import Upload from './Upload'
import Register from './Register'
import Login from './Login'
import { NavBar } from './NavBar'
import { NavBarLogin } from './NavBarLogin'
import { Route, Switch/* , Redirect */ } from 'react-router-dom'
import { autentikoitu } from './helpers'
import { fetchUser, kysymysJaAihe } from './axiosreqs'

export const Routes = () => {
    const [kirjautunut, setKirjautunut] = useState(false)
    const [currentUser, setCurrentUser] = useState("")
    const [currentUserName, setCurrentUserName] = useState("")
    const [currentExamIndex,setCurrentExamIndex] = useState(-1)
    const [currentExamId, setCurrentExamId] = useState(-1)
    const [examEdit,setExamEdit] = useState(false)
    const [kaikkiKysymykset, setKaikkiKysymykset] = useState([])
    const [rows, setRows] = useState([])


    // autentikoidun paluuarvo on joko token tai false
    useEffect(() => {
        let paluuarvo = autentikoitu()

        if (paluuarvo) {
            setKirjautunut(true)
            fetchUser(setCurrentUser, setCurrentUserName, paluuarvo)
            kysymysJaAihe(setKaikkiKysymykset)
        }
    },[kirjautunut])
     
    // tarkistetaanko kirjautumisen tila tokenista ja asetetaan tähän arvoksi?
    

    return (
        <div>
            {kirjautunut ?
                <>
                <NavBar setKirjautunut={setKirjautunut}
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser}
                currentUserName={currentUserName}
                setCurrentUserName={setCurrentUserName} 
                currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                examEdit={examEdit} setExamEdit={setExamEdit}
                kaikkiKysymykset={kaikkiKysymykset} setKaikkiKysymykset={setKaikkiKysymykset} 
                rows={rows} setRows={setRows}/>
                <Switch>
                    <Route exact path="/login">
                    <User currentUser={currentUser} 
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                        kaikkiKysymykset={kaikkiKysymykset} rows={rows} setRows={setRows}
                        />
                    </Route>
                    <Route exact path="/user">
                    <User currentUser={currentUser} 
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex}
                        kaikkiKysymykset={kaikkiKysymykset} rows={rows} setRows={setRows} 
                        />
                    </Route>
                    <Route exact path="/admin">
                        <Admin currentUser={currentUser} 
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex}
                        kaikkiKysymykset={kaikkiKysymykset} setKaikkiKysymykset={setKaikkiKysymykset}
                        rows={rows} setRows={setRows} 
                        />
                    </Route>
                    <Route exact path="/">
                    <User currentUser={currentUser} 
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex}
                        kaikkiKysymykset={kaikkiKysymykset} rows={rows} setRows={setRows} 
                        />
                    </Route>
                    <Route exact path="/stats">
                        <Stats />
                    </Route>
                    <Route exact path="/upload">
                        <Upload />
                    </Route>
                    {/* <Route exact path="*">
                        <User currentUser={currentUser} setCurrentUser={setCurrentUser} 
                        setCurrentUserName={setCurrentUserName}
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                        />
                    </Route> */}
                </Switch>
                </>
                :
                <>
                <NavBarLogin />
                <Switch>
                    <Route exact path="*">
                        <Register />
                    </Route>
                    <Route exact path="/login">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    {/* <Route exact path="/login">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    <Route exact path="/">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route> */}
                </Switch>
                </>
            }
        </div>
    )
}