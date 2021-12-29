import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import rootStore, { RootStore } from './stores'

const StoreContext = React.createContext<RootStore | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const store = useLocalStore(() => rootStore);
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
    const store = React.useContext(StoreContext);
    if (!store) {
        // this is especially useful in TypeScript so you don't need to be checking for null all the time
        throw new Error('useStore must be used within a StoreProvider.');
    }
    return store;
}
