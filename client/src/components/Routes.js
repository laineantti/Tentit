
import { useState } from 'react'
import User from './User'
import Admin from './Admin'
import Stats from './Stats'
import Upload from './Upload'
import Register from './Register'
import Login from './Login'
import { NavBar } from './NavBar'
import { Route, Switch, Redirect } from 'react-router-dom'

export const Routes = () => {

    // tarkistetaanko kirjautumisen tila tokenista ja asetetaan tähän arvoksi?
    const [loggedIn, setLoggedIn] = useState(false)

    return (
        <div>
            <NavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>
            <Switch>
                <Route exact path="/user">
                    {loggedIn ? <User/> : <Redirect to='/login' />}
                </Route>
                <Route exact path="/">
                    {loggedIn ? <User/> : <Redirect to='/login' />}
                </Route>
                <Route exact path="/admin">
                    {loggedIn ? <Admin/> : <Redirect to='/login' />}
                </Route>
                <Route exact path="/stats">
                    {loggedIn ? <Stats/> : <Redirect to='/login' />}
                </Route>
                <Route exact path="/upload">
                    {loggedIn ? <Upload/> : <Redirect to='/login' />}
                </Route>
                <Route exact path="/register">
                    {loggedIn ? <Redirect to='/user' /> : <Register/>}
                </Route>
                <Route exact path="/login">
                    {loggedIn ? <Redirect to='/' /> : <Login setLoggedIn={setLoggedIn}/>}
                </Route>
            </Switch>
        </div>
    )
}