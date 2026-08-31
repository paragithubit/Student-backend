module.exports = (...roles) => {
  return (req, res, next) => {

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "Access denied"
      });
    }

    next();
  };
};