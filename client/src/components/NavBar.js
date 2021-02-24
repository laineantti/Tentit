import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'
import { useEffect } from 'react'

export function NavBar({kirjautunut,setKirjautunut}) {
    const classes = useStyles()

    strings.setLanguage(strings.getInterfaceLanguage())
    console.log("Browser language in Settings: " + strings.getInterfaceLanguage())
    console.log("React App language: " + strings.getLanguage())

    if (kirjautunut) {
        return (
            <>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            <MenuButton name="tentit" href="/">{strings.tentit}</MenuButton>
                            <MenuButton name="tilastot" href="/stats">{strings.tilastot}</MenuButton>
                            <MenuButton name="tiedostonlahetys" href="/upload">{strings.tiedostonlahetys}</MenuButton>
                            <MenuButton name="tietoa" target="_blank" href="https://www.youtube.com/watch?v=sAqnNWUD79Q">
                                {strings.tietoa}
                            </MenuButton>
                        </Typography>
                        <MenuButton name="user" href="/user" style={{ backgroundColor: "white", color: "blue", marginRight: "10px" }}>{strings.kayttaja}</MenuButton>
                        <MenuButton name="admin" href="/admin" style={{ backgroundColor: "white", color: "red" }}>{strings.yllapitaja}</MenuButton>
                        {/* <MenuButton name="kieli" onClick={() => vaihdetaanKieli()}>{strings.kieli + "(" + strings.getLanguage() + ")"}</MenuButton> */}
                        <MenuButton name="poistu" onClick={()=>{window.localStorage.removeItem('jwtToken');setKirjautunut(false)}}>{strings.poistu}</MenuButton>
                    </Toolbar>
                </AppBar>
            </>
        )

    } else {
        return (
            <>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            <MenuButton name="rekisteroidy" href="/register">{strings.rekisteroidy}</MenuButton>
                            <MenuButton name="kirjaudu" href="/login">{strings.kirjaudu}</MenuButton>
                        </Typography>
                    </Toolbar>
                </AppBar>
            </>
        )
    }
}