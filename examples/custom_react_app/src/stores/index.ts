import { configure } from "mobx"
import commonStore, { CommonStore } from './common.store';
import authStore, { AuthStore } from './auth.store';
import canvasDataStore, { CanvasDataStore } from "./canvasData.store";

// https://github.com/mobxjs/mobx/issues/2909
configure({
    enforceActions: "always",
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    // observableRequiresReaction: true,
    disableErrorBoundaries: true,
    isolateGlobalState: true,
})

export type RootStore = {
    authStore: AuthStore;
    commonStore: CommonStore;
    canvasDataStore: CanvasDataStore;
}

const rootStore: RootStore = {
    authStore,
    commonStore,
    canvasDataStore,
};

export default rootStore;
