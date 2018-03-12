import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";

export const Cardknox = {
  accountOptions() {
    const settings = Packages.findOne({
      name: "reaction-paymentmethod"
    }).settings;
    if (!settings.apiKey) {
      throw new Meteor.Error("invalid-credentials", "Invalid Credentials");
    }
    return settings.apiKey;
  },

  authorize(cardInfo, paymentInfo, callback) {
    Meteor.call("cardknoxSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
