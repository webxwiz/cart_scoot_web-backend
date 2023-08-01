import { checkAuth } from '../utils/_index.js';

const authMiddleware = (req, res, next) => {
    const { _id } = checkAuth(req.headers.authorization);
    req.userId = _id;
    next()
}

export default authMiddleware;