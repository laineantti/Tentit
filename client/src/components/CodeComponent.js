import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// merkkijonosta CODE sanan jälkeen tuleva osa tulkitaan koodiksi ja ennen CODE sanaa oleva osa kysymykseksi, jos CODE sanaa ei ole merkkijono tulostuu sellaisenaan

const CodeComponent = ({questionString,isCodeQuestionEdit,background}) => {

    let codePos = questionString.search("CODE")
    if (codePos !== -1) {       // search palauttaa -1, jos etsittävää ei löydy
        let code = questionString.substring(codePos+5)
        let question = questionString.slice(0,codePos-1)
        return (
            <>
                {question}
                <SyntaxHighlighter language="javascript" style={vs} wrapLongLines={true}
                showLineNumbers={true}>
                    {code}
                </SyntaxHighlighter>
            </>
        )
    } else {
        return (
            <>
                {questionString}
            </>
        )
    }
}

export default CodeComponent