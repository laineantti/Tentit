*** Settings ***
Library  SeleniumLibrary

*** Test Cases ***
Tentin avaaminen
    Open Browser  http://localhost:3000/      chrome
    sleep  3s
    Click Button  name=Värit
    sleep  2s
    Click Button  name=vastaukset
    Close Browser