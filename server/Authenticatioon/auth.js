const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
      res.status(401).json({ msg: "Authentication Token is not present" })
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (decode.email) {
      next();
    }
    else {
      res.status(401).json({ msg: "Authentication error" })
    }
  } catch (error) {
    res.status(401).json({ msg: "Authentication error" })
  }
}