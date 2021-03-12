import { AppBar, Toolbar, Typography, IconButton, MenuItem, Menu } from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import EditIcon from '@material-ui/icons/Edit'
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'
import { React, useState, useContext, useEffect } from 'react'
import { logoutUser } from './axiosreqs'
import { store } from './store.js'

export function NavBarLogin() {
    const classes = useStyles()
    const { state, dispatch } = useContext(store)
 
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