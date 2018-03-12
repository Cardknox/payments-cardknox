import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Random } from "meteor/random";
import { registerSchema } from "@reactioncommerce/reaction-collections";
var Cardknox = require('cardknox');
var qs = require('querystring')

// Test card to use to add risk level flag for testing purposes only.
export const RISKY_TEST_CARD = "4000000000009235";

// You should not implement ThirdPartyAPI. It is supposed to represent your third party API
// And is called so that it can be stubbed out for testing. This would be a library
// like Stripe or Authorize.net usually just included with a NPM.require

const ThirdPartyAPI = {
  authorize(transactionType, cardData, paymentData) {
    // const settings = Packages.findOne({
    //   name: "reaction-paymentmethod"
    // }).settings;
    var test = new Cardknox("ee81998a84ee4686b86e34d7ee3b8cc6DovidLeibE", "reaction commerce cardknox", "1.0.1");
    test.xCommand = 'cc:authonly';
    test.xAmount = paymentData.total;
    test.xCardNum = cardData.number;
    test.xCVV = cardData.cvv2;
    test.xExp = (cardData.expireMonth < 10 ? '0' + cardData.expireMonth : '' + cardData.expireMonth) + cardData.expireYear.substring(2, 4);
    test.xInvoice = "1";
    // var result = ;
    const result =  test.process();
    // jsonResponse = qs.parse(result)
    if (result.xResult = "A") {
      const results = {
        success: true,
        id: result.xInvoice,
        cardNumber: result.xMaskedCardNumber.slice(-4),
        amount: result.xAuthAmount,
        currency: "USD"
      };
      // This is for testing risk evaluation. Proper payment methods have dectection mechanisms for this.
      // This is just a sample
      if (cardData.number === RISKY_TEST_CARD) {
        results.riskStatus = "highest_risk_level";
      }
      return results;
    }
    return {
      success: false
    };
  },
  capture(authorizationId, amount) {
    return {
      authorizationId,
      amount,
      success: true
    };
  },
  refund(transactionId, amount) {
    return {
      success: true,
      transactionId,
      amount
    };
  },
  listRefunds(transactionId) {
    return {
      transactionId,
      refunds: [
        {
          type: "refund",
          amount: 3.99,
          created: 1454034562000,
          currency: "usd",
          raw: {}
        }
      ]
    };
  }
};

// This is the "wrapper" functions you should write in order to make your code more
// testable. You can either mirror the API calls or normalize them to the authorize/capture/refund/refunds
// that Reaction is expecting
export const CardknoxApi = {};
CardknoxApi.methods = {};

export const cardSchema = new SimpleSchema({
  number: { type: String },
  name: { type: String },
  cvv2: { type: String },
  expireMonth: { type: String },
  expireYear: { type: String },
  type: { type: String }
});

registerSchema("cardSchema", cardSchema);

export const paymentDataSchema = new SimpleSchema({
  total: { type: String },
  currency: { type: String }
});

registerSchema("paymentDataSchema", paymentDataSchema);


CardknoxApi.methods.authorize = new ValidatedMethod({
  name: "CardknoxApi.methods.authorize",
  validate: new SimpleSchema({
    transactionType: { type: String },
    cardData: { type: cardSchema },
    paymentData: { type: paymentDataSchema }
  }).validator(),
  run({ transactionType, cardData, paymentData }) {
    const results = ThirdPartyAPI.authorize(transactionType, cardData, paymentData);
    return results;
  }
});


CardknoxApi.methods.capture = new ValidatedMethod({
  name: "CardknoxApi.methods.capture",
  validate: new SimpleSchema({
    authorizationId: { type: String },
    amount: { type: Number, decimal: true }
  }).validator(),
  run(args) {
    const transactionId = args.authorizationId;
    const amount = args.amount;
    const results = ThirdPartyAPI.capture(transactionId, amount);
    return results;
  }
});


CardknoxApi.methods.refund = new ValidatedMethod({
  name: "CardknoxApi.methods.refund",
  validate: new SimpleSchema({
    transactionId: { type: String },
    amount: { type: Number, decimal: true }
  }).validator(),
  run(args) {
    const transactionId = args.transactionId;
    const amount = args.amount;
    const results = ThirdPartyAPI.refund(transactionId, amount);
    return results;
  }
});


CardknoxApi.methods.refunds = new ValidatedMethod({
  name: "CardknoxApi.methods.refunds",
  validate: new SimpleSchema({
    transactionId: { type: String }
  }).validator(),
  run(args) {
    const { transactionId } = args;
    const results = ThirdPartyAPI.listRefunds(transactionId);
    return results;
  }
});
