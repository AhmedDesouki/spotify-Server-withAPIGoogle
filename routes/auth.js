const router = require("express").Router();
const { loginUser, googlelogin } = require("../controllers/auth");

router.post("/", loginUser);

router.post("/google", googlelogin);
module.exports = router;
