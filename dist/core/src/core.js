import { Store } from 'le5le-store';
// https://github.com/developit/mitt
import { default as mitt } from 'mitt';
import { KeyType, KeydownType, DefalutOptions, fontKeys } from './options';
import { PenType } from './models/pen';
import { Node } from './models/node';
import { Point } from './models/point';
import { Line } from './models/line';
import { createData } from './models/data';
import { Lock, AnchorMode } from './models/status';
import { drawNodeFns, drawLineFns, calcTextRect } from './middles';
import { Offscreen } from './offscreen';
import { RenderLayer } from './renderLayer';
import { HoverLayer } from './hoverLayer';
import { ActiveLayer } from './activeLayer';
import { AnimateLayer } from './animateLayer';
import { DivLayer } from './divLayer';
import { Rect } from './models/rect';
import { s8 } from './utils/uuid';
import { del, find, getParent, pointInRect } from './utils/canvas';
import { getBboxOfPoints, getMoreRect, getRect } from './utils/rect';
import { formatPadding } from './utils/padding';
import { Socket } from './socket';
import { MQTT } from './mqtt';
import { Direction, EventType as SocketEventType } from './models';
import { createCacheTable, getCache, isMobile, pushCache, spliceCache } from './utils';
import pkg from './../package.json';
import { Scroll } from './models/scroll';
var resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];
var MoveInType;
(function (MoveInType) {
    MoveInType[MoveInType["None"] = 0] = "None";
    MoveInType[MoveInType["Line"] = 1] = "Line";
    MoveInType[MoveInType["LineFrom"] = 2] = "LineFrom";
    MoveInType[MoveInType["LineTo"] = 3] = "LineTo";
    MoveInType[MoveInType["LineControlPoint"] = 4] = "LineControlPoint";
    MoveInType[MoveInType["Nodes"] = 5] = "Nodes";
    MoveInType[MoveInType["ResizeCP"] = 6] = "ResizeCP";
    MoveInType[MoveInType["HoverAnchors"] = 7] = "HoverAnchors";
    MoveInType[MoveInType["AutoAnchor"] = 8] = "AutoAnchor";
    MoveInType[MoveInType["Rotate"] = 9] = "Rotate";
    MoveInType[MoveInType["GraffitiReady"] = 10] = "GraffitiReady";
    MoveInType[MoveInType["Graffiti"] = 11] = "Graffiti";
    MoveInType[MoveInType["LinesReady"] = 12] = "LinesReady";
    MoveInType[MoveInType["Lines"] = 13] = "Lines";
})(MoveInType || (MoveInType = {}));
var dockOffset = 10;
var Topology = /** @class */ (function () {
    function Topology(parent, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.VERSION = pkg.version;
        this.id = s8();
        this.data = createData(undefined, this.id);
        this.caches = {
            index: 0,
            dbIndex: 0,
            list: [],
        };
        this.touchStart = 0;
        this.input = document.createElement('textarea');
        this.lastTranlated = { x: 0, y: 0 };
        this.moveIn = {
            type: MoveInType.None,
            activeAnchorIndex: 0,
            hoverAnchorIndex: 0,
            hoverNode: undefined,
            hoverLine: undefined,
            activeNode: undefined,
            lineControlPoint: undefined,
        };
        this.needCache = false;
        this.tip = '';
        this.scheduledAnimationFrame = false;
        this.scrolling = false;
        this.rendering = false;
        // true 已经复制
        this.alreadyCopy = false;
        this.onScroll = function () {
            _this.canvasPos = _this.divLayer.canvas.getBoundingClientRect();
        };
        this.preventDefault = function (event) {
            event.preventDefault();
        };
        this.winResize = function () {
            var timer;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                _this.resize();
            }, 100);
        };
        this.calibrateMouse = function (pt) {
            pt.x -= _this.data.x;
            pt.y -= _this.data.y;
            return pt;
        };
        this.subscribeSocket = function () {
            if (!_this.data.socketFn) {
                return false;
            }
            if (!_this.data.socketEvent) {
                _this.data.socketEvent = true;
            }
            try {
                var socketFn = new Function('e', _this.data.socketFn);
                if (_this.socketFn) {
                    _this.off('websocket', _this.socketFn);
                    _this.off('mqtt', _this.socketFn);
                }
                _this.on('websocket', socketFn);
                _this.on('mqtt', socketFn);
                _this.socketFn = socketFn;
            }
            catch (e) {
                console.error('Create the function for socket:', e);
                return false;
            }
            return true;
        };
        this.onMouseMove = function (e) {
            var _a;
            if (_this.scheduledAnimationFrame || ((_a = _this.data) === null || _a === void 0 ? void 0 : _a.locked) === Lock.NoEvent) {
                return;
            }
            // https://caniuse.com/#feat=mdn-api_mouseevent_buttons
            if (_this.mouseDown && !_this.mouseDown.restore && e.buttons !== 1 && e.buttons !== 2) {
                // 防止异常情况导致mouseup事件没有触发
                _this.onmouseup(e);
                return;
            }
            if (_this.mouseDown && (_this.data.locked || _this.spaceDown || !_this.moveIn.type)) {
                var b = !!_this.data.locked;
                switch (_this.options.translateKey) {
                    case KeyType.Right:
                        if (e.buttons == 2) {
                            b = true;
                        }
                        break;
                    case KeyType.Any:
                        b = true;
                        break;
                    case KeyType.Ctrl:
                        if (e.ctrlKey) {
                            b = true;
                        }
                        break;
                    case KeyType.Shift:
                        if (e.shiftKey) {
                            b = true;
                        }
                        break;
                    case KeyType.Alt:
                        if (e.altKey) {
                            b = true;
                        }
                        break;
                    default:
                        if (e.ctrlKey || e.altKey || e.buttons == 2) {
                            b = true;
                        }
                }
                if (_this.spaceDown || (!_this.options.disableTranslate && b && _this.data.locked < Lock.NoMove)) {
                    _this.translate(e.x, e.y, true);
                    return false;
                }
            }
            if (_this.data.locked && _this.mouseDown) {
                return;
            }
            _this.scheduledAnimationFrame = true;
            if (_this.raf)
                cancelAnimationFrame(_this.raf);
            _this.raf = requestAnimationFrame(function () {
                _this.raf = undefined;
                var pt = _this.calibrateMouse({ x: e.x, y: e.y });
                if (_this.moveIn.type === MoveInType.Lines) { // 钢笔工具
                    if (_this.hoverLayer.line) {
                        _this.hoverLayer.lineTo(new Point(pt.x, pt.y), '');
                        if (e.shiftKey || e.ctrlKey || e.altKey || e.buttons == 2) {
                            _this.hoverLayer.line.name = 'curve';
                            _this.hoverLayer.line.calcControlPoints();
                        }
                        else {
                            _this.hoverLayer.line.name = 'line';
                        }
                        _this.render();
                    }
                    _this.scheduledAnimationFrame = false;
                    return;
                }
                if (!_this.mouseDown) {
                    _this.getMoveIn(pt);
                    // Render hover anchors.
                    if (_this.moveIn.hoverNode !== _this.lastHoverNode) {
                        if (_this.lastHoverNode) {
                            _this.lastHoverNode.moveOut();
                            // Send a move event.
                            _this.dispatch('moveOutNode', _this.lastHoverNode);
                            _this.hideTip();
                            // Clear hover anchors.
                            _this.hoverLayer.node = undefined;
                        }
                        if (_this.moveIn.hoverNode) {
                            _this.hoverLayer.node = _this.moveIn.hoverNode;
                            _this.moveIn.hoverNode.moveIn();
                            // Send a move event.
                            _this.dispatch('moveInNode', Object.assign(_this.moveIn.hoverNode, {
                                evs: {
                                    x: e.pageX,
                                    y: e.pageY,
                                }
                            }));
                            _this.showTip(_this.moveIn.hoverNode, pt);
                        }
                    }
                    if (_this.moveIn.hoverLine !== _this.lastHoverLine && !_this.moveIn.hoverNode) {
                        if (_this.lastHoverLine) {
                            _this.lastHoverLine.moveOut();
                            _this.dispatch('moveOutLine', _this.lastHoverLine);
                            _this.hideTip();
                        }
                        if (_this.moveIn.hoverLine) {
                            _this.hoverLayer.line = _this.moveIn.hoverLine;
                            _this.moveIn.hoverLine.moveIn();
                            _this.dispatch('moveInLine', Object.assign(_this.moveIn.hoverLine, {
                                evs: {
                                    x: e.pageX,
                                    y: e.pageY,
                                }
                            }));
                            _this.showTip(_this.moveIn.hoverLine, pt);
                        }
                    }
                    if (_this.moveIn.type === MoveInType.LineControlPoint) {
                        _this.hoverLayer.hoverLineCP = _this.moveIn.lineControlPoint;
                    }
                    else if (_this.hoverLayer.hoverLineCP) {
                        _this.hoverLayer.hoverLineCP = undefined;
                    }
                    if (_this.moveIn.hoverNode !== _this.lastHoverNode ||
                        _this.moveIn.type === MoveInType.HoverAnchors ||
                        _this.hoverLayer.lasthoverLineCP !== _this.hoverLayer.hoverLineCP) {
                        _this.hoverLayer.lasthoverLineCP = _this.hoverLayer.hoverLineCP;
                        _this.render();
                    }
                    _this.scheduledAnimationFrame = false;
                    return;
                }
                // Move out parent element.
                var moveOutX = e.x + 50 > _this.parentElem.clientWidth + _this.parentElem.scrollLeft;
                var moveOutY = e.y + 50 > _this.parentElem.clientHeight + _this.parentElem.scrollTop;
                if (!_this.options.disableMoveOutParent && (moveOutX || moveOutY)) {
                    _this.dispatch('moveOutParent', e);
                    var x = 0;
                    var y = 0;
                    if (e.x + 50 > _this.divLayer.canvas.clientWidth) {
                        x = -5;
                    }
                    if (e.y + 50 > _this.divLayer.canvas.clientHeight) {
                        y = -5;
                    }
                    _this.translate(x, y, false);
                }
                _this.hideTip();
                switch (_this.moveIn.type) {
                    case MoveInType.None:
                        _this.hoverLayer.dragRect = new Rect(_this.mouseDown.x - _this.data.x, _this.mouseDown.y - _this.data.y, e.x - _this.mouseDown.x, e.y - _this.mouseDown.y);
                        break;
                    case MoveInType.Nodes:
                        if (_this.activeLayer.locked() || _this.data.locked) {
                            break;
                        }
                        if (e.ctrlKey && !_this.alreadyCopy) {
                            // 按住 ctrl，复制一个新节点
                            _this.alreadyCopy = true;
                            _this.copy();
                            _this.paste();
                            _this.needCache = true;
                        }
                        else {
                            var x = e.x - _this.mouseDown.x;
                            var y = e.y - _this.mouseDown.y;
                            if (x || y) {
                                var offset = _this.getDockPos(x, y, e.ctrlKey || e.shiftKey || e.altKey);
                                _this.activeLayer.move(offset.x ? offset.x : x, offset.y ? offset.y : y);
                                _this.needCache = true;
                            }
                        }
                        break;
                    case MoveInType.ResizeCP: {
                        var x = e.x - _this.mouseDown.x;
                        var y = e.y - _this.mouseDown.y;
                        if (x || y) {
                            var offset = _this.getDockPos(x, y, e.ctrlKey || e.shiftKey || e.altKey);
                            var offsetE = Object.assign({}, e);
                            offset.x && (offsetE.x = offset.x + _this.mouseDown.x);
                            offset.y && (offsetE.y = offset.y + _this.mouseDown.y);
                            _this.activeLayer.resize(_this.moveIn.activeAnchorIndex, _this.mouseDown, offsetE);
                            _this.dispatch('resizePens', _this.activeLayer.pens);
                            _this.needCache = true;
                        }
                        break;
                    }
                    case MoveInType.LineTo:
                    case MoveInType.HoverAnchors:
                    case MoveInType.AutoAnchor:
                        if (_this.hoverLayer.dockAnchor && _this.hoverLayer.dockAnchor.hit(e, 10)) {
                            break;
                        }
                        var arrow = _this.data.toArrow;
                        if (_this.moveIn.hoverLine) {
                            arrow = _this.moveIn.hoverLine.toArrow;
                        }
                        if (_this.hoverLayer.line) {
                            arrow = _this.hoverLayer.line.toArrow;
                        }
                        if (_this.hoverLayer.line) {
                            _this.activeLayer.pens = [_this.hoverLayer.line];
                        }
                        var toId = _this.hoverLayer.line.to.id;
                        if (e.ctrlKey || e.shiftKey || e.altKey) {
                            _this.hoverLayer.lineTo(new Point(pt.x, pt.y), arrow);
                        }
                        else {
                            var to = _this.getLineDock(new Point(pt.x, pt.y), AnchorMode.In);
                            toId = to.id;
                            // 即使是自己连接自己，也为 to 配置 anchorIndex
                            _this.hoverLayer.lineTo(to, arrow);
                        }
                        _this.hoverLayer.line.to.id = toId;
                        if (_this.hoverLayer.line.parentId) {
                            var line = _this.find(toId);
                            if (line && line.from) {
                                line.from.x = _this.hoverLayer.line.to.x;
                                line.from.y = _this.hoverLayer.line.to.y;
                            }
                        }
                        _this.needCache = true;
                        break;
                    case MoveInType.LineFrom:
                        var fromId = _this.hoverLayer.line.from.id;
                        if (e.ctrlKey || e.shiftKey || e.altKey) {
                            _this.hoverLayer.lineFrom(new Point(pt.x, pt.y));
                        }
                        else {
                            var from = _this.getLineDock(new Point(pt.x, pt.y), AnchorMode.Out);
                            fromId = from.id;
                            _this.hoverLayer.lineFrom(from);
                        }
                        _this.hoverLayer.line.from.id = fromId;
                        if (_this.hoverLayer.line.parentId) {
                            var line = _this.find(fromId);
                            if (line && line.to) {
                                line.to.x = _this.hoverLayer.line.from.x;
                                line.to.y = _this.hoverLayer.line.from.y;
                            }
                        }
                        _this.needCache = true;
                        break;
                    case MoveInType.Line:
                        {
                            var x = e.x - _this.mouseDown.x;
                            var y = e.y - _this.mouseDown.y;
                            if (x || y) {
                                _this.activeLayer.move(x, y);
                                if (_this.hoverLayer.line.children) {
                                    _this.animateLayer.updateLines(_this.hoverLayer.line.children);
                                }
                                else {
                                    _this.animateLayer.updateLines([_this.hoverLayer.line]);
                                }
                                _this.needCache = true;
                            }
                        }
                        break;
                    case MoveInType.LineControlPoint:
                        _this.moveIn.hoverLine.controlPoints[_this.moveIn.lineControlPoint.id].x = pt.x;
                        _this.moveIn.hoverLine.controlPoints[_this.moveIn.lineControlPoint.id].y = pt.y;
                        _this.moveIn.hoverLine.textRect = undefined;
                        if (drawLineFns[_this.moveIn.hoverLine.name] && drawLineFns[_this.moveIn.hoverLine.name].dockControlPointFn) {
                            drawLineFns[_this.moveIn.hoverLine.name].dockControlPointFn(_this.moveIn.hoverLine.controlPoints[_this.moveIn.lineControlPoint.id], _this.moveIn.hoverLine);
                        }
                        _this.needCache = true;
                        Store.set(_this.generateStoreKey('LT:updateLines'), [_this.moveIn.hoverLine]);
                        break;
                    case MoveInType.Rotate:
                        if (_this.activeLayer.pens.length) {
                            _this.activeLayer.offsetRotate(_this.getAngle(pt));
                            _this.activeLayer.updateLines();
                        }
                        _this.needCache = true;
                        break;
                    case MoveInType.Graffiti:
                        _this.moveIn.hoverNode.pushPoint(new Point(pt.x, pt.y));
                        break;
                }
                _this.render();
                _this.scheduledAnimationFrame = false;
            });
        };
        this.onmousedown = function (e) {
            if (e.button !== 0 && e.button !== 2)
                return;
            _this.mouseDown = e;
            if (e.altKey) {
                _this.divLayer.canvas.style.cursor = 'move';
            }
            if (_this.inputObj) {
                _this.setNodeText();
            }
            switch (_this.moveIn.type) {
                // Click the space.
                case MoveInType.None:
                    _this.activeLayer.clear();
                    _this.hoverLayer.clear();
                    _this.dispatch('space', _this.mouseDown);
                    break;
                // Click a line.
                case MoveInType.Line:
                case MoveInType.LineControlPoint:
                    if (e.ctrlKey || e.shiftKey) {
                        _this.activeLayer.add(_this.moveIn.hoverLine);
                        _this.dispatch('multi', _this.activeLayer.pens);
                    }
                    else {
                        _this.activeLayer.pens = [_this.moveIn.hoverLine];
                        _this.dispatch('line' + (e.button === 2 ? 'RightClick' : ''), Object.assign(_this.moveIn.hoverLine, {
                            evs: {
                                x: e.pageX,
                                y: e.pageY,
                            }
                        }));
                    }
                    _this.hoverLayer.line = _this.moveIn.hoverLine;
                    _this.hoverLayer.initLine = new Line(_this.moveIn.hoverLine);
                    if (_this.data.locked || _this.moveIn.hoverLine.locked) {
                        _this.moveIn.hoverLine.click();
                    }
                    break;
                // tslint:disable-next-line:no-switch-case-fall-through
                case MoveInType.LineFrom:
                case MoveInType.LineTo:
                    _this.activeLayer.pens = [_this.moveIn.hoverLine];
                    _this.dispatch('line', _this.moveIn.hoverLine);
                    _this.hoverLayer.line = _this.moveIn.hoverLine;
                    break;
                case MoveInType.HoverAnchors:
                    _this.hoverLayer.line = _this.addLine({
                        name: _this.data.lineName,
                        from: new Point(_this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex].x, _this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex].y, _this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex].direction, _this.moveIn.hoverAnchorIndex, _this.moveIn.hoverNode.id),
                        fromArrow: _this.data.fromArrow,
                        to: new Point(_this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex].x, _this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex].y),
                        toArrow: _this.data.toArrow,
                        strokeStyle: _this.options.color,
                        lineWidth: _this.data.lineWidth,
                    });
                    _this.dispatch('anchor', {
                        anchor: _this.moveIn.hoverNode.rotatedAnchors[_this.moveIn.hoverAnchorIndex],
                        anchorIndex: _this.moveIn.hoverAnchorIndex,
                        node: _this.moveIn.hoverNode,
                        line: _this.hoverLayer.line,
                    });
                    break;
                case MoveInType.AutoAnchor:
                    _this.hoverLayer.line = _this.addLine({
                        name: _this.data.lineName,
                        from: new Point(_this.moveIn.hoverNode.rect.center.x, _this.moveIn.hoverNode.rect.center.y, Direction.None, 0, _this.moveIn.hoverNode.id),
                        fromArrow: _this.data.fromArrow,
                        to: new Point(_this.moveIn.hoverNode.rect.center.x, _this.moveIn.hoverNode.rect.center.y),
                        toArrow: _this.data.toArrow,
                        strokeStyle: _this.options.color,
                        lineWidth: _this.data.lineWidth,
                    });
                    _this.hoverLayer.line.from.autoAnchor = true;
                    _this.dispatch('nodeCenter', _this.moveIn.hoverNode);
                    break;
                // tslint:disable-next-line:no-switch-case-fall-through
                case MoveInType.Nodes:
                    if (!_this.moveIn.activeNode) {
                        break;
                    }
                    if (e.ctrlKey || e.shiftKey) {
                        if (_this.moveIn.hoverNode && _this.activeLayer.hasInAll(_this.moveIn.hoverNode)) {
                            _this.activeLayer.setPens([_this.moveIn.hoverNode]);
                            _this.dispatch('node' + (e.button === 2 ? 'RightClick' : ''), _this.moveIn.hoverNode);
                        }
                        else if (!_this.activeLayer.has(_this.moveIn.activeNode)) {
                            _this.activeLayer.add(_this.moveIn.activeNode);
                            if (_this.activeLayer.pens.length > 1) {
                                _this.dispatch('multi', _this.activeLayer.pens);
                            }
                            else {
                                _this.dispatch('node' + (e.button === 2 ? 'RightClick' : ''), _this.moveIn.activeNode);
                            }
                        }
                    }
                    else if (e.altKey) {
                        if (_this.moveIn.hoverNode) {
                            _this.activeLayer.setPens([_this.moveIn.hoverNode]);
                            _this.dispatch('node' + (e.button === 2 ? 'RightClick' : ''), _this.moveIn.hoverNode);
                        }
                        else if (_this.moveIn.hoverLine) {
                            _this.activeLayer.setPens([_this.moveIn.hoverLine]);
                            _this.dispatch('line', _this.moveIn.hoverLine);
                        }
                    }
                    else if (_this.activeLayer.pens.length < 2) {
                        _this.activeLayer.setPens([_this.moveIn.activeNode]);
                        _this.dispatch('node' + (e.button === 2 ? 'RightClick' : ''), Object.assign(_this.moveIn.activeNode, {
                            evs: {
                                x: e.pageX,
                                y: e.pageY,
                            }
                        }));
                    }
                    if (_this.data.locked || _this.moveIn.activeNode.locked) {
                        _this.moveIn.activeNode.click();
                    }
                    _this.activeLayer.calcActiveRect();
                    break;
                case MoveInType.Graffiti: // 涂鸦起点
                    var pt = _this.calibrateMouse({ x: e.x, y: e.y });
                    _this.moveIn.hoverNode.pushPoint(new Point(pt.x, pt.y));
                    break;
            }
            // Save node rects to move.
            if (_this.activeLayer.pens.length) {
                _this.activeLayer.saveNodeRects();
            }
            _this.render();
        };
        this.onmouseup = function (e) {
            if (!_this.mouseDown)
                return;
            _this.mouseDown = undefined;
            _this.lastTranlated.x = 0;
            _this.lastTranlated.y = 0;
            _this.hoverLayer.dockAnchor = undefined;
            _this.hoverLayer.dockLineX = 0;
            _this.hoverLayer.dockLineY = 0;
            _this.divLayer.canvas.style.cursor = 'default';
            _this.alreadyCopy = false;
            if (_this.hoverLayer.dragRect) {
                _this.getPensInRect(_this.hoverLayer.dragRect);
                if (_this.activeLayer.pens && _this.activeLayer.pens.length > 1) {
                    _this.dispatch('multi', _this.activeLayer.pens);
                }
                else if (_this.activeLayer.pens && _this.activeLayer.pens[0] && _this.activeLayer.pens[0].type === PenType.Line) {
                    _this.dispatch('line' + (e.button === 2 ? 'RightClick' : ''), _this.activeLayer.pens[0]);
                }
                else if (_this.activeLayer.pens && _this.activeLayer.pens[0] && _this.activeLayer.pens[0].type === PenType.Node) {
                    _this.dispatch('node' + (e.button === 2 ? 'RightClick' : ''), _this.activeLayer.pens[0]);
                }
                _this.activeLayer.calcActiveRect();
            }
            else {
                var pt = _this.calibrateMouse({ x: e.x, y: e.y });
                switch (_this.moveIn.type) {
                    case MoveInType.Nodes:
                        if (e.ctrlKey && e.shiftKey && e.altKey) {
                            if (!_this.moveIn.hoverNode.manualAnchors) {
                                _this.moveIn.hoverNode.manualAnchors = [];
                            }
                            var point = new Point(pt.x, pt.y);
                            point.id = _this.moveIn.hoverNode.id;
                            _this.moveIn.hoverNode.manualAnchors.push(point);
                            _this.moveIn.hoverNode.calcAnchors();
                            _this.needCache = true;
                        }
                        if (_this.data.locked || _this.moveIn.activeNode.locked) {
                            _this.moveIn.activeNode.mouseUp();
                        }
                        break;
                    case MoveInType.Line:
                    case MoveInType.LineControlPoint:
                        if (_this.data.locked || _this.moveIn.hoverLine.locked) {
                            _this.moveIn.hoverLine.mouseUp();
                        }
                        break;
                    // Add the line.
                    case MoveInType.HoverAnchors:
                        // New active.
                        if (_this.hoverLayer.line) {
                            var willAddLine = void 0;
                            var _a = _this.hoverLayer.line, from = _a.from, to = _a.to;
                            if (_this.hoverLayer.line.to.id) {
                                if (!_this.options.disableRepeatLine) {
                                    willAddLine = true;
                                }
                                else {
                                    var lines = _this.data.pens.filter(function (pen) {
                                        return pen.type === PenType.Line &&
                                            pen.from.isSameAs(_this.hoverLayer.line.from) &&
                                            pen.to.isSameAs(_this.hoverLayer.line.to);
                                    });
                                    willAddLine = lines.length <= 1;
                                }
                                // 判断是否是当前锚点连接当前锚点
                                if (from.id === to.id && from.anchorIndex === to.anchorIndex) {
                                    willAddLine = false;
                                }
                            }
                            else {
                                willAddLine = !_this.options.disableEmptyLine && !_this.hoverLayer.line.disableEmptyLine;
                                // from 与 to 的距离若小于等于 5 认为是误操作，不会添加连线
                                willAddLine = willAddLine && Math.pow((from.x - to.x), 2) + Math.pow((from.y - to.y), 2) > 25;
                            }
                            if (willAddLine) {
                                _this.activeLayer.pens = [_this.hoverLayer.line];
                                _this.dispatch('addLine', _this.hoverLayer.line);
                            }
                            else {
                                _this.data.pens.pop();
                                _this.activeLayer.clear();
                            }
                        }
                        _this.offscreen.render();
                        _this.hoverLayer.line = undefined;
                        break;
                    case MoveInType.AutoAnchor:
                        if ((_this.hoverLayer.line.disableEmptyLine || _this.options.disableEmptyLine) &&
                            (!_this.hoverLayer.line.from.id || !_this.hoverLayer.line.to.id)) {
                            _this.needCache = true;
                            _this.activeLayer.clear();
                            _this.data.pens.splice(_this.findIndex(_this.hoverLayer.line), 1);
                        }
                        else {
                            _this.activeLayer.updateLines();
                            _this.dispatch('addLine', _this.hoverLayer.line);
                        }
                        break;
                    case MoveInType.Rotate:
                        _this.activeLayer.updateRotate();
                        break;
                    case MoveInType.LineControlPoint:
                        Store.set(_this.generateStoreKey('pts-') + _this.moveIn.hoverLine.id, undefined);
                        break;
                    case MoveInType.LineFrom:
                    case MoveInType.LineTo:
                        if ((_this.hoverLayer.line.disableEmptyLine || _this.options.disableEmptyLine) &&
                            (!_this.hoverLayer.line.from.id || !_this.hoverLayer.line.to.id)) {
                            _this.needCache = true;
                            _this.activeLayer.clear();
                            _this.data.pens.splice(_this.findIndex(_this.hoverLayer.line), 1);
                        }
                        if (_this.hoverLayer.line.from.id && _this.hoverLayer.line.to.id) {
                            _this.dispatch('lineOn', Object.assign(_this.hoverLayer.line, {
                                lineOnDirection: _this.moveIn.type
                            }));
                        }
                        break;
                    case MoveInType.Graffiti:
                        if (!_this.moveIn.hoverNode.points || _this.moveIn.hoverNode.points.length < 2) {
                            _this.moveIn.type = MoveInType.None;
                            _this.data.pens.pop();
                        }
                        else {
                            _this.moveIn.type = MoveInType.Nodes;
                            _this.moveIn.hoverNode['doing'] = undefined;
                            _this.moveIn.hoverNode.calcAnchors();
                            _this.activeLayer.setPens([_this.moveIn.hoverNode]);
                            _this.hoverLayer.node = _this.moveIn.hoverNode;
                            _this.needCache = true;
                        }
                        break;
                    case MoveInType.Lines:
                        var previous = void 0;
                        if (_this.moveIn.hoverLine.children && _this.moveIn.hoverLine.children.length) {
                            previous = _this.moveIn.hoverLine.children[_this.moveIn.hoverLine.children.length - 1];
                        }
                        if (!previous) {
                            _this.moveIn.hoverLine.children = [];
                        }
                        var line = new Line({
                            parentId: _this.moveIn.hoverLine.id,
                            name: 'line',
                            from: new Point(pt.x, pt.y),
                            fromArrow: previous ? '' : _this.data.fromArrow,
                            to: new Point(pt.x, pt.y),
                            toArrow: '',
                            strokeStyle: _this.options.color,
                            lineWidth: _this.data.lineWidth,
                        });
                        if (previous) {
                            line.from.id = previous.id;
                            line.from.x = previous.to.x;
                            line.from.y = previous.to.y;
                            previous.to.id = line.id;
                        }
                        _this.moveIn.hoverLine.children.push(line);
                        _this.hoverLayer.line = line;
                        _this.dispatch('addLineInLines', { previous: previous, line: line });
                }
            }
            _this.hoverLayer.dragRect = undefined;
            _this.activeLayer.lastOffsetX = 0;
            _this.activeLayer.lastOffsetY = 0;
            _this.render();
            if (_this.needCache) {
                _this.cache();
            }
            _this.needCache = false;
        };
        this.ondblclick = function () {
            if (_this.moveIn.hoverNode) {
                _this.dispatch('dblclick', _this.moveIn.hoverNode);
                if (!(_this.data.locked || _this.moveIn.hoverNode.locked || _this.moveIn.hoverNode.hideInput || _this.options.hideInput)) {
                    _this.showInput(_this.moveIn.hoverNode);
                }
                _this.moveIn.hoverNode.dblclick();
            }
            else if (_this.moveIn.hoverLine) {
                _this.dispatch('dblclick', _this.moveIn.hoverLine);
                if (!(_this.data.locked || _this.moveIn.hoverLine.locked || _this.moveIn.hoverLine.hideInput || _this.options.hideInput)) {
                    _this.showInput(_this.moveIn.hoverLine);
                }
                _this.moveIn.hoverLine.dblclick();
            }
        };
        this.onkeydown = function (key) {
            if (_this.data.locked ||
                key.target.tagName === 'INPUT' ||
                key.target.tagName === 'TEXTAREA') {
                return;
            }
            var done = false;
            var moveX = 0;
            var moveY = 0;
            switch (key.key) {
                case ' ':
                    _this.spaceDown = true;
                    break;
                case 'a':
                case 'A':
                    _this.activeLayer.setPens(_this.data.pens);
                    done = true;
                    break;
                case 'Delete':
                case 'Backspace':
                    if (key.ctrlKey || key.metaKey) {
                        _this.deleteAnchors();
                    }
                    else {
                        _this.delete();
                    }
                    break;
                case 'ArrowLeft':
                    moveX = -5;
                    if (key.ctrlKey || key.metaKey) {
                        moveX = -1;
                    }
                    done = true;
                    break;
                case 'ArrowUp':
                    moveY = -5;
                    if (key.ctrlKey || key.metaKey) {
                        moveY = -1;
                    }
                    done = true;
                    break;
                case 'ArrowRight':
                    moveX = 5;
                    if (key.ctrlKey || key.metaKey) {
                        moveX = 1;
                    }
                    done = true;
                    break;
                case 'ArrowDown':
                    moveY = 5;
                    if (key.ctrlKey || key.metaKey) {
                        moveY = 1;
                    }
                    done = true;
                    break;
                case 'x':
                case 'X':
                    _this.cut();
                    break;
                case 'c':
                case 'C':
                    _this.copy();
                    break;
                case 'v':
                case 'V':
                    _this.paste();
                    break;
                case 'y':
                case 'Y':
                    if (key.ctrlKey || key.metaKey) {
                        _this.redo();
                    }
                    break;
                case 'z':
                case 'Z':
                    if (key.shiftKey) {
                        _this.redo();
                    }
                    else if (key.ctrlKey || key.metaKey) {
                        _this.undo();
                    }
                    break;
                case 'Enter':
                    if (_this.moveIn.type === MoveInType.Lines) {
                        _this.moveIn.type = MoveInType.None;
                        _this.moveIn.hoverLine['doing'] = '';
                        if (_this.hoverLayer.line.getLen() < 10) {
                            _this.moveIn.hoverLine.children.pop();
                            _this.hoverLayer.line = _this.moveIn.hoverLine.children[_this.moveIn.hoverLine.children.length - 1];
                        }
                        if (_this.moveIn.hoverLine['isNode']) {
                            var pts_1 = [];
                            _this.moveIn.hoverLine.children.forEach(function (l) {
                                pts_1.push(l.from);
                                if (l.controlPoints) {
                                    l.controlPoints.forEach(function (pt) {
                                        pt.data = true;
                                        pts_1.push(pt);
                                    });
                                }
                                pts_1.push(l.to);
                            });
                            var _a = getBboxOfPoints(pts_1), x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2;
                            var n = new Node({
                                name: 'lines',
                                rect: new Rect(x1, y1, x2 - x1, y2 - y1),
                                points: pts_1,
                                closePath: _this.moveIn.hoverLine['closePath'],
                            });
                            _this.activeLayer.add(n);
                            _this.data.pens.pop();
                            _this.data.pens.push(n);
                        }
                        else {
                            _this.hoverLayer.line.toArrow = _this.data.toArrow;
                            _this.activeLayer.add(_this.moveIn.hoverLine);
                        }
                        _this.moveIn.hoverLine = undefined;
                    }
                    done = true;
                    break;
                case 'Escape':
                    if (_this.moveIn.type === MoveInType.Lines) {
                        _this.moveIn.type = MoveInType.None;
                        _this.moveIn.hoverLine.children.pop();
                        _this.hoverLayer.line = _this.moveIn.hoverLine.children[_this.moveIn.hoverLine.children.length - 1];
                        _this.hoverLayer.line.toArrow = _this.data.toArrow;
                        _this.moveIn.hoverLine['doing'] = '';
                        _this.moveIn.hoverLine = undefined;
                    }
                    done = true;
                    break;
            }
            if (!done) {
                return;
            }
            key.preventDefault();
            key.stopPropagation();
            if (moveX || moveY) {
                _this.activeLayer.saveNodeRects();
                _this.activeLayer.move(moveX, moveY);
                _this.animateLayer.animate();
            }
            _this.render();
            _this.cache();
        };
        this._emitter = mitt();
        this.options = Object.assign({}, DefalutOptions, options);
        Store.set(this.generateStoreKey('LT:color'), this.options.color || '#222222');
        Store.set(this.generateStoreKey('LT:fontColor'), this.options.fontColor || '#222222');
        this.setupDom(parent);
        this.setupSubscribe();
        this.setupMouseEvent();
        // Wait for parent dom load
        setTimeout(function () {
            _this.canvasPos = _this.divLayer.canvas.getBoundingClientRect();
        }, 500);
        setTimeout(function () {
            _this.canvasPos = _this.divLayer.canvas.getBoundingClientRect();
        }, 1000);
        this.cache();
        window.topology = this;
        this.dispatch('loaded');
    }
    Object.defineProperty(Topology.prototype, "ramCaches", {
        // 内存中的 caches 数量
        get: function () {
            return 5;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Topology.prototype, "clearElementIdPensName", {
        // 需要清除 elementId 的图形，复制时用
        get: function () {
            return ['echarts', 'textbox'];
        },
        enumerable: false,
        configurable: true
    });
    Topology.prototype.setupDom = function (parent) {
        if (typeof parent === 'string') {
            this.parentElem = document.getElementById(parent);
        }
        else {
            this.parentElem = parent;
        }
        this.parentElem.style.position = 'relative';
        this.parentElem.style.overflow = 'auto';
        this.parentElem.onresize = this.winResize;
        window.addEventListener('resize', this.winResize);
        var id = this.id;
        this.activeLayer = new ActiveLayer(this.options, id);
        this.activeLayer.topology = this;
        this.hoverLayer = new HoverLayer(this.options, id);
        this.animateLayer = new AnimateLayer(this.options, id);
        this.offscreen = new Offscreen(this.parentElem, this.options, id);
        this.canvas = new RenderLayer(this.parentElem, this.options, id);
        this.divLayer = new DivLayer(this.parentElem, this.options, id);
        this.options.scroll && (this.scrollDom = new Scroll(this));
        this.input.style.position = 'absolute';
        this.input.style.zIndex = '-1';
        this.input.style.left = '-1000px';
        this.input.style.width = '0';
        this.input.style.height = '0';
        this.input.style.outline = 'none';
        this.input.style.border = '1px solid #cdcdcd';
        this.input.style.resize = 'none';
        this.parentElem.appendChild(this.input);
        this.createMarkdownTip();
        this.resize();
    };
    Topology.prototype.setupSubscribe = function () {
        var _this = this;
        this.subcribe = Store.subscribe(this.generateStoreKey('LT:render'), function () {
            _this.render();
        });
        this.subcribeRender = Store.subscribe('LT:render', function () {
            _this.render();
        });
        this.subcribeImage = Store.subscribe(this.generateStoreKey('LT:imageLoaded'), function () {
            if (_this.imageTimer) {
                clearTimeout(_this.imageTimer);
            }
            _this.imageTimer = setTimeout(function () {
                _this.render();
            }, 100);
        });
        this.subcribeAnimateMoved = Store.subscribe(this.generateStoreKey('LT:rectChanged'), function (e) {
            _this.activeLayer.updateLines([e]);
        });
        this.subcribeMediaEnd = Store.subscribe(this.generateStoreKey('mediaEnd'), function (node) {
            if (node.nextPlay) {
                _this.animateLayer.readyPlay(node.nextPlay);
                _this.animateLayer.animate();
            }
            _this.dispatch('mediaEnd', node);
        });
        this.subcribeAnimateEnd = Store.subscribe(this.generateStoreKey('animateEnd'), function (pen) {
            if (!pen) {
                return;
            }
            switch (pen.type) {
                case PenType.Node:
                    _this.offscreen.render();
                    break;
            }
            _this.dispatch('animateEnd', pen);
        });
        this.subcribeEmit = Store.subscribe(this.generateStoreKey('LT:emit'), function (e) {
            // TODO: 此处为何不使用 dispatch
            _this.emit(e.event, e);
        });
    };
    Topology.prototype.setupMouseEvent = function () {
        var _this = this;
        this.canvasPos = this.divLayer.canvas.getBoundingClientRect();
        this.parentElem.addEventListener('scroll', this.onScroll);
        window.addEventListener('scroll', this.onScroll);
        this.divLayer.canvas.ondragover = function (event) { return event.preventDefault(); };
        this.divLayer.canvas.ondrop = function (event) {
            if (_this.data.locked) {
                return;
            }
            try {
                var json = event.dataTransfer.getData('Topology') || event.dataTransfer.getData('Text');
                if (!json)
                    return;
                var obj = JSON.parse(json);
                event.preventDefault();
                var pt = _this.calibrateMouse({ x: event.offsetX, y: event.offsetY });
                _this.dropNodes(Array.isArray(obj) ? obj : [obj], pt.x, pt.y);
                _this.activeLayer.calcActiveRect();
            }
            catch (_a) { }
        };
        if (isMobile()) {
            this.options.refresh = 50;
            // ipad
            document.addEventListener('gesturestart', this.preventDefault);
            // end
            this.divLayer.canvas.ontouchstart = function (event) {
                _this.touchStart = Date.now();
                var pos = new Point(event.changedTouches[0].pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x), event.changedTouches[0].pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y));
                if (event.touches.length > 1) {
                    _this.touches = event.touches;
                    _this.touchScale = _this.data.scale;
                    _this.lastTranlated.x = pos.x;
                    _this.lastTranlated.y = pos.y;
                    return;
                }
                var pt = _this.calibrateMouse({ x: pos.x, y: pos.y });
                _this.getMoveIn(pt);
                _this.hoverLayer.node = _this.moveIn.hoverNode;
                _this.hoverLayer.line = _this.moveIn.hoverLine;
                _this.lastTranlated.x = pos.x;
                _this.lastTranlated.y = pos.y;
                _this.onmousedown({
                    x: pos.x,
                    y: pos.y,
                    ctrlKey: event.ctrlKey || event.metaKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    button: 0,
                });
            };
            this.divLayer.canvas.ontouchmove = function (event) {
                event.stopPropagation();
                var touches = event.changedTouches;
                var len = touches.length;
                if (!_this.touchCenter && len > 1) {
                    _this.touchCenter = {
                        x: touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2,
                        y: touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2,
                    };
                    // 计算鼠标位置根据画布偏移
                    _this.calibrateMouse(_this.touchCenter);
                }
                var timeNow = Date.now();
                if (timeNow - _this.touchStart < 50) {
                    return;
                }
                if (len > 1) {
                    if (len === 2) {
                        var scale = event.scale ||
                            Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY) /
                                Math.hypot(_this.touches[0].pageX - _this.touches[1].pageX, _this.touches[0].pageY - _this.touches[1].pageY);
                        event.preventDefault();
                        _this.scaleTo(scale * _this.touchScale, _this.touchCenter);
                    }
                    else if (len === 3) {
                        var pos_1 = new Point(touches[0].pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x), touches[0].pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y));
                        _this.translate(pos_1.x, pos_1.y, true);
                    }
                    return;
                }
                event.preventDefault();
                var pos = new Point(event.changedTouches[0].pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x), event.changedTouches[0].pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y));
                _this.onMouseMove({
                    x: pos.x,
                    y: pos.y,
                    ctrlKey: event.ctrlKey || event.metaKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    buttons: 1,
                });
            };
            this.divLayer.canvas.ontouchend = function (event) {
                _this.touches = undefined;
                _this.ontouchend(event);
            };
        }
        else {
            this.divLayer.canvas.onmousedown = function (event) {
                if (event.target.nodeName === 'INPUT' && event.target.type === 'range' && _this.data.locked) {
                    return;
                }
                if (_this.touchedNode) {
                    if (_this.touchedNode.name === 'graffiti') {
                        _this.touchedNode.rect = new Rect(0, 0, 0, 0);
                        _this.addNode(_this.touchedNode);
                        _this.touchedNode = undefined;
                    }
                    else if (_this.touchedNode.name === 'lines') {
                        _this.addLine(_this.touchedNode);
                        _this.touchedNode = undefined;
                    }
                }
                var e = {
                    x: event.pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x),
                    y: event.pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y),
                    ctrlKey: event.ctrlKey || event.metaKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    button: event.button,
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                _this.lastTranlated.x = e.x;
                _this.lastTranlated.y = e.y;
                _this.onmousedown(e);
            };
            this.divLayer.canvas.onmousemove = function (event) {
                _this.onMouseMove({
                    x: event.pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x),
                    y: event.pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y),
                    ctrlKey: event.ctrlKey || event.metaKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    buttons: event.buttons,
                    pageX: event.pageX,
                    pageY: event.pageY,
                });
            };
            this.divLayer.canvas.onmouseup = function (event) {
                var e = {
                    x: event.pageX - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x),
                    y: event.pageY - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y),
                    ctrlKey: event.ctrlKey || event.metaKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    button: event.button,
                };
                _this.onmouseup(e);
                if (!_this.touchedNode) {
                    return;
                }
                _this.touchedNode.rect.x = event.pageX - window.scrollX - _this.canvasPos.x - _this.touchedNode.rect.width / 2;
                _this.touchedNode.rect.y = event.pageY - window.scrollY - _this.canvasPos.y - _this.touchedNode.rect.height / 2;
                var node = new Node(_this.touchedNode);
                _this.addNode(node, true);
                _this.touchedNode = undefined;
            };
        }
        this.divLayer.canvas.ondblclick = this.ondblclick;
        this.divLayer.canvas.tabIndex = 0;
        this.divLayer.canvas.onblur = function () {
            _this.mouseDown = undefined;
        };
        this.divLayer.canvas.onwheel = function (event) {
            if (_this.options.scroll && !event.ctrlKey && _this.scrollDom) {
                _this.scrollDom.wheel(event.deltaY < 0);
                return;
            }
            if (_this.data.locked === Lock.NoEvent)
                return;
            var timeNow = new Date().getTime();
            if (timeNow - _this.touchStart < 20) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            _this.touchStart = new Date().getTime();
            if (_this.options.disableScale) {
                return;
            }
            switch (_this.options.scaleKey) {
                case KeyType.Ctrl:
                    if (!event.ctrlKey && !event.metaKey) {
                        return;
                    }
                    break;
                case KeyType.Shift:
                    if (!event.shiftKey) {
                        return;
                    }
                    break;
                case KeyType.Alt:
                    if (!event.altKey) {
                        return;
                    }
                    break;
            }
            event.preventDefault();
            event.stopPropagation();
            var pos = new Point(event.x - window.scrollX - (_this.canvasPos.left || _this.canvasPos.x), event.y - window.scrollY - (_this.canvasPos.top || _this.canvasPos.y));
            // 计算鼠标位置根据画布偏移
            _this.calibrateMouse(pos);
            var scale = _this.data.scale;
            if (event.deltaY < 0) {
                scale += 0.1;
            }
            else {
                scale -= 0.1;
            }
            _this.scaleTo(scale, pos);
            _this.divLayer.canvas.focus();
            return false;
        };
        switch (this.options.keydown) {
            case KeydownType.Document:
                document.addEventListener('keydown', this.onkeydown);
                document.addEventListener('keyup', function () {
                    _this.spaceDown = false;
                });
                break;
            case KeydownType.Canvas:
                this.divLayer.canvas.addEventListener('keydown', this.onkeydown);
                break;
        }
    };
    Topology.prototype.ontouchend = function (event) {
        var pos = new Point(event.changedTouches[0].pageX - window.scrollX - (this.canvasPos.left || this.canvasPos.x), event.changedTouches[0].pageY - window.scrollY - (this.canvasPos.top || this.canvasPos.y));
        this.onmouseup({
            x: pos.x,
            y: pos.y,
            ctrlKey: event.ctrlKey || event.metaKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            button: 0,
        });
        if (!this.touchedNode) {
            return;
        }
        this.touchedNode.rect.x =
            event.changedTouches[0].pageX - window.scrollX - this.canvasPos.x - this.touchedNode.rect.width / 2;
        this.touchedNode.rect.y =
            event.changedTouches[0].pageY - window.scrollY - this.canvasPos.y - this.touchedNode.rect.height / 2;
        var node = new Node(this.touchedNode);
        this.addNode(node, true);
        this.touchedNode = undefined;
    };
    Topology.prototype.resize = function (size) {
        this.canvas.resize(size);
        this.offscreen.resize(size);
        this.divLayer.resize(size);
        this.render();
        this.dispatch('resize', size);
        if (this.scrollDom && this.scrollDom.isShow) {
            this.scrollDom.init();
        }
    };
    Topology.prototype.dropNodes = function (jsonList, offsetX, offsetY) {
        var _this = this;
        var x = 0, y = 0;
        if (jsonList.length && jsonList[0].rect) {
            var rect = jsonList[0].rect;
            x = rect.x;
            y = rect.y;
        }
        var firstNode;
        jsonList.forEach(function (json) {
            json.id = s8();
            if (json.name === 'graffiti') {
                json.rect = new Rect(0, 0, 0, 0);
                _this.addNode(json);
                return;
            }
            else if (json.name === 'lines') {
                _this.addLine(json);
                _this.mouseDown = {
                    x: offsetX,
                    y: offsetY,
                };
                _this.onmouseup(_this.mouseDown);
                return;
            }
            if (!firstNode) {
                json.rect.x = (offsetX - json.rect.width / 2) << 0;
                json.rect.y = (offsetY - json.rect.height / 2) << 0;
                firstNode = json;
            }
            else {
                //Layout relative to the first node
                var rect = json.rect;
                var dx = rect.x - x, dy = rect.y - y;
                json.rect.x = firstNode.rect.x + dx;
                json.rect.y = firstNode.rect.y + dy;
            }
            if (json.type === PenType.Line) {
                _this.addLine(Object.assign({
                    name: 'line',
                    from: new Point(json.rect.x, json.rect.y),
                    fromArrow: _this.data.fromArrow,
                    to: new Point(json.rect.x + json.rect.width, json.rect.y + json.rect.height),
                    toArrow: _this.data.toArrow,
                    strokeStyle: _this.options.color,
                }, json), true);
            }
            else {
                _this.addNode(json, true);
            }
        });
        this.divLayer.canvas.focus();
    };
    Topology.prototype.addNode = function (node, focus) {
        var _this = this;
        if (focus === void 0) { focus = false; }
        if (!drawNodeFns[node.name]) {
            return null;
        }
        node.TID = this.id;
        // if it's not a Node
        if (!node.init) {
            node = new Node(node);
        }
        if (!node.strokeStyle && this.options.color) {
            node.strokeStyle = this.options.color;
        }
        fontKeys.forEach(function (key) {
            if (!node[key]) {
                node[key] = _this.options[key];
            }
        });
        if (this.data.scale !== 1) {
            node.scale(this.data.scale);
        }
        this.data.pens.push(node);
        if (focus) {
            // fix bug: add echart
            if (node.name === 'echarts') {
                setTimeout(function () {
                    _this.activeLayer.pens = [node];
                    _this.render();
                }, 50);
            }
            else {
                this.activeLayer.pens = [node];
            }
        }
        if (node.name !== 'graffiti' || !node.doing) {
            this.render();
            this.animate(true);
            this.cache();
        }
        else {
            this.moveIn.type = MoveInType.Graffiti;
            this.moveIn.hoverNode = node;
        }
        this.dispatch('addNode', node);
        return node;
    };
    Topology.prototype.addLine = function (line, focus) {
        if (focus === void 0) { focus = false; }
        if (line.type === PenType.Node) {
            line.isNode = true;
        }
        line.TID = this.id;
        if (!line.clone) {
            line = new Line(line);
            line.calcControlPoints(true);
        }
        if (this.data.scale !== 1) {
            if (line.name !== 'lines') {
                line.scale(this.data.scale, line.getCenter());
            }
            else {
                line.fontSize *= this.data.scale;
            }
        }
        this.data.pens.push(line);
        if (line.name !== 'lines' || !line.doing) {
            if (focus) {
                this.activeLayer.setPens([line]);
                this.render();
                this.animate(true);
                this.cache();
                this.dispatch('addLine', line);
            }
        }
        else {
            this.activeLayer.clear();
            this.hoverLayer.line = undefined;
            this.moveIn.type = MoveInType.Lines;
            this.moveIn.hoverLine = line;
        }
        return line;
    };
    // Render or redraw
    Topology.prototype.render = function (noFocus) {
        if (noFocus) {
            this.activeLayer.pens = [];
            this.hoverLayer.node = undefined;
            this.hoverLayer.line = undefined;
        }
        if (this.rendering) {
            return this;
        }
        this.rendering = true;
        // 获取 ctx 对象
        var ctx = this.offscreen.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.offscreen.canvas.width, this.offscreen.canvas.height);
        ctx.save();
        ctx.translate(this.data.x, this.data.y);
        this.offscreen.render();
        ctx.restore();
        this.canvas.render();
        this.rendering = false;
    };
    // open - redraw by the data
    Topology.prototype.open = function (data) {
        if (typeof data !== 'string' && data && data.mqttOptions && !data.mqttOptions.customClientId) {
            data.mqttOptions.clientId = s8();
        }
        this.canvas.clearBkImg();
        this.data = createData(data, this.id);
        this.subscribeSocket();
        Store.set(this.generateStoreKey('LT:scale'), this.data.scale);
        this.dispatch('scale', this.data.scale);
        Store.set('LT:bkColor', this.data.bkColor);
        this.lock(this.data.locked);
        this.caches.list = [];
        createCacheTable(); // 清空数据
        this.caches.dbIndex = -1;
        this.cache();
        this.divLayer.clear();
        this.animateLayer.stop();
        this.render(true);
        this.parentElem.scrollLeft = 0;
        this.parentElem.scrollTop = 0;
        this.animate(true);
        this.openSocket();
        this.openMqtt();
        this.doInitJS();
        this.dispatch('opened');
        if (this.scrollDom && this.scrollDom.isShow) {
            this.scrollDom.init();
        }
    };
    /**
     * 执行初始化函数 initJS
     * */
    Topology.prototype.doInitJS = function () {
        if (this.data.initJS && this.data.initJS.trim()) {
            // 字符串类型存在
            var fn = new Function(this.data.initJS);
            fn();
        }
    };
    Topology.prototype.openSocket = function (url) {
        var _this = this;
        this.closeSocket();
        if (url || this.data.websocket) {
            this.socket = new Socket(url || this.data.websocket, function (e) {
                if (_this.data.socketEvent !== 1) {
                    _this.doSocket(e.data);
                }
                _this.data.socketEvent && _this.dispatch('websocket', e.data);
            });
        }
    };
    Topology.prototype.closeSocket = function () {
        if (this.socket) {
            this.socket.close();
        }
    };
    Topology.prototype.openMqtt = function (url, options) {
        var _this = this;
        this.closeMqtt();
        if (url || this.data.mqttUrl) {
            this.mqtt = new MQTT(url || this.data.mqttUrl, options || this.data.mqttOptions, this.data.mqttTopics, function (topic, message) {
                if (_this.data.socketEvent !== 1) {
                    _this.doSocket(message.toString(), SocketEventType.Mqtt);
                }
                _this.data.socketEvent && _this.dispatch('mqtt', { topic: topic, message: message });
            });
        }
    };
    Topology.prototype.closeMqtt = function () {
        if (this.mqtt) {
            this.mqtt.close();
        }
    };
    Topology.prototype.doSocket = function (message, type) {
        var _this = this;
        if (type === void 0) { type = SocketEventType.WebSocket; }
        try {
            message = JSON.parse(message);
            if (!Array.isArray(message)) {
                message = [message];
            }
            message.forEach(function (item) {
                var actions = [];
                if (item.actions) {
                    actions = item.actions;
                    delete item.actions;
                }
                var pens = find(item.id || item.tag, _this.data.pens);
                pens.forEach(function (pen) {
                    if (pen.id === item.id || (pen.tags && pen.tags.indexOf(item.tag) > -1)) {
                        pen.fromData(pen, item);
                        pen.doWheres();
                        if (pen.events) {
                            pen.events.forEach(function (event) {
                                if (event.type === type) {
                                    event.params = item;
                                    actions.push(event);
                                }
                            });
                        }
                        actions &&
                            actions.forEach(function (action) {
                                pen.doAction(action);
                            });
                    }
                });
                _this.willRender();
            });
        }
        catch (error) {
            console.warn(error);
        }
    };
    Topology.prototype.overflow = function (padding) {
        if (padding === void 0) { padding = 50; }
        var rect = this.getRect();
        var width = rect.width, height = rect.height;
        if (width < rect.ex) {
            width = rect.ex + padding;
        }
        if (width < this.canvas.width) {
            width = this.canvas.width;
        }
        if (height < rect.ey) {
            height = rect.ey + padding;
        }
        if (height < this.canvas.height) {
            height = this.canvas.height;
        }
        var size = { width: width, height: height };
        this.resize(size);
        return size;
    };
    Topology.prototype.setNodeText = function () {
        this.inputObj.text = this.input.value;
        if (this.inputObj.name === 'image') {
            this.inputObj.init();
        }
        this.input.style.zIndex = '-1';
        this.input.style.left = '-1000px';
        this.input.style.width = '0';
        this.cache();
        this.offscreen.render();
        this.dispatch('setText', this.inputObj);
        this.inputObj = undefined;
    };
    Topology.prototype.getMoveIn = function (pt) {
        if (this.moveIn.type >= MoveInType.Graffiti) {
            return;
        }
        this.lastHoverNode = this.moveIn.hoverNode;
        this.lastHoverLine = this.moveIn.hoverLine;
        this.moveIn.type = MoveInType.None;
        this.moveIn.hoverNode = undefined;
        this.moveIn.lineControlPoint = undefined;
        this.moveIn.hoverLine = undefined;
        this.hoverLayer.hoverAnchorIndex = -1;
        if (!this.data.locked &&
            !(this.activeLayer.pens.length === 1 && this.activeLayer.pens[0].type) &&
            !this.activeLayer.locked() &&
            this.activeLayer.rotateCPs[0] &&
            this.activeLayer.rotateCPs[0].hit(pt, 15)) {
            this.moveIn.type = MoveInType.Rotate;
            var cursor = this.options.rotateCursor;
            this.divLayer.canvas.style.cursor = cursor.includes('/') ? "url(\"".concat(cursor, "\"), auto") : cursor;
            return;
        }
        if (this.activeLayer.pens.length > 1 && pointInRect(pt, this.activeLayer.sizeCPs)) {
            this.moveIn.type = MoveInType.Nodes;
        }
        if (!this.data.locked && !this.activeLayer.locked() && !this.options.hideSizeCP) {
            if (this.activeLayer.pens.length > 1 ||
                (!this.activeLayer.pens[0].type && !this.activeLayer.pens[0].hideSizeCP)) {
                for (var i = 0; i < this.activeLayer.sizeCPs.length; ++i) {
                    if (this.activeLayer.sizeCPs[i].hit(pt, 10)) {
                        this.moveIn.type = MoveInType.ResizeCP;
                        this.moveIn.activeAnchorIndex = i;
                        this.divLayer.canvas.style.cursor = resizeCursors[i];
                        return;
                    }
                }
            }
        }
        // In active pen.
        if (!this.data.locked) {
            for (var _i = 0, _a = this.activeLayer.pens; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item instanceof Line && !item.locked) {
                    for (var i = 0; i < item.controlPoints.length; ++i) {
                        if (!item.locked && item.controlPoints[i].hit(pt, 10)) {
                            item.controlPoints[i].id = i;
                            this.moveIn.type = MoveInType.LineControlPoint;
                            this.moveIn.lineControlPoint = item.controlPoints[i];
                            this.moveIn.hoverLine = item;
                            this.divLayer.canvas.style.cursor = 'pointer';
                            return;
                        }
                    }
                    if (this.inLine(pt, item)) {
                        return;
                    }
                }
            }
        }
        this.divLayer.canvas.style.cursor = 'default';
        var len = this.data.pens.length;
        var inLine;
        for (var i = len - 1; i > -1; --i) {
            if (this.data.pens[i].type === PenType.Node && this.inNode(pt, this.data.pens[i])) {
                if (inLine && this.moveIn.type !== MoveInType.HoverAnchors) {
                    this.inLine(pt, inLine);
                }
                return;
            }
            else if (this.data.pens[i].type === PenType.Line && this.inLine(pt, this.data.pens[i])) {
                // 优先判断是否在节点锚点上
                inLine = this.data.pens[i];
            }
        }
    };
    Topology.prototype.inChildNode = function (pt, children) {
        if (!children) {
            return null;
        }
        var len = children.length;
        for (var i = len - 1; i > -1; --i) {
            var item = children[i];
            if (!item.visible || item.locked === Lock.NoEvent) {
                continue;
            }
            if (item.type === PenType.Line) {
                if (this.inLine(pt, item)) {
                    return item;
                }
                continue;
            }
            var node = this.inChildNode(pt, item.children);
            if (node) {
                return node;
            }
            node = this.inNode(pt, item, true);
            if (node) {
                return node;
            }
        }
        return null;
    };
    Topology.prototype.inNode = function (pt, node, inChild) {
        if (inChild === void 0) { inChild = false; }
        if (this.data.locked === Lock.NoEvent || !node.visible || node.locked === Lock.NoEvent) {
            return null;
        }
        var child = this.inChildNode(pt, node.children);
        if (child) {
            if (this.moveIn.type < MoveInType.HoverAnchors) {
                this.moveIn.type = MoveInType.Nodes;
                if (child.stand) {
                    this.moveIn.activeNode = child;
                }
                else {
                    this.moveIn.activeNode = node;
                }
            }
            return child;
        }
        if (node.hitInSelf(pt)) {
            this.moveIn.hoverNode = node;
            this.moveIn.type = MoveInType.Nodes;
            if (!this.data.locked && !node.locked) {
                this.divLayer.canvas.style.cursor = 'move';
            }
            else {
                this.divLayer.canvas.style.cursor = this.options.hoverCursor;
            }
            // Too small
            if (!this.data.locked &&
                !node.locked &&
                !(this.options.hideAnchor || node.hideAnchor || node.rect.width < 20 || node.rect.height < 20)) {
                for (var j = 0; j < node.rotatedAnchors.length; ++j) {
                    if (node.rotatedAnchors[j].hit(pt, this.options.anchorSize)) {
                        if (!this.mouseDown && node.rotatedAnchors[j].mode === AnchorMode.In) {
                            continue;
                        }
                        this.moveIn.type = MoveInType.HoverAnchors;
                        this.moveIn.hoverAnchorIndex = j;
                        this.hoverLayer.hoverAnchorIndex = j;
                        this.divLayer.canvas.style.cursor = 'crosshair';
                        break;
                    }
                }
                if (this.options.autoAnchor && node.rect.center.hit(pt, this.options.anchorSize)) {
                    this.moveIn.hoverNode = node;
                    this.moveIn.type = MoveInType.AutoAnchor;
                    this.divLayer.canvas.style.cursor = 'crosshair';
                }
            }
            if (!inChild) {
                this.moveIn.activeNode = this.moveIn.hoverNode;
            }
            return node;
        }
        if (this.options.hideAnchor || node.hideAnchor || this.data.locked || node.locked) {
            return null;
        }
        if (node.hitInSelf(pt, this.options.anchorSize)) {
            for (var j = 0; j < node.rotatedAnchors.length; ++j) {
                if (node.rotatedAnchors[j].hit(pt, this.options.anchorSize)) {
                    if (!this.mouseDown && node.rotatedAnchors[j].mode === AnchorMode.In) {
                        continue;
                    }
                    this.moveIn.hoverNode = node;
                    this.moveIn.type = MoveInType.HoverAnchors;
                    this.moveIn.hoverAnchorIndex = j;
                    this.hoverLayer.hoverAnchorIndex = j;
                    this.divLayer.canvas.style.cursor = 'crosshair';
                    if (!inChild) {
                        this.moveIn.activeNode = node;
                    }
                    return node;
                }
            }
        }
        return null;
    };
    Topology.prototype.inLine = function (point, line) {
        if (this.data.locked === Lock.NoEvent || !line.visible || line.locked === Lock.NoEvent) {
            return null;
        }
        if (line.children) {
            for (var _i = 0, _a = line.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var l = this.inLine(point, child);
                if (l) {
                    return l;
                }
            }
        }
        if (line.from) {
            if (line.from.hit(point, this.options.anchorSize)) {
                this.moveIn.type = MoveInType.LineFrom;
                this.moveIn.hoverLine = line;
                if (this.data.locked || line.locked) {
                    this.divLayer.canvas.style.cursor = this.options.hoverCursor;
                }
                else {
                    this.divLayer.canvas.style.cursor = 'move';
                }
                return line;
            }
            if (line.to.hit(point, this.options.anchorSize)) {
                this.moveIn.type = MoveInType.LineTo;
                this.moveIn.hoverLine = line;
                if (this.data.locked || line.locked) {
                    this.divLayer.canvas.style.cursor = this.options.hoverCursor;
                }
                else {
                    this.divLayer.canvas.style.cursor = 'move';
                }
                return line;
            }
            if (line.pointIn(point)) {
                this.moveIn.type = MoveInType.Line;
                this.moveIn.hoverLine = line;
                this.divLayer.canvas.style.cursor = this.options.hoverCursor;
                return line;
            }
        }
        return null;
    };
    Topology.prototype.getLineDock = function (point, mode) {
        if (mode === void 0) { mode = AnchorMode.Default; }
        this.hoverLayer.dockAnchor = undefined;
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item instanceof Node) {
                var pen = item.hit(point, 10);
                if (!pen) {
                    continue;
                }
                if (pen.type === PenType.Line) {
                    if (pen.from.hit(point, 10)) {
                        point.x = pen.from.x;
                        point.y = pen.from.y;
                        this.hoverLayer.dockAnchor = pen.from;
                        break;
                    }
                    if (pen.to.hit(point, 10)) {
                        point.x = pen.to.x;
                        point.y = pen.to.y;
                        this.hoverLayer.dockAnchor = pen.to;
                        break;
                    }
                    break;
                }
                this.hoverLayer.node = pen;
                if (this.options.autoAnchor && pen.rect.center.hit(point, 10)) {
                    point.id = pen.id;
                    point.autoAnchor = true;
                    point.x = pen.rect.center.x;
                    point.y = pen.rect.center.y;
                    this.hoverLayer.dockAnchor = pen.rect.center;
                }
                for (var i = 0; i < pen.rotatedAnchors.length; ++i) {
                    if (pen.rotatedAnchors[i].mode && pen.rotatedAnchors[i].mode !== mode) {
                        continue;
                    }
                    if (pen.rotatedAnchors[i].hit(point, 10)) {
                        point.id = pen.id;
                        point.anchorIndex = i;
                        point.autoAnchor = false;
                        point.direction = pen.rotatedAnchors[i].direction;
                        point.x = pen.rotatedAnchors[i].x;
                        point.y = pen.rotatedAnchors[i].y;
                        this.hoverLayer.dockAnchor = pen.rotatedAnchors[i];
                        break;
                    }
                }
                if (this.hoverLayer.dockAnchor) {
                    break;
                }
            }
            else if (item instanceof Line) {
                if (item.id === this.hoverLayer.line.id) {
                    continue;
                }
                if (item.children) {
                    var found = false;
                    for (var _b = 0, _c = item.children; _b < _c.length; _b++) {
                        var child = _c[_b];
                        if (child.from.hit(point, 10)) {
                            point.x = child.from.x;
                            point.y = child.from.y;
                            this.hoverLayer.dockAnchor = child.from;
                            found = true;
                            break;
                        }
                        if (child.to.hit(point, 10)) {
                            point.x = child.to.x;
                            point.y = child.to.y;
                            this.hoverLayer.dockAnchor = child.to;
                            found = true;
                            break;
                        }
                        if (child.controlPoints) {
                            for (var _d = 0, _e = child.controlPoints; _d < _e.length; _d++) {
                                var cp = _e[_d];
                                if (cp.hit(point, 10)) {
                                    point.x = cp.x;
                                    point.y = cp.y;
                                    this.hoverLayer.dockAnchor = cp;
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (found) {
                        continue;
                    }
                }
                else {
                    if (item.from.hit(point, 10)) {
                        point.x = item.from.x;
                        point.y = item.from.y;
                        this.hoverLayer.dockAnchor = item.from;
                        continue;
                    }
                    if (item.to.hit(point, 10)) {
                        point.x = item.to.x;
                        point.y = item.to.y;
                        this.hoverLayer.dockAnchor = item.to;
                        continue;
                    }
                    if (item.controlPoints) {
                        for (var _f = 0, _g = item.controlPoints; _f < _g.length; _f++) {
                            var cp = _g[_f];
                            if (cp.hit(point, 10)) {
                                point.x = cp.x;
                                point.y = cp.y;
                                this.hoverLayer.dockAnchor = cp;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return point;
    };
    Topology.prototype.getPensInRect = function (rect) {
        var _this = this;
        if (rect.width < 0) {
            rect.width = -rect.width;
            rect.x = rect.ex;
            rect.ex = rect.x + rect.width;
        }
        if (rect.height < 0) {
            rect.height = -rect.height;
            rect.y = rect.ey;
            rect.ey = rect.y + rect.height;
        }
        this.activeLayer.pens = [];
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.locked === Lock.NoEvent) {
                continue;
            }
            if (item instanceof Node) {
                if (rect.hitByRect(item.rect)) {
                    this.activeLayer.add(item);
                }
            }
            if (item instanceof Line) {
                if (item.children) {
                    item.children.forEach(function (child) {
                        if (rect.hit(child.from) && rect.hit(child.to)) {
                            _this.activeLayer.add(child);
                        }
                    });
                }
                else if (rect.hit(item.from) && rect.hit(item.to)) {
                    this.activeLayer.add(item);
                }
            }
        }
    };
    Topology.prototype.getAngle = function (pt) {
        if (pt.x === this.activeLayer.rect.center.x) {
            return pt.y <= this.activeLayer.rect.center.y ? 0 : 180;
        }
        if (pt.y === this.activeLayer.rect.center.y) {
            return pt.x < this.activeLayer.rect.center.x ? 270 : 90;
        }
        var x = pt.x - this.activeLayer.rect.center.x;
        var y = pt.y - this.activeLayer.rect.center.y;
        var angle = (Math.atan(Math.abs(x / y)) / (2 * Math.PI)) * 360;
        if (x > 0 && y > 0) {
            angle = 180 - angle;
        }
        else if (x < 0 && y > 0) {
            angle += 180;
        }
        else if (x < 0 && y < 0) {
            angle = 360 - angle;
        }
        if (this.activeLayer.pens.length === 1) {
            return angle - this.activeLayer.pens[0].rotate;
        }
        return angle;
    };
    Topology.prototype.showInput = function (item) {
        this.inputObj = item;
        var textRect = item.getTextRect();
        if (!textRect) {
            return;
        }
        this.input.value = item.text || '';
        this.input.style.left = textRect.x + this.data.x + 'px';
        this.input.style.top = textRect.y + this.data.y + 'px';
        this.input.style.width = textRect.width + 'px';
        this.input.style.height = textRect.height + 'px';
        this.input.style.zIndex = '1000';
        if (item.rotate / 360) {
            this.input.style.transform = "rotate(".concat(item.rotate, "deg)");
        }
        else {
            this.input.style.transform = undefined;
        }
        // 为 textarea 添加 class
        this.input.classList.add('set-text-input');
        this.input.focus();
    };
    // 包含画布偏移量的 Rect，相对与可视区域的内容
    Topology.prototype.getRect = function (pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var rect = getRect(pens);
        return new Rect(rect.x + this.data.x, rect.y + this.data.y, rect.width, rect.height);
    };
    // Get a dock rect for moving nodes.
    Topology.prototype.getDockPos = function (offsetX, offsetY, noDock) {
        this.hoverLayer.dockLineX = 0;
        this.hoverLayer.dockLineY = 0;
        var offset = {
            x: 0,
            y: 0,
        };
        if (noDock || this.options.disableDockLine) {
            return offset;
        }
        var x = 0;
        var y = 0;
        var disX = dockOffset;
        var disY = dockOffset;
        for (var _i = 0, _a = this.activeLayer.dockWatchers; _i < _a.length; _i++) {
            var activePt = _a[_i];
            for (var _b = 0, _c = this.data.pens; _b < _c.length; _b++) {
                var item = _c[_b];
                if (!(item instanceof Node) || this.activeLayer.has(item) || item.name === 'text') {
                    continue;
                }
                // if (!item.dockWatchers) {
                //   item.getDockWatchers();
                // }
                for (var _d = 0, _e = item.dockWatchers; _d < _e.length; _d++) {
                    var p = _e[_d];
                    x = Math.abs(p.x - activePt.x - offsetX);
                    if (x < disX) {
                        disX = -99999;
                        offset.x = p.x - activePt.x;
                        this.hoverLayer.dockLineX = p.x | 0;
                    }
                    y = Math.abs(p.y - activePt.y - offsetY);
                    if (y < disY) {
                        disY = -99999;
                        offset.y = p.y - activePt.y;
                        this.hoverLayer.dockLineY = p.y | 0;
                    }
                }
            }
        }
        return offset;
    };
    Topology.prototype.cache = function () {
        if (this.options.cacheLen == 0 || this.data.locked)
            return;
        if (this.caches.index < this.caches.list.length - 1) {
            this.caches.list.splice(this.caches.index + 1, this.caches.list.length - this.caches.index - 1);
            // 删除 indexDB 的值
            spliceCache(this.caches.dbIndex + 1);
        }
        var data = this.pureData();
        this.caches.list.push(data);
        pushCache(data, this.caches.dbIndex + 1, this.options.cacheLen);
        if (this.caches.list.length > this.ramCaches) {
            this.caches.list.shift();
        }
        this.caches.index = this.caches.list.length - 1;
        this.caches.dbIndex++; // 向后移动
    };
    Topology.prototype.cacheReplace = function (pens) {
        if (this.options.cacheLen == 0)
            return;
        if (pens && pens.length) {
            var needPenMap = {};
            for (var i = 0, len = pens.length; i < len; i++) {
                var pen = pens[i];
                var id = pen.id;
                if (pen instanceof Node) {
                    needPenMap[id] = new Node(pen);
                }
                else if (pen instanceof Line) {
                    needPenMap[id] = new Line(pen);
                }
            }
            var cacheListData = this.caches.list[0];
            if (!cacheListData) {
                return;
            }
            for (var i = 0, len = cacheListData.pens.length; i < len; i++) {
                var id = cacheListData.pens[i].id;
                if (needPenMap[id]) {
                    cacheListData.pens[i] = needPenMap[id];
                }
            }
        }
    };
    Topology.prototype.undo = function (noRedo, force) {
        var _this = this;
        if (noRedo === void 0) { noRedo = false; }
        if (this.options.cacheLen == 0)
            return;
        if ((!force && this.data.locked) || this.caches.index < 1) {
            return;
        }
        this.divLayer.clear(true);
        this.animateLayer.stop();
        this.caches.dbIndex--; // 数据库中的位置前移
        this.data = createData(this.caches.list[--this.caches.index], this.id);
        this.render(true);
        this.divLayer.render();
        if (noRedo) {
            this.caches.list.splice(this.caches.index + 1, this.caches.list.length - this.caches.index - 1);
            // 不允许恢复，同时删除数据库中的值
            spliceCache(this.caches.dbIndex);
        }
        // 当 index 到 list 中间时，开始向左侧添加 indexDB 中的内容
        if (this.caches.index <= this.caches.list.length / 2 - 1) {
            var sub = this.caches.index - 0 + 1; // 距离左侧前一个的差距
            getCache(this.caches.dbIndex - sub).then(function (data) {
                if (data) {
                    _this.caches.list.pop();
                    _this.caches.list.unshift(data);
                    _this.caches.index++;
                }
            });
        }
        this.dispatch('undo', this.data);
    };
    Topology.prototype.redo = function (force) {
        var _this = this;
        if (this.options.cacheLen == 0) {
            return;
        }
        if ((!force && this.data.locked) || this.caches.index > this.caches.list.length - 2) {
            return;
        }
        this.divLayer.clear(true);
        this.caches.dbIndex++; // 向后移动
        this.data = createData(this.caches.list[++this.caches.index], this.id);
        this.render(true);
        this.divLayer.render();
        // 当 index 到 list 中间时，开始向右侧加
        if (this.caches.index >= this.caches.list.length / 2) {
            var add = this.caches.list.length - this.caches.index; // 距离右侧的差距
            getCache(this.caches.dbIndex + add).then(function (data) {
                if (data) {
                    _this.caches.list.shift();
                    _this.caches.list.push(data);
                    _this.caches.index--;
                }
            });
        }
        this.dispatch('redo', this.data);
    };
    Topology.prototype.toImage = function (padding, callback) {
        if (padding === void 0) { padding = 0; }
        if (callback === void 0) { callback = undefined; }
        var backRect;
        if (this.data.bkImageRect) {
            // 背景图片相对于画布的 rect
            backRect = new Rect(this.data.bkImageRect.x - this.data.x, this.data.bkImageRect.y - this.data.y, this.data.bkImageRect.width, this.data.bkImageRect.height);
        }
        var rect = getMoreRect(getRect(this.data.pens), backRect);
        var p = formatPadding(padding || 0);
        rect.x -= p[3];
        rect.y -= p[0];
        rect.width += p[3] + p[1];
        rect.height += p[0] + p[2];
        rect.init();
        var dpi = this.offscreen.getDpiRatio();
        rect.scale(dpi);
        backRect && backRect.scale(dpi, rect.center);
        var canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        var ctx = canvas.getContext('2d');
        if (this.data.bkColor || this.options.bkColor) {
            ctx.fillStyle = this.data.bkColor || this.options.bkColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (this.data.bkImage && backRect) {
            ctx.drawImage(this.canvas.bkImg, backRect.x - rect.x, backRect.y - rect.y, backRect.width, backRect.height);
        }
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            var pen = void 0;
            if (item.type) {
                pen = new Line(item);
            }
            else {
                pen = new Node(item, true);
                pen.animateFrames = [];
                pen.img = item.img;
                pen.elementId = '';
                pen.elementLoaded = true;
                pen.elementRendered = true;
            }
            pen.scale(dpi, rect.center);
            pen.translate(-rect.x, -rect.y, true);
            pen.render(ctx);
        }
        ctx.scale(1 / dpi, 1 / dpi);
        if (callback) {
            canvas.toBlob(callback);
        }
        return canvas.toDataURL('image/png', 1);
    };
    Topology.prototype.saveAsImage = function (name, padding) {
        if (padding === void 0) { padding = 0; }
        var a = document.createElement('a');
        a.setAttribute('download', name || 'le5le.topology.png');
        a.setAttribute('href', this.toImage(padding));
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, true);
        a.dispatchEvent(evt);
    };
    // param:
    //       - string ->idOrTag
    //       - Pen[]  -> will deletes
    Topology.prototype.delete = function (param, force) {
        if (this.data.locked && !force) {
            return;
        }
        var deleted = [];
        if (typeof param === 'string') {
            deleted = del(param, this.data.pens);
        }
        else {
            var pens = param || this.activeLayer.pens;
            for (var i = 0; i < pens.length; i++) {
                var item = pens[i];
                if (item.type === PenType.Line && item.parentId) {
                    var parent_1 = find(item.parentId, this.data.pens)[0];
                    if (parent_1 && parent_1.name === 'lines') {
                        item = parent_1;
                    }
                }
                if (del(item.id, this.data.pens).length) {
                    deleted.push(item);
                    --i;
                    if (item.type === PenType.Node) {
                        this.divLayer.removeDiv(item);
                    }
                    if (this.options.disableEmptyLine) {
                        this.delEmptyLines(item.id);
                    }
                    this.animateLayer.pens.delete(item.id);
                }
            }
        }
        if (deleted.length) {
            this.render(true);
            this.cache();
            this.dispatch('delete', deleted);
        }
    };
    Topology.prototype.deleteAnchors = function (param, force) {
        if (this.data.locked && !force) {
            return;
        }
        var pens = param || this.activeLayer.pens;
        pens.forEach(function (pen) {
            if (pen.type === PenType.Node) {
                pen.manualAnchors = undefined;
                pen.calcAnchors();
            }
        });
    };
    Topology.prototype.delEmptyLines = function (deleteedId) {
        for (var i = 0; i < this.data.pens.length; i++) {
            if (this.data.pens[i].type !== PenType.Line) {
                continue;
            }
            var line = this.data.pens[i];
            if (!line.from.id || !line.to.id || line.from.id === deleteedId || line.to.id === deleteedId) {
                this.data.pens.splice(i, 1);
                this.animateLayer.pens.delete(line.id);
                --i;
            }
        }
    };
    Topology.prototype.cut = function () {
        if (this.data.locked) {
            return;
        }
        this.clipboard = createData({
            pens: [],
        });
        for (var i = 0; i < this.activeLayer.pens.length; i++) {
            var pen = this.activeLayer.pens[i];
            this.clipboard.pens.push(pen.clone());
            var found = this.findIndex(pen);
            if (found > -1) {
                if (pen.type === PenType.Node) {
                    this.divLayer.removeDiv(this.data.pens[found]);
                }
                this.data.pens.splice(found, 1);
            }
        }
        this.cache();
        this.activeLayer.clear();
        this.hoverLayer.node = undefined;
        this.moveIn.hoverLine = undefined;
        this.moveIn.hoverNode = undefined;
        this.render();
        this.dispatch('delete', this.clipboard.pens);
    };
    Topology.prototype.copy = function () {
        this.clipboard = createData({
            pens: [],
        });
        for (var _i = 0, _a = this.activeLayer.pens; _i < _a.length; _i++) {
            var pen = _a[_i];
            this.clipboard.pens.push(pen.clone());
            pen.parentId = null;
        }
        this.dispatch('copy', this.clipboard);
    };
    Topology.prototype.paste = function () {
        if (!this.clipboard || this.data.locked) {
            return;
        }
        this.hoverLayer.node = undefined;
        this.hoverLayer.line = undefined;
        this.activeLayer.pens = [];
        var idMaps = {};
        for (var _i = 0, _a = this.clipboard.pens; _i < _a.length; _i++) {
            var pen = _a[_i];
            this.pastePen(pen, idMaps, 20);
            this.data.pens.push(pen);
            this.activeLayer.add(pen);
        }
        this.render();
        this.animate(true);
        this.cache();
        this.copy();
        this.dispatch('paste', this.clipboard.pens);
    };
    /**
     * 粘贴当前画笔，位置偏移 offset
     * */
    Topology.prototype.pastePen = function (pen, idMaps, offset, parentId) {
        if (idMaps === void 0) { idMaps = {}; }
        if (offset === void 0) { offset = 0; }
        if (!pen.type) {
            var old = pen.id;
            pen.id = s8();
            idMaps[old] = pen.id;
            parentId && (pen.parentId = parentId);
            pen.rect.x += offset;
            pen.rect.ex += offset;
            pen.rect.y += offset;
            pen.rect.ey += offset;
            // 存在自定义瞄点
            if (pen.manualAnchors) {
                // 将 位置偏移 offset
                pen.manualAnchors.forEach(function (pt) {
                    pt.x += offset;
                    pt.y += offset;
                });
            }
            // 存在 points
            if (pen.points) {
                // 将 位置偏移 offset
                pen.points.forEach(function (pt) {
                    pt.x += offset;
                    pt.y += offset;
                });
            }
            // 若是 echarts 等 dom 元素 则清一下 elementId
            if (this.clearElementIdPensName.includes(pen.name)) {
                pen.elementId = undefined;
            }
            pen.init();
        }
        else if (pen instanceof Line) {
            pen.id = s8();
            parentId && (pen.parentId = parentId);
            pen.from = new Point(pen.from.x + offset, pen.from.y + offset, pen.from.direction, pen.from.anchorIndex, idMaps[pen.from.id]);
            pen.to = new Point(pen.to.x + offset, pen.to.y + offset, pen.to.direction, pen.to.anchorIndex, idMaps[pen.to.id]);
            var controlPoints = [];
            for (var _i = 0, _a = pen.controlPoints; _i < _a.length; _i++) {
                var pt = _a[_i];
                controlPoints.push(new Point(pt.x + offset, pt.y + offset));
            }
            pen.controlPoints = controlPoints;
        }
        if (pen.children) {
            for (var _b = 0, _c = pen.children; _b < _c.length; _b++) {
                var item = _c[_b];
                this.pastePen(item, idMaps, offset, pen.id);
            }
        }
    };
    // newId(node: any, idMaps: any) {
    //   const old = node.id;
    //   node.id = s8();
    //   idMaps[old] = node.id;
    //   if (node.children) {
    //     for (const item of node.children) {
    //       this.newId(item, idMaps);
    //     }
    //   }
    // }
    Topology.prototype.animate = function (autoplay) {
        if (autoplay === void 0) { autoplay = false; }
        this.animateLayer.readyPlay(undefined, autoplay);
        this.animateLayer.animate();
    };
    Topology.prototype.updateProps = function (cache, pens) {
        if (cache === void 0) { cache = true; }
        if (!pens) {
            pens = this.activeLayer.pens;
        }
        for (var _i = 0, pens_1 = pens; _i < pens_1.length; _i++) {
            var pen = pens_1[_i];
            if (pen instanceof Node) {
                if (pen.autoRect) {
                    var ctx = this.canvas.canvas.getContext('2d');
                    var rect = calcTextRect(ctx, pen);
                    pen.rect.width = rect.width + pen.lineWidth * 2;
                    pen.rect.height = rect.height;
                }
                pen.init();
                pen.initRect();
            }
        }
        this.activeLayer.updateLines(pens);
        this.activeLayer.calcControlPoints();
        this.activeLayer.saveNodeRects();
        this.render();
        // tslint:disable-next-line: no-unused-expression
        cache && this.cache();
    };
    Topology.prototype.lock = function (lock) {
        this.data.locked = lock;
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            item.addToDiv && item.addToDiv();
        }
        this.dispatch('locked', this.data.locked);
    };
    Topology.prototype.lockPens = function (pens, lock) {
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            for (var _b = 0, pens_2 = pens; _b < pens_2.length; _b++) {
                var pen = pens_2[_b];
                if (item.id === pen.id) {
                    item.locked = lock;
                    item.addToDiv && item.addToDiv();
                    break;
                }
            }
        }
        this.dispatch('lockPens', {
            pens: pens,
            lock: lock,
        });
    };
    Topology.prototype.up = function (pen, pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var i = this.findIndex(pen, pens);
        if (i > -1 && i !== pens.length - 1) {
            pens.splice(i + 2, 0, pens[i]);
            pens.splice(i, 1);
        }
        else {
            var parent_2 = getParent(pens, pen);
            if (!parent_2) {
                return;
            }
            this.up(pen, parent_2.children);
        }
    };
    Topology.prototype.top = function (pen, pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var i = this.findIndex(pen, pens);
        if (i > -1) {
            pens.push(pens[i]);
            pens.splice(i, 1);
        }
        else {
            var parent_3 = getParent(pens, pen);
            if (!parent_3) {
                return;
            }
            this.top(pen, parent_3.children);
        }
    };
    Topology.prototype.down = function (pen, pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var i = this.findIndex(pen, pens);
        if (i > -1 && i !== 0) {
            pens.splice(i - 1, 0, pens[i]);
            pens.splice(i + 1, 1);
        }
        else {
            var parent_4 = getParent(pens, pen);
            if (!parent_4) {
                return;
            }
            this.down(pen, parent_4.children);
        }
    };
    Topology.prototype.bottom = function (pen, pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var i = this.findIndex(pen, pens);
        if (i > -1) {
            pens.unshift(pens[i]);
            pens.splice(i + 1, 1);
        }
        else {
            var parent_5 = getParent(pens, pen);
            if (!parent_5) {
                return;
            }
            this.bottom(pen, parent_5.children);
        }
    };
    Topology.prototype.getParent = function (pen) {
        return getParent(this.data.pens, pen);
    };
    Topology.prototype.combine = function (pens, stand) {
        if (stand === void 0) { stand = false; }
        if (!pens) {
            pens = this.activeLayer.pens;
        }
        var rect = getRect(pens);
        for (var _i = 0, pens_3 = pens; _i < pens_3.length; _i++) {
            var item = pens_3[_i];
            var i = this.findIndex(item);
            if (i > -1) {
                this.data.pens.splice(i, 1);
            }
        }
        var node = new Node({
            name: 'combine',
            rect: new Rect(rect.x, rect.y, rect.width, rect.height),
            text: '',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            strokeStyle: 'transparent',
            children: [],
        });
        for (var i = 0; i < pens.length; ++i) {
            if (pens[i].type === PenType.Node && rect.width === pens[i].rect.width && rect.height === pens[i].rect.height) {
                node = pens[i];
                if (!node.children) {
                    node.children = [];
                }
                pens.splice(i, 1);
                break;
            }
        }
        for (var _a = 0, pens_4 = pens; _a < pens_4.length; _a++) {
            var item = pens_4[_a];
            item.stand = stand;
            item.parentId = node.id;
            item.calcRectInParent(node);
            node.children.push(item);
        }
        this.data.pens.push(node);
        this.activeLayer.setPens([node]);
        this.dispatch('combine', node);
        this.cache();
    };
    Topology.prototype.uncombine = function (node) {
        if (!node) {
            node = this.activeLayer.pens[0];
        }
        if (!(node instanceof Node)) {
            return;
        }
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var item = _a[_i];
            item.parentId = undefined;
            item.rectInParent = undefined;
            item.locked = Lock.None;
            this.data.pens.push(item);
        }
        var i = this.findIndex(node);
        if (i > -1 && node.name === 'combine') {
            this.data.pens.splice(i, 1);
        }
        else {
            node.children = undefined;
        }
        this.cache();
        this.activeLayer.clear();
        this.hoverLayer.clear();
        this.dispatch('uncombine', node);
    };
    Topology.prototype.find = function (idOrTag, pens, array) {
        var list;
        if (Array.isArray(pens)) {
            list = pens;
        }
        else {
            list = this.data.pens;
            array = pens;
        }
        var result = find(idOrTag, list);
        if (array) {
            return result;
        }
        if (result.length === 0) {
            return null;
        }
        else if (result.length === 1) {
            return result[0];
        }
        return result;
    };
    Topology.prototype.findIndex = function (pen, pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        return pens.findIndex(function (item) { return item.id === pen.id; });
    };
    Topology.prototype.play = function (idOrTag, pause) {
        this.divLayer.play(idOrTag, pause);
    };
    Topology.prototype.translate = function (x, y, process, noNotice) {
        var _this = this;
        if (!process) {
            this.lastTranlated.x = 0;
            this.lastTranlated.y = 0;
        }
        var offsetX = x - this.lastTranlated.x;
        var offsetY = y - this.lastTranlated.y;
        this.data.x += offsetX;
        this.data.y += offsetY;
        // for (const item of this.data.pens) {
        //   item.translate(offsetX, offsetY);
        // }
        if (this.data.bkImageRect && !this.data.bkImageStatic) {
            this.data.bkImageRect.translate(offsetX, offsetY);
        }
        Store.set(this.generateStoreKey('LT:updateLines'), this.data.pens);
        this.lastTranlated.x = x;
        this.lastTranlated.y = y;
        this.render();
        this.divLayer.render();
        this.animateLayer.stop();
        if (this.cacheTimer) {
            clearTimeout(this.cacheTimer);
        }
        this.cacheTimer = setTimeout(function () {
            var _a;
            _this.animateLayer.readyPlay(undefined, true);
            _this.animateLayer.animate();
            (_a = _this.cache) === null || _a === void 0 ? void 0 : _a.call(_this);
        }, 300);
        if (!noNotice) {
            this.dispatch('translate', { x: x, y: y });
        }
        if (this.scrollDom && this.scrollDom.isShow) {
            this.scrollDom.translate(x, y);
        }
    };
    // scale for scaled canvas:
    //   > 1, expand
    //   < 1, reduce
    Topology.prototype.scale = function (scale, center) {
        if (this.data.scale * scale < this.options.minScale) {
            scale = this.options.minScale / this.data.scale;
            this.data.scale = this.options.minScale;
        }
        else if (this.data.scale * scale > this.options.maxScale) {
            scale = this.options.maxScale / this.data.scale;
            this.data.scale = this.options.maxScale;
        }
        else {
            this.data.scale = Math.round(this.data.scale * scale * 100) / 100;
        }
        !center && (center = getRect(this.data.pens).center);
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            item.scale(scale, center);
        }
        if (this.data.bkImageRect && !this.data.bkImageStatic) {
            var backCenter = new Point(center.x + this.data.x, center.y + this.data.y);
            this.data.bkImageRect.scale(scale, backCenter);
        }
        Store.set(this.generateStoreKey('LT:updateLines'), this.data.pens);
        Store.set(this.generateStoreKey('LT:scale'), this.data.scale);
        this.render();
        this.cache();
        this.dispatch('scale', this.data.scale);
    };
    // scale for origin canvas:
    Topology.prototype.scaleTo = function (scale, center) {
        this.scale(scale / this.data.scale, center);
    };
    Topology.prototype.round = function () {
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item instanceof Node) {
                item.round();
            }
        }
    };
    Topology.prototype.centerView = function (padding) {
        if (!this.hasView())
            return;
        var rect = this.getRect();
        var viewCenter = this.getViewCenter(padding);
        var center = rect.center;
        this.translate(viewCenter.x - center.x, viewCenter.y - center.y);
        var parentElem = this.canvas.parentElem;
        var x = (parentElem.scrollWidth - parentElem.offsetWidth) / 2;
        var y = (parentElem.scrollHeight - parentElem.offsetHeight) / 2;
        parentElem.scrollTo(x, y);
        return true;
    };
    Topology.prototype.fitView = function (viewPadding) {
        if (!this.hasView())
            return;
        // 1. 重置画布尺寸为容器尺寸
        var parentElem = this.canvas.parentElem;
        var width = parentElem.offsetWidth, height = parentElem.offsetHeight;
        this.resize({
            width: width,
            height: height,
        });
        // 2. 获取设置的留白值
        var padding = formatPadding(viewPadding || this.options.viewPadding);
        // 3. 获取图形尺寸
        var rect = this.getRect();
        // 4. 计算缩放比
        var w = (width - padding[1] - padding[3]) / rect.width;
        var h = (height - padding[0] - padding[2]) / rect.height;
        var ratio = w;
        if (w > h) {
            ratio = h;
        }
        this.scale(ratio);
        // 5. 图形居中
        this.centerView(viewPadding);
    };
    Topology.prototype.hasView = function () {
        return !!this.data.pens.length;
    };
    Topology.prototype.getViewCenter = function (viewPadding) {
        var padding = formatPadding(viewPadding || this.options.viewPadding);
        var _a = this.canvas, width = _a.width, height = _a.height;
        return {
            x: (width - padding[1] - padding[3]) / 2 + padding[3],
            y: (height - padding[0] - padding[2]) / 2 + padding[0],
        };
    };
    Topology.prototype.generateStoreKey = function (key) {
        return "".concat(this.id, "-").concat(key);
    };
    Topology.prototype.createMarkdownTip = function () {
        this.tipMarkdown = document.createElement('div');
        this.tipMarkdown.className = 'topology-markdown';
        this.tipMarkdown.style.position = 'fixed';
        this.tipMarkdown.style.zIndex = '-1';
        this.tipMarkdown.style.left = '-9999px';
        this.tipMarkdown.style.padding = '8px 0';
        this.tipMarkdownContent = document.createElement('div');
        this.tipMarkdownContent.style.maxWidth = '320px';
        this.tipMarkdownContent.style.outline = 'none';
        this.tipMarkdownContent.style.borderRadius = '4px';
        this.tipMarkdownContent.style.backgroundColor = 'rgba(0,0,0,.6)';
        this.tipMarkdownContent.style.color = '#fff';
        this.tipMarkdownContent.style.padding = '8px 16px';
        this.tipMarkdownContent.style.lineHeight = '1.8';
        this.tipMarkdownContent.style.overflowY = 'auto';
        this.tipMarkdownContent.style.minHeight = '30px';
        this.tipMarkdownContent.style.maxHeight = '400px';
        this.tipMarkdown.appendChild(this.tipMarkdownContent);
        this.tipMarkdownArrowUp = document.createElement('div');
        this.tipMarkdownArrowUp.className = 'arrow';
        this.tipMarkdownArrowUp.style.position = 'absolute';
        this.tipMarkdownArrowUp.style.border = '6px solid transparent';
        this.tipMarkdownArrowUp.style.backgroundColor = 'transparent';
        this.tipMarkdownArrowUp.style.left = '50%';
        this.tipMarkdownArrowUp.style.transform = 'translateX(-50%)';
        this.tipMarkdownArrowUp.style.top = '-4px';
        // this.tipMarkdownArrowUp.style.borderBottomColor = 'rgba(0,0,0,.6)';
        this.tipMarkdown.appendChild(this.tipMarkdownArrowUp);
        this.tipMarkdownArrowDown = document.createElement('div');
        this.tipMarkdownArrowDown.className = 'arrow';
        this.tipMarkdownArrowDown.style.position = 'absolute';
        this.tipMarkdownArrowDown.style.border = '6px solid transparent';
        this.tipMarkdownArrowDown.style.left = '50%';
        this.tipMarkdownArrowDown.style.transform = 'translateX(-50%)';
        this.tipMarkdownArrowDown.style.backgroundColor = 'transparent';
        this.tipMarkdownArrowDown.style.bottom = '-4px';
        // this.tipMarkdownArrowDown.style.borderTopColor = 'rgba(0,0,0,.6)';
        this.tipMarkdown.appendChild(this.tipMarkdownArrowDown);
        document.body.appendChild(this.tipMarkdown);
    };
    Topology.prototype.showTip = function (data, pos) {
        if (!data || data.id === this.tip || this.data.tooltip === false || this.data.tooltip === 0) {
            return;
        }
        if (data.title) {
            this.divLayer.canvas.title = data.title;
            this.tip = data.id;
            return;
        }
        if (data.tipId) {
            this.tipElem = document.getElementById(data.tipId);
        }
        var elem = this.tipElem;
        if (data.markdown) {
            elem = this.tipMarkdown;
            var marked = window.marked;
            if (marked) {
                this.tipMarkdownContent.innerHTML = marked(data.markdown);
            }
            else {
                this.tipMarkdownContent.innerHTML = data.markdown;
            }
            var a = this.tipMarkdownContent.getElementsByTagName('A');
            for (var i = 0; i < a.length; ++i) {
                a[i].setAttribute('target', '_blank');
            }
        }
        if (!elem) {
            return;
        }
        var parentRect = this.parentElem.getBoundingClientRect();
        var elemRect = elem.getBoundingClientRect();
        var x = (parentRect.left || parentRect.x) - (elemRect.width - data.rect.width) / 2 + this.data.x;
        var y = (parentRect.top || parentRect.y) - elemRect.height - data.rect.height + this.data.y;
        x += !data.type ? data.rect.x : pos.x;
        y += !data.type ? data.rect.ey : pos.y;
        if (y > 0) {
            this.tipMarkdownArrowUp.style.borderBottomColor = 'transparent';
            this.tipMarkdownArrowDown.style.borderTopColor = 'rgba(0,0,0,.6)';
        }
        else {
            y += elemRect.height + data.rect.height;
            this.tipMarkdownArrowUp.style.borderBottomColor = 'rgba(0,0,0,.6)';
            this.tipMarkdownArrowDown.style.borderTopColor = 'transparent';
        }
        elem.style.display = 'block';
        elem.style.position = 'fixed';
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
        elem.style.zIndex = '100';
        this.tip = data.id;
        this.dispatch('tip', elem);
    };
    Topology.prototype.hideTip = function () {
        if (!this.tip) {
            return;
        }
        this.tipMarkdown.style.left = '-9999px';
        this.tipMarkdown.style.zIndex = '-1';
        if (this.tipElem) {
            this.tipElem.style.left = '-9999px';
            this.tipElem.style.zIndex = '-1';
            this.tipElem = undefined;
        }
        this.divLayer.canvas.title = '';
        this.tip = '';
    };
    Topology.prototype.scroll = function (x, y) {
        var _this = this;
        if (this.scrolling) {
            return;
        }
        this.scrolling = true;
        this.parentElem.scrollLeft += x;
        this.parentElem.scrollTop += y;
        setTimeout(function () {
            _this.scrolling = false;
        }, 700);
    };
    Topology.prototype.toComponent = function (pens) {
        if (!pens) {
            pens = this.data.pens;
        }
        var rect = getRect(pens);
        var node = new Node({
            name: 'combine',
            rect: new Rect(rect.x, rect.y, rect.width, rect.height),
            text: '',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            strokeStyle: 'transparent',
            children: [],
        });
        for (var _i = 0, pens_5 = pens; _i < pens_5.length; _i++) {
            var item = pens_5[_i];
            if (item.type === PenType.Node && rect.width === item.rect.width && rect.height === item.rect.height) {
                node = item;
                if (!node.children) {
                    node.children = [];
                }
                break;
            }
        }
        for (var _a = 0, pens_6 = pens; _a < pens_6.length; _a++) {
            var item = pens_6[_a];
            if (item !== node) {
                item.parentId = node.id;
                item.calcRectInParent(node);
                node.children.push(item);
            }
        }
        return node;
    };
    Topology.prototype.clearBkImg = function () {
        this.canvas.clearBkImg();
    };
    Topology.prototype.dispatch = function (event, data) {
        if (this.options.on) {
            this.options.on(event, data);
        }
        this.emit(event, data);
        return this;
    };
    Topology.prototype.on = function (eventType, handler) {
        this._emitter.on(eventType, handler);
        return this;
    };
    Topology.prototype.off = function (eventType, handler) {
        this._emitter.off(eventType, handler);
        return this;
    };
    Topology.prototype.emit = function (eventType, params) {
        this._emitter.emit(eventType, params);
        return this;
    };
    Topology.prototype.getValue = function (idOrTag, attr) {
        if (attr === void 0) { attr = 'text'; }
        var pen = this.find(idOrTag);
        if (!pen) {
            return;
        }
        if (Array.isArray(pen)) {
            pen = pen[0];
        }
        if (!pen) {
            return;
        }
        return pen[attr];
    };
    Topology.prototype.setValue = function (idOrTag, val, attr) {
        if (attr === void 0) { attr = 'text'; }
        if (typeof idOrTag === 'object') {
            val = idOrTag;
            idOrTag = idOrTag.id || idOrTag.tag;
        }
        var pens = find(idOrTag, this.data.pens);
        pens.forEach(function (item) {
            if (item.id === idOrTag || (item.tags && item.tags.indexOf(idOrTag) > -1)) {
                if (typeof val === 'object') {
                    item.fromData(item, val);
                }
                else {
                    item[attr] = val;
                }
                item.doWheres();
                if (item.type === PenType.Node) {
                    item.animateReady = Node.cloneState(item);
                }
            }
        });
        this.willRender();
    };
    Topology.prototype.willRender = function () {
        var _this = this;
        if (this.actionTimer) {
            // 节流行为，保证每 100ms 执行一次
            return;
        }
        this.actionTimer = setTimeout(function () {
            _this.render();
            _this.actionTimer = undefined;
        }, 100);
    };
    Topology.prototype.setLineName = function (name, render) {
        if (render === void 0) { render = true; }
        this.data.pens.forEach(function (pen) {
            if (pen.type) {
                pen.name = name;
                pen.calcControlPoints();
            }
        });
        render && this.render();
    };
    Topology.prototype.setColor = function (color) {
        this.options.color = color;
        Store.set(this.generateStoreKey('LT:color'), color);
        this.options.fontColor = color;
        Store.set(this.generateStoreKey('LT:fontColor'), color);
    };
    Topology.prototype.setFontColor = function (color) {
        this.options.fontColor = color;
        Store.set(this.generateStoreKey('LT:fontColor'), color);
    };
    Topology.prototype.setIconColor = function (color) {
        Store.set(this.generateStoreKey('LT:iconColor'), color);
    };
    Topology.prototype.setBkColor = function (color) {
        this.data.bkColor = color;
        Store.set('LT:bkColor', color);
    };
    Topology.prototype.pureData = function () {
        var _this = this;
        var data = JSON.parse(JSON.stringify(this.data));
        data.pens.forEach(function (pen) {
            for (var key in pen) {
                if (pen[key] === undefined || pen[key] === undefined) {
                    delete pen[key];
                }
            }
            delete pen.TID;
            delete pen.animateCycleIndex;
            delete pen.img;
            delete pen.lastImage;
            delete pen.fillImg;
            delete pen.strokeImg;
            delete pen.lastFillImage;
            delete pen.lastStrokeImage;
            delete pen.imgNaturalWidth;
            delete pen.imgNaturalHeight;
            delete pen.anchors;
            delete pen.rotatedAnchors;
            delete pen.dockWatchers;
            delete pen.elementLoaded;
            delete pen.elementRendered;
            delete pen.animateReady;
            if (pen.animateFrames && pen.animateFrames.length) {
                for (var _i = 0, _a = pen.animateFrames; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (item.initState) {
                        delete item.initState.TID;
                        delete item.initState.animateCycleIndex;
                        delete item.initState.img;
                        delete item.initState.lastImage;
                        delete item.initState.imgNaturalWidth;
                        delete item.initState.imgNaturalHeight;
                        delete item.initState.anchors;
                        delete item.initState.rotatedAnchors;
                        delete item.initState.dockWatchers;
                        delete item.initState.elementLoaded;
                        delete item.initState.elementRendered;
                        delete item.initState.fillImg;
                        delete item.initState.strokeImg;
                        delete item.initState.lastFillImage;
                        delete item.initState.lastStrokeImage;
                    }
                    if (item.state) {
                        delete item.state.TID;
                        delete item.state.animateCycleIndex;
                        delete item.state.img;
                        delete item.state.lastImage;
                        delete item.state.imgNaturalWidth;
                        delete item.state.imgNaturalHeight;
                        delete item.state.anchors;
                        delete item.state.rotatedAnchors;
                        delete item.state.dockWatchers;
                        delete item.state.elementLoaded;
                        delete item.state.elementRendered;
                        delete item.state.fillImg;
                        delete item.state.strokeImg;
                        delete item.state.lastFillImage;
                        delete item.state.lastStrokeImage;
                    }
                }
            }
            _this.pureDataChildren(pen);
        });
        return data;
    };
    Topology.prototype.pureDataChildren = function (data) {
        var _this = this;
        if (!data.children) {
            return;
        }
        data.children.forEach(function (pen) {
            for (var key in pen) {
                if (pen[key] === undefined || pen[key] === undefined || pen[key] === '') {
                    delete pen[key];
                }
            }
            delete pen.TID;
            delete pen.animateCycleIndex;
            delete pen.img;
            delete pen.lastImage;
            delete pen.imgNaturalWidth;
            delete pen.imgNaturalHeight;
            delete pen.anchors;
            delete pen.rotatedAnchors;
            delete pen.dockWatchers;
            delete pen.elementLoaded;
            delete pen.elementRendered;
            delete pen.animateReady;
            _this.pureDataChildren(pen);
        });
    };
    Topology.prototype.destroy = function () {
        this.scrollDom && this.scrollDom.destroy();
        this.subcribe.unsubscribe();
        this.subcribeRender.unsubscribe();
        this.subcribeImage.unsubscribe();
        this.subcribeAnimateEnd.unsubscribe();
        this.subcribeAnimateMoved.unsubscribe();
        this.subcribeMediaEnd.unsubscribe();
        this.subcribeEmit.unsubscribe();
        this.animateLayer.destroy();
        this.divLayer.destroy();
        this.canvas.destroy();
        this.activeLayer.destroy();
        this.hoverLayer.destroy();
        this.offscreen.destroy();
        document.body.removeChild(this.tipMarkdown);
        window.removeEventListener('resize', this.winResize);
        this.parentElem.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('gesturestart', this.preventDefault);
        switch (this.options.keydown) {
            case KeydownType.Document:
                document.removeEventListener('keydown', this.onkeydown);
                break;
            case KeydownType.Canvas:
                this.divLayer.canvas.removeEventListener('keydown', this.onkeydown);
                break;
        }
        this.closeSocket();
        this.closeMqtt();
        if (this.socketFn) {
            this.off('websocket', this.socketFn);
            this.off('mqtt', this.socketFn);
        }
        this.cache = undefined;
        this.data = undefined;
        window.topology = undefined;
    };
    return Topology;
}());
export { Topology };
//# sourceMappingURL=core.js.map