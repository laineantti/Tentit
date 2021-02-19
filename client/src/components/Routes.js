
import { useState } from 'react'
import User from './User'
/* import Admin from './Admin' */
import Stats from './Stats'
import Upload from './Upload'
import Register from './Register'
import Login from './Login'
import { NavBar } from './NavBar'
import { Route, Switch/* , Redirect */ } from 'react-router-dom'

export const Routes = () => {

    // tarkistetaanko kirjautumisen tila tokenista ja asetetaan tähän arvoksi?
    const [loggedIn, setLoggedIn] = useState(true)

    return (
        <div>
            <NavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            {loggedIn ?
                <Switch>
                    <Route exact path="/user">
                        <User />
                    </Route>
                    <Route exact path="/">
                        <User />
                    </Route>
                    {/* <Route exact path="/admin">
                        <Admin />
                    </Route> */}
                    <Route exact path="/stats">
                        <Stats />
                    </Route>
                    <Route exact path="/upload">
                        <Upload />
                    </Route>
                </Switch>
                :
                <Switch>
                    <Route exact path="/register">
                        <Register />
                    </Route>
                    <Route exact path="/login">
                        <Login setLoggedIn={setLoggedIn} />
                    </Route>
                </Switch>
            }
        </div>
    )
}