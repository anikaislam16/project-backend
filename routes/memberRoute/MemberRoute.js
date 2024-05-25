const express = require('express');
const memberInfomation = require('./MemberInfo');
const router = express.Router();
router.use('/', memberInfomation);
module.exports = router;