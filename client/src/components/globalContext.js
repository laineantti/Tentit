import React, { createContext, useState } from 'react'

const MainContext = createContext()

const MainProvider = props => {
    const [showAllCardImages, setShowAllCardImages] = useState([])
    const [showAllChoiseImages, setShowAllChoiseImages] = useState([])

    return (
        <MainContext.Provider value={{
            globalShowAllCardImages: [showAllCardImages, setShowAllCardImages],
            globalShowAllChoiseImages: [showAllChoiseImages, setShowAllChoiseImages]
        }}>
            {props.children}
        </MainContext.Provider>
    )
}

export { MainContext, MainProvider }