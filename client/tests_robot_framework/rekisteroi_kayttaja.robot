*** Settings ***
Library  SeleniumLibrary

*** Test Cases ***
Uuden käyttäjän rekisteröinti
    Open Browser  http://localhost:3000/      chrome
    sleep  3s
    Click Link  name=rekisteroidy
    Input Text    name=etunimi    Robot
    Input Text    name=sukunimi    Framework
    Input Text    name=sahkoposti    robotti@ruttunen.fi
    Input Text    name=salasana    uuni1234

    Click Button  name=rekisteroidy_nappi
    Close Browser