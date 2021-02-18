const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken'); //token



const getTokenFrom = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const isAuthenticated = (request, response, next) => {
    const token = getTokenFrom(request);

    if (!token) {
        return response.status(401).json({ error: 'token missing' });
    }

    let decodedToken = null;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch (error) {
        console.log("jwt error");
    }

    if (!decodedToken || !decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' });
    }    
    console.log("autentikoitu")
    next()
}

module.exports = isAuthenticated;