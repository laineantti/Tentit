import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'
import { React } from 'react'

export function NavBarLogin() {
    const classes = useStyles()
 
    strings.setLanguage(strings.getInterfaceLanguage())
    console.log("Browser language in Settings: " + strings.getInterfaceLanguage())
    console.log("React App language: " + strings.getLanguage())

        
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