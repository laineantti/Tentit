
import { useState, useEffect } from 'react'
import User from './User'
import Admin from './Admin'
import Stats from './Stats'
import Upload from './Upload'
import Register from './Register'
import Login from './Login'
import { NavBar } from './NavBar'
import { Route, Switch/* , Redirect */ } from 'react-router-dom'
import {autentikoitu} from './helpers'

export const Routes = () => {
    const [kirjautunut, setKirjautunut] = useState(false)


    // autentikoidun paluuarvo on joko token tai false
    useEffect(() => {
        let paluuarvo = autentikoitu()

        if (paluuarvo !== false) {
            setKirjautunut(true)
        }
    },[kirjautunut])
     
    // tarkistetaanko kirjautumisen tila tokenista ja asetetaan tähän arvoksi?

    return (
        <div>
            <NavBar kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>          
            {kirjautunut ? 
                <Switch>
                    {/* <Route exact path="/login">
                        <User />
                    </Route>
                    <Route exact path="/user">
                        <User />
                    </Route>
                    <Route exact path="/">
                        <User />
                    </Route> */}
                    <Route exact path="/admin">
                        <Admin />
                    </Route>
                    <Route exact path="/stats">
                        <Stats />
                    </Route>
                    <Route exact path="/upload">
                        <Upload />
                    </Route>
                    <Route exact path="*">
                        <User />
                    </Route>
                </Switch>
                :
                <Switch>
                    <Route exact path="/register">
                        <Register />
                    </Route>
                    <Route exact path="*">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    {/* <Route exact path="/login">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    <Route exact path="/">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route> */}
                </Switch>
            }
        </div>
    )
}