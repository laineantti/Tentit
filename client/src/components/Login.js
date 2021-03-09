import React, { useState } from 'react'
import { TextField, Button } from '@material-ui/core'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import { strings } from './Locale'
import axios from 'axios'
import { NavBarLogin } from './NavBarLogin'


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

const Login = ({kirjautunut,setKirjautunut}) => {
    const [tempSahkoposti, setTempSahkoposti] = useState("")
    const [tempSalasana, setTempSalasana] = useState("")
    /* const [tempSalasanaUudestaan, setTempSalasanaUudestaan] = useState("") */

    const submitLogin = async (sah, sal) => {
        // rakennetaan body axiosta varten
        let body = {
            sahkoposti: sah,
            salasana: sal,
        }
        try {
            await axios.post(path + "kirjaudu/", body).then(response => {
                // tehdään post josta saadaan onnistuneessa kirjautumisessa response
                // mistä tallennetaan datasta saatava token localStorageen
                window.localStorage.setItem('jwtToken', response.data.token);
                // alert("Kirjautuminen onnistui, tervetuloa "+response.data.sahkoposti+"!")
                // window.location.pathname="/user"
                setKirjautunut(true)
            })
        } catch (e) {
            console.log("login error", e)
            alert("Tunnus tai salasana väärin!")
        }
    }

    return (
        <>
        <NavBarLogin/>
        <div className="container">
            <Typography variant="h2" component="h2" style={{ paddingTop: "60px" }} className="h3 mb-3 font-weight-normal">{strings.kirjaudu}</Typography>
            <Grid container spacing={1}>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <TextField
                        name="sahkoposti"
                        label={strings.sahkoposti}
                        id="outlined-start-adornment3"
                        variant="outlined"
                        value={tempSahkoposti}
                        onChange={(event) => setTempSahkoposti(event.target.value)}
                    />
                </Grid>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <FormControl variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">{strings.salasana}</InputLabel>
                        <OutlinedInput
                            name="salasana_hash"
                            id="outlined-adornment-password"
                            labelWidth={70}
                            value={tempSalasana}
                            type="password"
                            onChange={(event) => setTempSalasana(event.target.value)}
                        />
                    </FormControl>
                </Grid>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <Button onClick={() => submitLogin(tempSahkoposti, tempSalasana)} type="submit"
                        className="btn btn-lg btn-primary btn-block" variant="contained" color="primary">
                        {strings.kirjaudu}
                    </Button>
                </Grid>

            </Grid>
        </div>
    </>
    )
}
export default Login