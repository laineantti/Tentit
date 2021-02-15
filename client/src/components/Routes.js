
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
    return (
        <div>
            <NavBar />
            <Switch>
                <Route exact path="/User" component={User} />
                <Route exact path="/">
                    <Redirect to="/User" />
                </Route>
                {/* <Route exact path="/Admin" component={Admin} /> */}
                <Route exact path="/Stats" component={Stats} />
                {/* <Route exact path="/Upload" component={Upload} /> */}
                <Route exact path="/Register" component={Register} />
                <Route exact path="/Login" component={Login} />
            </Switch>
        </div>
    )
}