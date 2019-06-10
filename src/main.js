import Vue from "vue";
import { createStateMachine } from "kingly";
import { makeVueStateMachine } from "vue-state-driven";
import emitonoff from "emitonoff";
import { commandHandlers, effectHandlers, movieSearchFsmDef } from "./fsm";
import Search from "./Search";
import { getEventEmitterAdapter } from "./helpers";
import { events } from "./properties";
import "./index.css";
import "./uikit.css";

Vue.config.productionTip = false;

const options = { initialEvent: { [events.USER_NAVIGATED_TO_APP]: void 0 } };

const fsm = createStateMachine(movieSearchFsmDef, {
  debug: { console }
});

makeVueStateMachine({
  name: "App",
  renderWith: Search,
  props: ["screen", "query", "results", "title", "details", "cast"],
  fsm,
  commandHandlers,
  effectHandlers,
  eventHandler: getEventEmitterAdapter(emitonoff),
  options,
  Vue
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  template: "<App/>"
});
