import { Store } from 'le5le-store';
var Layer = /** @class */ (function () {
    function Layer(TID) {
        var _this = this;
        this.TID = TID;
        this.subcribe = Store.subscribe(this.generateStoreKey('topology-data'), function (val) {
            _this.data = val;
        });
    }
    Layer.prototype.generateStoreKey = function (key) {
        return "".concat(this.TID, "-").concat(key);
    };
    Layer.prototype.destroy = function () {
        this.subcribe.unsubscribe();
    };
    return Layer;
}());
export { Layer };
//# sourceMappingURL=layer.js.map