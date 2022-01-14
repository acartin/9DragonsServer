const ErrorResponse = require('../utils/errorResponse');
//const asyncHandler = require('../middleware/async');
const BetSlip = require('../models/BetSlip');


// Un bet slip se compone de uno o varios bets agrupados por un numero de userID

//exports.getBetSlip = asyncHandler(async (req, res, next) => {
 // res.status(200).json(res.advancedResults);
//});

// @desc      Get betSlip by User  retornara un grupo de bets
// @route     GET /api/v1/bootcamps/:id
// @access    Public
/*
exports.getBetSlipsByUser = asyncHandler(async (req, res, next) => {
  const betSlip = await BetSlip.find(req.params.id)

  if (!betSlip) {
    return next(
      new ErrorResponse(`betSlip not found for user ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: betSlip });
});

*/


// @desc      Get All betSlips
// @route     GET api/v1/betslips/:id
// @access    Public
exports.getAllBetSlips = async (req, res, next)  => {
  try {
    
    res.status(200).json(res.advancedResults);
    //const betSlips = await BetSlip.find({})
    //res.status(201).json({
    //success: true, 
    //count: betSlips.length,
    //data: betSlips
    //})
  } catch (err) {
    next(err)
  } 
}

// @desc      Get betSlipsByUser
// @route     GET api/v1/betslips/:id
// @access    Public
exports.getBetSlipsByUser = async (req, res, next)  => {
  try {
    const betsSlip = await BetSlip.findOne({UserID: req.params.id})
     //if(betsSlip.length === 0) {
      if(!betsSlip) {
        return next(
          new ErrorResponse(`Bet slip not found for user ${req.params.id}`, 404)
          //normalmente se esta yendo por el catch
        );    
    }
    res.status(201).json({
    success: true, 
    count: betsSlip.length,
    data: betsSlip
    })
  } catch (err) {
    next(err)
  } 
}

// @desc      Create new bet on user bet slip
// @route     POST /api/v1/betslips
// @access    Private
exports.insertBetOnSlip = async (req, res, next)  => {
  try {
    const betOnSlip = await BetSlip.create(req.body)
    res.status(201).json({
      success:true, 
       data: betOnSlip
    })
  } catch (err) {
    next(err)
  }
}

// @desc      Delete bet on a slip, receives bet _id
// @route     DELETE /api/v1/betslips/:id
// @access    Private
exports.deleteBetOnSlip = async (req, res, next)  => {
  try {
    const betOnSlip = await BetSlip.findByIdAndDelete(req.params.id)

    if(!betOnSlip){
      return next(
        new ErrorResponse(`Bet slip ${req.params.id} not found`, 404)
        //normalmente se esta yendo por el catch
      );
    }

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (err) {
    next(err)
  }
 
}


// @desc      Update bet on a bet slip
// @route     PUT /api/v1/betslips/:id
// @access    Private
exports.updateBetOnSlip = async (req, res, next)  => {
  try {
    const betOnSlip = await BetSlip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if(!betOnSlip){
      return next(
        new ErrorResponse(`Bet slip ${req.params.id} not found`, 404)
        //normalmente se esta yendo por el catch
      );
    }

    res.status(200).json({
      success: true,
      data: betOnSlip
    })
  } catch (err) {
    next(err)
  }
}
  


// @desc      Este es un ejemplo sin utilizar el manejo de errores ni el async Handler
// @route     PUT /api/v1/betslips/:id
// @access    Private
exports.EjemploSencillo = async (req, res, next)  => {
  try {
    const betOnSlip = await BetSlip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if(!betOnSlip){
      return res.status(400).json({success: false})
    }

    res.status(200).json({
      success: true,
      data: betOnSlip
    })
  } catch (error) {
     res.status(400).json({success: false})
  }
}
  

