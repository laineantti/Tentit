import { AppBar, Toolbar, Typography, IconButton, MenuItem, Menu } from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import EditIcon from '@material-ui/icons/Edit'
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'
import { React, useState, useEffect } from 'react'

export function NavBar({kirjautunut,setKirjautunut,currentUser,setCurrentUser,currentUserName,setCurrentUserName}) {
    const classes = useStyles()
    const [examEdit, setExamEdit] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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
                        {/* <MenuButton name="user" href="/user" style={{ backgroundColor: "white", color: "blue", marginRight: "10px" }}>{strings.kayttaja}</MenuButton>
                        <MenuButton name="admin" href="/admin" style={{ backgroundColor: "white", color: "red" }}>{strings.yllapitaja}</MenuButton> */}
                        {/* <MenuButton name="kieli" onClick={() => vaihdetaanKieli()}>{strings.kieli + "(" + strings.getLanguage() + ")"}</MenuButton> */}
                        { window.location.pathname==="/admin"? 
                            <IconButton color='secondary' href="/user" onClick={() => {setExamEdit(!examEdit)}}>
                                <EditIcon/>
                            </IconButton> : 
                            <IconButton color='inherit' href="/admin" onClick={() => {setExamEdit(!examEdit)}} >
                                <EditIcon/>
                            </IconButton>} 
                        <IconButton aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true" 
                                onClick={handleMenu} 
                                color="inherit">
                            <AccountCircle/>
                        </IconButton>
                        <Menu   id= 'menu-appbar' 
                                anchorEl={anchorEl}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                // keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }} 
                                open={isOpen} 
                                onClose={handleClose}>
                            <MenuItem disabled="true" style={{justifyContent: 'center'}} ><AccountCircle/></MenuItem >
                            <MenuItem disabled="true"><strong>{currentUserName}</strong></MenuItem>
                            <MenuItem onClick={() =>{} }>{strings.omatTentit}</MenuItem>
                            <MenuItem onClick={() =>{
                                    window.localStorage.removeItem('jwtToken')
                                    setKirjautunut(false)
                                    setCurrentUser("")
                                    setCurrentUserName("")
                                    window.location.pathname="/login"
                                    setAnchorEl(null)
                                }}>{strings.poistu}
                            </MenuItem>
                        </Menu>
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