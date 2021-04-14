import React, { useState } from 'react'
import { TextField, Button } from '@material-ui/core'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import axios from 'axios'
import { strings } from './Locale'
import {tarkistaSahkoposti,tarkistaSalasana} from './helpers.js';

var path = null
var default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

switch (environment) {
    case 'production':
        path = 'http://tentti-fullstack.herokuapp.com/'
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

const Register = () => {

    const [tempEtunimi, setTempEtunimi] = useState("")
    const [tempSukunimi, setTempSukunimi] = useState("")
    const [tempSahkoposti, setTempSahkoposti] = useState("")
    const [tempSalasana, setTempSalasana] = useState("")
    const [tempRooli, setTempRooli] = useState("user")

    const handleRadioButtons = (event) => {
        setTempRooli(event.target.value)
    }

    const addUser = async () => {
        if (tarkistaSahkoposti(tempSahkoposti)) {
            if (tarkistaSalasana(tempSalasana)) {
                try {
                    let result = await axios.post(path+"lisaa_kayttaja", {
                        etunimi: tempEtunimi,
                        sukunimi: tempSukunimi,
                        sahkoposti: tempSahkoposti,
                        salasana_hash: tempSalasana,
                        rooli: tempRooli
                    })
                    // if (result.lenght === 0){
                    //     console.log("?????")
                    //     return
                    // }
                    console.log(result)
                    alert("Käyttäjä lisätty onnistuneesti!")
                } catch (ex) {
                    console.log(ex.message)
                }
            } else {
                console.log("Salasana ei ole turvallinen!")
            }
        } else {
            console.log("Sähköposti ei kelpaa!")
        }
    }

    return (
        <>
        <div className="container">
            <Typography variant="h2" component="h2" style={{ paddingTop: "60px" }} className="h3 mb-3 font-weight-normal">{strings.rekisteroidy}</Typography>
            <Grid container spacing={1}>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <TextField
                        name="etunimi"
                        label={strings.etunimi}
                        id="outlined-start-adornment1"
                        variant="outlined"
                        value={tempEtunimi}
                        onChange={(event) => setTempEtunimi(event.target.value)}
                    />
                </Grid>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <TextField
                        name="sukunimi"
                        label={strings.sukunimi}
                        id="outlined-start-adornment2"
                        variant="outlined"
                        value={tempSukunimi}
                        onChange={(event) => setTempSukunimi(event.target.value)}
                    />
                </Grid>
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
                            name="salasana"
                            id="outlined-adornment-password"
                            labelWidth={70}
                            value={tempSalasana}
                            type="password"
                            onChange={(event) => setTempSalasana(event.target.value)}
                        />
                    </FormControl>
                </Grid>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">{strings.rooli}</FormLabel>
                        <RadioGroup aria-label="rooli" name="rooli1" value={tempRooli} onChange={handleRadioButtons}>
                            <FormControlLabel value="user" control={<Radio />} label={strings.kayttaja} />
                            <FormControlLabel value="admin" control={<Radio />} label={strings.yllapitaja} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid style={{ padding: "20px" }} container item xs={12} spacing={3}>
                    <Button name="rekisteroidy_nappi" onClick={addUser} type="submit"
                        className="btn btn-lg btn-primary btn-block" variant="contained" color="primary">
                        {strings.rekisteroidy}
                    </Button>
                </Grid>

            </Grid>
        </div>
    </>
    )
}
export default Register