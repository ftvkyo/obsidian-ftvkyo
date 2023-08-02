import ObsidianFtvkyo from "@/main";

import ApiNote from "./note";


// A collection of all plugin APIs.
export default class Api {
    constructor(
        public readonly plugin: ObsidianFtvkyo,
    ) {}

    note = new ApiNote(
        this.plugin,
    );
}
