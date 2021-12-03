export var EventType;
(function (EventType) {
    EventType[EventType["Click"] = 0] = "Click";
    EventType[EventType["DblClick"] = 1] = "DblClick";
    EventType[EventType["WebSocket"] = 2] = "WebSocket";
    EventType[EventType["Mqtt"] = 3] = "Mqtt";
    EventType[EventType["MoveIn"] = 4] = "MoveIn";
    EventType[EventType["MoveOut"] = 5] = "MoveOut";
    EventType[EventType["MouseUp"] = 6] = "MouseUp";
})(EventType || (EventType = {}));
export var EventAction;
(function (EventAction) {
    EventAction[EventAction["Link"] = 0] = "Link";
    EventAction[EventAction["StartAnimate"] = 1] = "StartAnimate";
    EventAction[EventAction["Function"] = 2] = "Function";
    EventAction[EventAction["WindowFn"] = 3] = "WindowFn";
    EventAction[EventAction["SetProps"] = 4] = "SetProps";
    EventAction[EventAction["PauseAnimate"] = 5] = "PauseAnimate";
    EventAction[EventAction["StopAnimate"] = 6] = "StopAnimate";
    EventAction[EventAction["Emit"] = 7] = "Emit";
})(EventAction || (EventAction = {}));
//# sourceMappingURL=event.js.map