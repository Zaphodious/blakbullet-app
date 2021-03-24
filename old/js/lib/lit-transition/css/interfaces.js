/**
 * in-out: enter transition starts playing right away
 * out-in: enter transition only plays after leave completed
 * both: both transitions play immediately
 */
export var TransitionMode;
(function (TransitionMode) {
    TransitionMode["InOut"] = "in-out";
    TransitionMode["OutIn"] = "out-in";
    TransitionMode["Both"] = "both";
})(TransitionMode || (TransitionMode = {}));
/**
 * in-out: enter transition starts playing right away
 * out-in: enter transition only plays after leave completed
 * both: both transitions play immediately
 */
export var GeometryLockMode;
(function (GeometryLockMode) {
    GeometryLockMode[GeometryLockMode["None"] = 0] = "None";
    GeometryLockMode[GeometryLockMode["Lock"] = 1] = "Lock";
    GeometryLockMode["Auto"] = "auto";
})(GeometryLockMode || (GeometryLockMode = {}));
//# sourceMappingURL=interfaces.js.map