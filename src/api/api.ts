import ApiSource from "./source";
import ApiView from "./view";


// A collection of all plugin APIs.
export default class Api {
    view = new ApiView();
    source = new ApiSource();
}


export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}

