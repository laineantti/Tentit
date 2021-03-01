import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// merkkijonosta CODE sanan jälkeen tuleva osa tulkitaan koodiksi ja ennen CODE sanaa oleva osa kysymykseksi, jos CODE sanaa ei ole merkkijono tulostuu sellaisenaan

const CodeComponent = ({questionString}) => {
    let examQuestion = questionString
    let codePos = examQuestion.search("CODE")
    if (codePos !== -1) {       // seach palauttaa -1, jos etsittävää ei löydy
        let code = examQuestion.substring(codePos+5)
        let question = examQuestion.slice(0,codePos-1)
        return (
            <>
                {question}
                <SyntaxHighlighter language="javascript" style={docco} wrapLongLines={true}
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