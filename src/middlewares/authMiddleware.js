import { checkAuth } from '../utils/_index.js';

const authMiddleware = (req, res, next) => {

    const { _id, role } = checkAuth(req.headers.authorization);
    req.userId = _id;
    req.userRole = role;

    next()
}

export default authMiddleware;