import { AppBar, Toolbar, Typography, IconButton, MenuItem, Menu } from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import EditIcon from '@material-ui/icons/Edit'
import { Link } from 'react-router-dom';
import { useStyles, MenuButton } from './Style'
import { strings } from './Locale'
import { React, useState, useContext, useEffect } from 'react'
import { logoutUser } from './axiosreqs'
import { store } from './store.js'

export function NavBar({
    kirjautunut,setKirjautunut,
    currentUser,setCurrentUser,
    currentUserName,setCurrentUserName,
    currentExamId,setCurrentExamId,
    currentExamIndex,setCurrentExamIndex,
    examEdit,setExamEdit
}) {
    const classes = useStyles()
    const { state, dispatch } = useContext(store) 
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

        return (
            <>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            <MenuButton name="tentit" onClick={()=>{
                                if (window.location.pathname==="/admin" || window.location.pathname==="/user") {
                                    if (currentExamIndex >=0) {
                                        setCurrentExamIndex(-1)
                                        setCurrentExamId(-1)
                                    }
                                } else {
                                    window.location.pathname="/user"
                                    // if (examEdit) {
                                    //     window.location.pathname="/admin"
                                    // } else {
                                    //     window.location.pathname="/user"
                                    // }
                                 }
                            }                               
                            }>{strings.tentit}</MenuButton>
                            {/* {window.location.pathname==="/admin"?
                                <MenuButton name="tentit" href="/admin">{strings.tentit}</MenuButton>
                            :
                                <MenuButton name="tentit" href="/user">{strings.tentit}</MenuButton>
                            } */}
                            <Link style={{ textDecoration: 'none' }} to="/stats" ><MenuButton name="tilastot">{strings.tilastot}</MenuButton></Link>
                            <Link style={{ textDecoration: 'none' }} to="/upload"><MenuButton name="tiedostonlahetys">{strings.tiedostonlahetys}</MenuButton></Link>
                            <MenuButton name="tietoa" target="_blank" href="https://www.youtube.com/watch?v=sAqnNWUD79Q">
                                {strings.tietoa}
                            </MenuButton>
                        </Typography>
                        {/* <MenuButton name="user" href="/user" style={{ backgroundColor: "white", color: "blue", marginRight: "10px" }}>{strings.kayttaja}</MenuButton>
                        <MenuButton name="admin" href="/admin" style={{ backgroundColor: "white", color: "red" }}>{strings.yllapitaja}</MenuButton> */}
                        {/* <MenuButton name="kieli" onClick={() => vaihdetaanKieli()}>{strings.kieli + "(" + strings.getLanguage() + ")"}</MenuButton> */}
                        { window.location.pathname==="/admin"? 
                            <Link style={{ textDecoration: 'none' }} to="/user" >
                                <IconButton color='secondary' onClick={() => {
                                    setExamEdit(!examEdit)}}><EditIcon/>
                                </IconButton>
                            </Link> :
                            <Link style={{ textDecoration: 'none' }} to="/admin" >
                                <IconButton color='inherit' onClick={() => {
                                    setExamEdit(!examEdit)}}><EditIcon/>
                                </IconButton>
                            </Link>} 
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
                                    logoutUser(dispatch)
                                    setCurrentUser("")
                                    setCurrentUserName("")
                                    setAnchorEl(null)
                                }}>{strings.poistu}
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
            </>
        )
}