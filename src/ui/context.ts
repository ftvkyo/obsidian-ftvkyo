import * as React from "react";

import type ObsidianFtvkyo from "@/main";


export const PluginContext = React.createContext<ObsidianFtvkyo | undefined>(undefined);

export const usePlugin = (): ObsidianFtvkyo => {
    const plugin = React.useContext(PluginContext);
    if (!plugin) {
        throw new Error("Plugin context not found");
    }
    return plugin;
};
