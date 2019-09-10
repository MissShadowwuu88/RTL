const NetworkController = require("../../controllers/c-lightning/network");
const express = require("express");
const router = express.Router();
const authCheck = require("../authCheck");

router.get("/getRoute/:destPubkey/:amount", authCheck, NetworkController.getRoute);
router.get("/listNode/:id", authCheck, NetworkController.listNode);
router.get("/listChannel/:channelShortId", authCheck, NetworkController.listChannel);
router.get("/feeRates", authCheck, NetworkController.feeRates);

module.exports = router;
