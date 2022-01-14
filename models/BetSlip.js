const mongoose = require('mongoose');

const BetSlipSchema = new mongoose.Schema({
    UserID:{
      type: String,
      required: true
    },
    OddID:{
      type: String,
       required: true
    },
  Date:{
    type: Date,
    default: Date.now
  },
  Team:{
    type: String,
    required: true
  },
  HomeTeam:{
    type: String,
    required: true
  },
  AwayTeam:{
    type: String,
    required: true
  },
  Market:{
    type: String,
    required: true
  },
  MarketValue:{
    type: String,
    required: [true, 'Please include an market value']
  },
  BetAmount:{
    type: Number,
    required: [true, 'Please include an beat amount value']
  },
  BetPayment:{
    type: Number,
    required: true
  },
  Sport:{
    type: String,
    required: true
  },
  MatchDate:{
    type: Date,
    required: true
  },
  OddType:{
    type: String
  }
}, { collection: 'betSlips' });

// una prueba de pre
BetSlipSchema.pre('save', function(next) {
  console.log('Pre saving', this.UserID)
  next();
});

module.exports = mongoose.model('BetSlip', BetSlipSchema);