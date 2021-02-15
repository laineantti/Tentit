import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'

export function NavBar(props) {
    const classes = useStyles()

    strings.setLanguage(strings.getInterfaceLanguage())
    console.log("Browser language in Settings: " + strings.getInterfaceLanguage())
    console.log("React App language: " + strings.getLanguage())

    if (props.loggedIn) {
        return (
            <>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            <MenuButton name="tentit" href="/">{strings.tentit}</MenuButton>
                            <MenuButton name="tilastot" href="/Stats">{strings.tilastot}</MenuButton>{/* 
                            <MenuButton name="tiedostonlahetys" href="/Upload">{strings.tiedostonlahetys}</MenuButton> */}
                            <MenuButton name="tietoa" target="_blank" href="https://www.youtube.com/watch?v=sAqnNWUD79Q">
                                {strings.tietoa}
                            </MenuButton>
                        </Typography>
                        <MenuButton name="user" href="/User" style={{ backgroundColor: "white", color: "blue", marginRight: "10px" }}>{strings.kayttaja}</MenuButton>
                        {/* <MenuButton name="admin" href="/Admin" style={{ backgroundColor: "white", color: "red" }}>{strings.yllapitaja}</MenuButton> */}
                        {/* <MenuButton name="kieli" onClick={() => vaihdetaanKieli()}>{strings.kieli + "(" + strings.getLanguage() + ")"}</MenuButton> */}
                        <MenuButton name="poistu">{strings.poistu}</MenuButton>
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
                            <MenuButton name="rekisteroidy" href="/Register">{strings.rekisteroidy}</MenuButton>
                            <MenuButton name="kirjaudu" href="/Login">{strings.kirjaudu}</MenuButton>
                        </Typography>
                    </Toolbar>
                </AppBar>
            </>
        )
    }
}