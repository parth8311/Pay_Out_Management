/**
 * RBAC Middleware - Role Based Access Control
 * Usage: authorize('OPS') or authorize('OPS', 'FINANCE')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user?.role}' is not authorized for this action.`
            });
        }
        next();
    };
};

module.exports = { authorize };
