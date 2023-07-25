import * as React from "react";

import type ObsidianFtvkyo from "@/main";


export const PluginContext = React.createContext<ObsidianFtvkyo | undefined>(undefined);

export const usePlugin = (): ObsidianFtvkyo | undefined => {
    return React.useContext(PluginContext);
};
