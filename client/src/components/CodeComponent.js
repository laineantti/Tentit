import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs, far } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// merkkijonosta CODE sanan jälkeen tuleva osa tulkitaan koodiksi ja ennen CODE sanaa oleva osa kysymykseksi, jos CODE sanaa ei ole merkkijono tulostuu sellaisenaan

const CodeComponent = ({questionString, background}) => {

    let bs = ""
    switch (background) {
        case 'light':
            bs = vs
            break
        case 'darkBlue':
            bs = far
            break
        case 'dark':
            bs = far
        default:
            bs = vs
    }
    
    
    let codePos = questionString.search("CODE")
    if (codePos !== -1) {       // search palauttaa -1, jos etsittävää ei löydy
        let code = questionString.substring(codePos+5)
        let question = questionString.slice(0,codePos-1)
        return (
            <>
                {question}
                <SyntaxHighlighter language="javascript" style={bs} wrapLongLines={true}
                showLineNumbers={true}>
                    {code}
                </SyntaxHighlighter>
            </>
        )
    } else {
        return (
            <>
            {window.location.pathname!=="/admin" ?
                questionString 
            :""}
            </>
        )
    }
}

export default CodeComponent