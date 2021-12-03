import { Store } from 'le5le-store';
import { s8 } from '../utils/uuid';
import { Rect } from './rect';
import { EventType } from './event';
import { deepClone } from '../utils/clone';
export var PenType;
(function (PenType) {
    PenType[PenType["Node"] = 0] = "Node";
    PenType[PenType["Line"] = 1] = "Line";
})(PenType || (PenType = {}));
var eventFns = [
    'link',
    'doStartAnimate',
    'doFn',
    'doWindowFn',
    '',
    'doPauseAnimate',
    'doStopAnimate',
    'doEmit',
];
var defaultPen = {
    name: '',
    tags: [],
    visible: true,
    rect: new Rect(0, 0, 0, 0),
    fontColor: '',
    fontFamily: '"Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial',
    fontSize: 12,
    lineHeight: 1.5,
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'center',
    textBaseline: 'middle',
    textBackground: '',
    animateCycleIndex: 0,
    events: [],
    dash: 0,
    lineDashOffset: 0,
    lineWidth: 1,
    strokeStyle: '',
    fillStyle: '',
    globalAlpha: 1,
    rotate: 0,
    offsetRotate: 0,
    textMaxLine: 0,
    textOffsetX: 0,
    textOffsetY: 0,
    animatePos: 0,
};
export var images = {};
var Pen = /** @class */ (function () {
    function Pen() {
    }
    Pen.prototype.fromData = function (defaultData, json) {
        if (!json) {
            json = {};
        }
        else if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        defaultPen.id = s8();
        defaultData = Object.assign({}, defaultPen, defaultData);
        for (var key in defaultData) {
            this[key] = defaultData[key];
        }
        for (var key in json) {
            this[key] = json[key];
        }
        if (Array.isArray(this.tags)) {
            this.tags = Object.assign([], this.tags);
        }
        if (this.rect) {
            this.rect = new Rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        }
        this.lineWidth = this.lineWidth || 1;
        // 兼容老格式
        if (!this.fontColor && json.font) {
            this.fontColor = json.font.color || this.fontColor;
            this.fontFamily = json.font.fontFamily || this.fontFamily;
            this.fontSize = json.font.fontSize || this.fontSize;
            this.lineHeight = json.font.lineHeight || this.lineHeight;
            this.fontStyle = json.font.fontStyle || this.fontStyle;
            this.fontWeight = json.font.fontWeight || this.fontWeight;
            this.textAlign = json.font.textAlign || this.textAlign;
            this.textBaseline = json.font.textBaseline || this.textBaseline;
            this.textBackground = json.font.background || this.textBackground;
            delete this['font'];
        }
        // end
        if (this.events) {
            this.events = deepClone(this.events);
        }
        if (this.wheres) {
            this.wheres = deepClone(this.wheres);
        }
        if (typeof this.data === 'object') {
            this.data = JSON.parse(JSON.stringify(this.data));
        }
        delete this['img'];
        delete this['animateStart'];
        delete this['animateReady'];
    };
    Pen.prototype.render = function (ctx) {
        if (!this.visible) {
            return;
        }
        if (this.from && !this.to) {
            if (this.children) {
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var item = _a[_i];
                    item.render(ctx);
                }
            }
            return;
        }
        ctx.save();
        // for canvas2svg
        if (ctx.setAttrs) {
            ctx.setAttrs(this);
        }
        // end
        if (this.rotate || this.offsetRotate) {
            ctx.translate(this.rect.center.x, this.rect.center.y);
            ctx.rotate(((this.rotate + this.offsetRotate) * Math.PI) / 180);
            ctx.translate(-this.rect.center.x, -this.rect.center.y);
        }
        if (this.lineWidth > 1) {
            ctx.lineWidth = this.lineWidth;
        }
        if (this.strokeImage) {
            if (this.strokeImage === this.lastStrokeImage && this.strokeImg) {
                ctx.strokeStyle = ctx.createPattern(this.strokeImg, 'repeat');
            }
            else {
                this.loadStrokeImg();
            }
        }
        else {
            ctx.strokeStyle =
                this.strokeStyle || Store.get(this.generateStoreKey('LT:color'));
        }
        if (this.fillImage) {
            if (this.fillImage === this.lastFillImage && this.fillImg) {
                ctx.fillStyle = ctx.createPattern(this.fillImg, 'repeat');
            }
            else {
                this.loadFillImg();
            }
        }
        else if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
        }
        if (this.lineCap) {
            ctx.lineCap = this.lineCap;
        }
        else if (this.type === PenType.Line) {
            ctx.lineCap = 'round';
        }
        if (this.globalAlpha < 1) {
            ctx.globalAlpha = this.globalAlpha;
        }
        if (this.lineDash) {
            ctx.setLineDash(this.lineDash);
        }
        else {
            switch (this.dash) {
                case 1:
                    ctx.setLineDash([5, 5]);
                    break;
                case 2:
                    ctx.setLineDash([10, 10]);
                    break;
                case 3:
                    ctx.setLineDash([10, 10, 2, 10]);
                    break;
                case 4:
                    ctx.setLineDash([1, 16]);
                    break;
            }
        }
        if (this.lineDashOffset) {
            ctx.lineDashOffset = this.lineDashOffset;
        }
        if (this.shadowColor) {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowOffsetX = this.shadowOffsetX;
            ctx.shadowOffsetY = this.shadowOffsetY;
            ctx.shadowBlur = this.shadowBlur;
        }
        this.draw(ctx);
        ctx.restore();
        if (this.children) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var item = _c[_b];
                item.render(ctx);
            }
        }
    };
    Pen.prototype.loadFillImg = function () {
        var _this = this;
        if (!this.fillImage) {
            return;
        }
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.fillImage;
        img.onload = function () {
            _this.lastFillImage = _this.fillImage;
            _this.fillImg = img;
            images[_this.fillImage] = {
                img: img,
            };
            Store.set(_this.generateStoreKey('LT:imageLoaded'), true);
        };
    };
    Pen.prototype.loadStrokeImg = function () {
        var _this = this;
        if (!this.strokeImage) {
            return;
        }
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.strokeImage;
        img.onload = function () {
            _this.lastStrokeImage = _this.strokeImage;
            _this.strokeImg = img;
            images[_this.strokeImage] = {
                img: img,
            };
            Store.set(_this.generateStoreKey('LT:imageLoaded'), true);
        };
    };
    Pen.prototype.click = function () {
        if (!this.events) {
            return;
        }
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.type !== EventType.Click) {
                continue;
            }
            this[eventFns[item.action]] &&
                this[eventFns[item.action]](item.value, item.params);
        }
    };
    Pen.prototype.mouseUp = function () {
        if (!this.events) {
            return;
        }
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.type !== EventType.MouseUp) {
                continue;
            }
            this[eventFns[item.action]] &&
                this[eventFns[item.action]](item.value, item.params);
        }
    };
    Pen.prototype.dblclick = function () {
        if (!this.events) {
            return;
        }
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.type !== EventType.DblClick) {
                continue;
            }
            this[eventFns[item.action]] &&
                this[eventFns[item.action]](item.value, item.params);
        }
    };
    Pen.prototype.moveIn = function () {
        if (!this.events) {
            return;
        }
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.type !== EventType.MoveIn) {
                continue;
            }
            this[eventFns[item.action]] &&
                this[eventFns[item.action]](item.value, item.params);
        }
    };
    Pen.prototype.moveOut = function () {
        if (!this.events) {
            return;
        }
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.type !== EventType.MoveOut) {
                continue;
            }
            this[eventFns[item.action]] &&
                this[eventFns[item.action]](item.value, item.params);
        }
    };
    Pen.prototype.doWheres = function () {
        var _this = this;
        if (!this.wheres) {
            return;
        }
        this.wheres.forEach(function (where) {
            if (where.fn instanceof Function) { // 函数类型 fn
                if (where.fn(_this)) {
                    where.actions &&
                        where.actions.forEach(function (action) {
                            _this.doAction(action);
                        });
                }
            }
            else if (where.fn && where.fn.trim()) { // 字符串类型 fn
                var fn = new Function('pen', where.fn);
                if (fn(_this)) {
                    where.actions &&
                        where.actions.forEach(function (action) {
                            _this.doAction(action);
                        });
                }
            }
            else { // fn 为空
                var fn = new Function('attr', "return attr ".concat(where.comparison, " ").concat(where.value));
                if (fn(_this[where.key])) {
                    where.actions &&
                        where.actions.forEach(function (action) {
                            _this.doAction(action);
                        });
                }
            }
        });
    };
    Pen.prototype.doAction = function (action) {
        switch (action.do || action.action) {
            case 0:
            case 'Link':
                this.link(action.url || action.value, action._blank || action.params);
                break;
            case 1:
            case 'StartAnimate':
                this.doStartAnimate(action.tag || action.value);
                break;
            case 5:
            case 'PauseAnimate':
                this.doPauseAnimate(action.tag || action.value);
                break;
            case 6:
            case 'StopAnimate':
                this.doStopAnimate(action.tag || action.value);
                break;
            case 2:
            case 'Function':
                this.doFn(action.fn || action.value, action.params);
                break;
            case 3:
            case 'WindowFn':
                this.doWindowFn(action.fn || action.value, action.params);
                break;
            case 7:
            case 'Emit':
                this.doEmit(action.fn || action.value, action.params);
                break;
        }
    };
    Pen.prototype.show = function () {
        this.visible = true;
        return this;
    };
    Pen.prototype.hide = function () {
        this.visible = false;
        return this;
    };
    Pen.prototype.isVisible = function () {
        return this.visible;
    };
    Pen.prototype.getTID = function () {
        return this.TID;
    };
    Pen.prototype.setTID = function (id) {
        this.TID = id;
        if (this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var item = _a[_i];
                item.setTID(id);
            }
        }
        return this;
    };
    Pen.prototype.startAnimate = function () {
        this.animateStart = Date.now();
        if (this.type === PenType.Node && !this['animateReady']) {
            this['initAnimate']();
        }
        Store.set(this.generateStoreKey('LT:AnimatePlay'), {
            pen: this,
        });
        // 跟随动画播放
        if (this['playType'] === 2) {
            this.play();
        }
    };
    Pen.prototype.play = function (pause) {
        Store.set(this.generateStoreKey('LT:play'), {
            pen: this,
            pause: pause,
        });
    };
    Pen.prototype.link = function (url, params) {
        window.open(url, params === undefined ? '_blank' : params);
    };
    Pen.prototype.doStartAnimate = function (tag, params) {
        if (tag) {
            Store.set(this.generateStoreKey('LT:AnimatePlay'), {
                tag: tag,
            });
        }
        else {
            this.startAnimate();
        }
    };
    Pen.prototype.doPauseAnimate = function (tag, params) {
        if (tag) {
            Store.set(this.generateStoreKey('LT:AnimatePlay'), {
                tag: tag,
                stop: true,
            });
        }
        else {
            this.pauseAnimate();
        }
    };
    Pen.prototype.doStopAnimate = function (tag, params) {
        if (tag) {
            Store.set(this.generateStoreKey('LT:AnimatePlay'), {
                tag: tag,
                stop: true,
            });
        }
        else {
            this.stopAnimate();
        }
    };
    Pen.prototype.doFn = function (fn, params) {
        if (fn instanceof Function)
            return fn(this, params);
        var func = new Function('pen', 'params', fn);
        func(this, params);
    };
    Pen.prototype.doWindowFn = function (fn, params) {
        window[fn](this, params);
    };
    Pen.prototype.doEmit = function (event, params) {
        Store.set(this.generateStoreKey('LT:emit'), {
            event: event,
            params: params,
            pen: this,
        });
    };
    Pen.prototype.generateStoreKey = function (key) {
        return "".concat(this.TID, "-").concat(key);
    };
    return Pen;
}());
export { Pen };
//# sourceMappingURL=pen.js.map