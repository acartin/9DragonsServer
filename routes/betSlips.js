const express = require('express');
const router = express.Router()

const advancedResults = require('../middleware/advancedResults');
const BetSlip = require('../models/BetSlip');

const {
  getAllBetSlips,
  getBetSlipsByUser,
  insertBetOnSlip,
  deleteBetOnSlip,
  updateBetOnSlip
} = require('../controllers/betSlips');


router.route('/')
.get(advancedResults(BetSlip), getAllBetSlips)
.post(insertBetOnSlip)

router.route('/:id')
.get(getBetSlipsByUser)
.delete(deleteBetOnSlip)
.put(updateBetOnSlip)


module.exports = router;
