import { Template } from "meteor/templating";
import { CardknoxSettingsFormContainer } from "../containers";
import "./cardknox.html";

Template.cardknoxSettings.helpers({
  CardknoxSettings() {
    return {
      component: CardknoxSettingsFormContainer
    };
  }
});
