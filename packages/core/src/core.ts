import { commonAnchors, commonPens } from './diagrams';
import { EventType, Handler } from 'mitt';
import { Canvas } from './canvas';
import { Options } from './options';
import {
  calcTextDrawRect,
  calcTextLines,
  calcTextRect,
  facePen,
  getParent,
  getWords,
  LockState,
  Pen,
  PenType,
  renderPenRaw,
} from './pen';
import { Point } from './point';
import {
  clearStore,
  EditAction,
  EditType,
  globalStore,
  register,
  registerAnchors,
  registerCanvasDraw,
  TopologyData,
  TopologyStore,
  useStore,
} from './store';
import { formatPadding, Padding, s8 } from './utils';
import { calcCenter, calcRelativeRect, getRect, Rect } from './rect';
import { deepClone } from './utils/clone';
import { Event, EventAction } from './event';
import { Map } from './map';
import * as mqtt from 'mqtt/dist/mqtt.min.js';

import pkg from '../package.json';

declare const window: any;

export class Topology {
  store: TopologyStore;
  canvas: Canvas;
  websocket: WebSocket;
  mqttClient: any;
  socketFn: Function;
  events: any = {};
  map: Map;
  mapTimer: any;
  constructor(parent: string | HTMLElement, opts: Options = {}) {
    this.store = useStore(s8());
    this.setOptions(opts);
    this.init(parent);
    this.register(commonPens());
    this.registerAnchors(commonAnchors());
    window && (window.topology = this);
    this['facePen'] = facePen;
    this.initEventFns();
    this.store.emitter.on('*', this.onEvent);

    this['getWords'] = getWords;
    this['calcTextLines'] = calcTextLines;
    this['calcTextRect'] = calcTextRect;
    this['calcTextDrawRect'] = calcTextDrawRect;
  }

  get beforeAddPen() {
    return this.canvas.beforeAddPen;
  }
  set beforeAddPen(fn: (pen: Pen) => boolean) {
    this.canvas.beforeAddPen = fn;
  }
  get beforeAddAnchor() {
    return this.canvas.beforeAddAnchor;
  }
  set beforeAddAnchor(fn: (pen: Pen, anchor: Point) => boolean) {
    this.canvas.beforeAddAnchor = fn;
  }
  get beforeRemovePen() {
    return this.canvas.beforeRemovePen;
  }
  set beforeRemovePen(fn: (pen: Pen) => boolean) {
    this.canvas.beforeRemovePen = fn;
  }
  get beforeRemoveAnchor() {
    return this.canvas.beforeAddAnchor;
  }
  set beforeRemoveAnchor(fn: (pen: Pen, anchor: Point) => boolean) {
    this.canvas.beforeAddAnchor = fn;
  }

  setOptions(opts: Options = {}) {
    this.store.options = Object.assign(this.store.options, opts);
  }

  getOptions() {
    return this.store.options;
  }

  private init(parent: string | HTMLElement) {
    if (typeof parent === 'string') {
      this.canvas = new Canvas(this, document.getElementById(parent), this.store);
    } else {
      this.canvas = new Canvas(this, parent, this.store);
    }

    this.resize();
    this.canvas.listen();
  }

  initEventFns() {
    this.events[EventAction.Link] = (pen: any, e: Event) => {
      window.open(e.value, e.params === undefined ? '_blank' : e.params);
    };
    this.events[EventAction.SetProps] = (pen: any, e: Event) => {
      const rect = this.getPenRect(pen);
      this.updateValue(pen, { ...rect, ...e.value });
      this.store.emitter.emit('valueUpdate', pen);
    };
    this.events[EventAction.StartAnimate] = (pen: any, e: Event) => {
      if (e.value) {
        this.startAnimate(e.value);
      } else {
        this.startAnimate([pen]);
      }
    };
    this.events[EventAction.PauseAnimate] = (pen: any, e: Event) => {
      if (e.value) {
        this.pauseAnimate(e.value);
      } else {
        this.pauseAnimate([pen]);
      }
    };
    this.events[EventAction.StopAnimate] = (pen: any, e: Event) => {
      if (e.value) {
        this.stopAnimate(e.value);
      } else {
        this.stopAnimate([pen]);
      }
    };
    this.events[EventAction.Function] = (pen: any, e: Event) => {
      if (!e.fn) {
        try {
          e.fn = new Function('pen', 'params', e.value);
        } catch (err) {
          console.error('Error: make function:', err);
        }
      }
      e.fn && e.fn(pen, e.params);
    };
    this.events[EventAction.WindowFn] = (pen: any, e: Event) => {
      if (window && window[e.value]) {
        window[e.value](pen, e.params);
      }
    };
    this.events[EventAction.Emit] = (pen: any, e: Event) => {
      this.store.emitter.emit(e.value, {
        pen,
        params: e.params,
      });
    };
  }

  resize(width?: number, height?: number) {
    this.canvas.resize(width, height);
    this.canvas.render();
    this.store.emitter.emit('resize', { width, height });

    if (this.canvas.scroll && this.canvas.scroll.isShow) {
      this.canvas.scroll.init();
    }
  }

  addPen(pen: Pen, history?: boolean) {
    return this.canvas.addPen(pen, history);
  }

  addPens(pens: Pen[], history?: boolean) {
    return this.canvas.addPens(pens, history);
  }

  render(now?: number) {
    this.canvas.render(now);
  }

  open(data?: TopologyData) {
    for (const pen of this.store.data.pens) {
      pen.onDestroy && pen.onDestroy(pen);
    }

    clearStore(this.store);
    this.canvas.tooltip.hide();
    this.canvas.activeRect = undefined;
    this.canvas.sizeCPs = undefined;

    if (data) {
      Object.assign(this.store.data, data);
      this.store.data.pens = [];
      // 第一遍赋初值
      for (const pen of data.pens) {
        if (!pen.id) {
          pen.id = s8();
        }
        !pen.calculative && (pen.calculative = { canvas: this.canvas });
        this.store.pens[pen.id] = pen;
      }
      // 计算区域
      for (const pen of data.pens) {
        this.canvas.dirtyPenRect(pen);
      }
      for (const pen of data.pens) {
        this.canvas.makePen(pen);
      }
    }
    this.canvas.render(Infinity);
    this.listenSocket();
    this.connectSocket();
    this.startAnimate();
    this.doInitJS();
    this.store.emitter.emit('opened');

    if (this.canvas.scroll && this.canvas.scroll.isShow) {
      this.canvas.scroll.init();
    }
  }

  connectSocket() {
    this.connectWebsocket();
    this.connectMqtt();
  }

  private doInitJS() {
    if (this.store.data.initJs && this.store.data.initJs.trim()) {
      // 字符串类型存在
      const fn = new Function(this.store.data.initJs);
      fn();
    }
  }

  drawLine(lineName?: string) {
    this.canvas.drawingLineName = lineName;
  }

  drawingPencil() {
    this.canvas.pencil = true;
    this.canvas.externalElements.style.cursor = 'crosshair';
  }

  // end  - 当前鼠标位置，是否作为终点
  finishDrawLine(end?: boolean) {
    this.canvas.finishDrawline(end);
  }

  finishPencil() {
    this.canvas.finishPencil();
  }

  updateLineType(pen: Pen, lineName: string) {
    if (!pen || pen.name != 'line' || !lineName || !this.canvas[lineName]) {
      return;
    }

    pen.lineName = lineName;
    const from: any = pen.calculative.worldAnchors[0];
    const to: any = pen.calculative.worldAnchors[pen.calculative.worldAnchors.length - 1];
    from.prev = undefined;
    from.next = undefined;
    to.prev = undefined;
    to.next = undefined;
    pen.calculative.worldAnchors = [from, to];
    pen.calculative.activeAnchor = from;
    this.canvas[lineName](this.store, pen, to);
    if (pen.lineName === 'curve') {
      from.prev = {
        penId: from.penId,
        x: from.x - 50,
        y: from.y,
      };
      from.next = {
        penId: from.penId,
        x: from.x + 50,
        y: from.y,
      };
      to.prev = {
        penId: to.penId,
        x: to.x - 50,
        y: to.y,
      };
      to.next = {
        penId: to.penId,
        x: to.x + 50,
        y: to.y,
      };
    }
    pen.calculative.activeAnchor = undefined;
    this.canvas.initLineRect(pen);
    this.render(Infinity);
  }

  addDrawLineFn(fnName: string, fn: Function) {
    this.canvas[fnName] = fn;
    this.canvas.drawLineFns.push(fnName);
  }

  removeDrawLineFn(fnName: string) {
    const index = this.canvas.drawLineFns.indexOf(fnName);
    if (index > -1) {
      this.canvas.drawLineFns.splice(index, 1);
    }
  }

  showMagnifier() {
    this.canvas.showMagnifier();
  }

  hideMagnifier() {
    this.canvas.hideMagnifier();
  }

  toggleMagnifier() {
    this.canvas.toggleMagnifier();
  }

  clear() {
    clearStore(this.store);
    this.canvas.clearCanvas();
    this.canvas.render();
  }

  emit(eventType: EventType, data: any) {
    this.store.emitter.emit(eventType, data);
  }

  on(eventType: EventType, handler: Handler) {
    this.store.emitter.on(eventType, handler);
    return this;
  }

  off(eventType: EventType, handler: Handler) {
    this.store.emitter.off(eventType, handler);
    return this;
  }

  register(path2dFns: { [key: string]: (pen: any) => void }) {
    register(path2dFns);
  }

  registerCanvasDraw(drawFns: { [key: string]: (ctx: any, pen: any) => void }) {
    registerCanvasDraw(drawFns);
  }

  registerAnchors(path2dFns: { [key: string]: (pen: any) => void }) {
    registerAnchors(path2dFns);
  }

  // customeDock = (store, rect) => {xDock, yDock}
  // customDock return:
  // {
  //   xDock: {x, y, step, prev},
  //   yDock: {x, y, step, prev},
  // }
  // xDock，yDock - 水平或垂直方向的参考线
  // prev - 参考线的起点
  // x,y - 参考线的终点
  // step - 自动吸附需要的偏移量
  registerDock(customeDock?: Function) {
    this.canvas.customeDock = customeDock;
  }

  find(idOrTag: string) {
    return this.store.data.pens.filter((pen) => {
      return pen.id == idOrTag || (pen.tags && pen.tags.indexOf(idOrTag) > -1);
    });
  }

  getPenRect(pen: Pen) {
    return this.canvas.getPenRect(pen);
  }

  setPenRect(pen: Pen, rect: Rect, render = true) {
    this.setPenRect(pen, rect, render);
  }

  startAnimate(idOrTagOrPens?: string | Pen[]) {
    let pens: Pen[];
    if (!idOrTagOrPens) {
      pens = this.store.data.pens.filter((pen) => {
        return (pen.type || pen.frames) && pen.autoPlay;
      });
    } else if (typeof idOrTagOrPens === 'string') {
      pens = this.find(idOrTagOrPens);
    } else {
      pens = idOrTagOrPens;
    }
    pens.forEach((pen) => {
      if (pen.calculative.pause) {
        const d = Date.now() - pen.calculative.pause;
        pen.calculative.pause = undefined;
        pen.calculative.frameStart += d;
        pen.calculative.frameEnd += d;
      } else {
        this.store.animates.add(pen);
      }
    });
    this.canvas.animate();
  }

  pauseAnimate(idOrTagOrPens?: string | Pen[]) {
    let pens: Pen[] = [];
    if (!idOrTagOrPens) {
      this.store.animates.forEach((pen) => {
        pens.push(pen);
      });
    } else if (typeof idOrTagOrPens === 'string') {
      pens = this.find(idOrTagOrPens);
    } else {
      pens = idOrTagOrPens;
    }
    pens.forEach((pen) => {
      if (!pen.calculative.pause) {
        pen.calculative.pause = Date.now();
      }
    });
  }

  stopAnimate(idOrTagOrPens?: string | Pen[]) {
    let pens: Pen[] = [];
    if (!idOrTagOrPens) {
      this.store.animates.forEach((pen) => {
        pens.push(pen);
      });
    } else if (typeof idOrTagOrPens === 'string') {
      pens = this.find(idOrTagOrPens);
    } else {
      pens = idOrTagOrPens;
    }
    pens.forEach((pen) => {
      pen.calculative.pause = undefined;
      pen.calculative.start = undefined;
      this.store.animates.delete(pen);
      this.canvas.restoreNodeAnimate(pen);
    });
    this.canvas.calcActiveRect();
    this.render(Infinity);
  }

  calcAnimateDuration(pen: Pen) {
    pen.calculative.duration = 0;
    for (const f of pen.frames) {
      pen.calculative.duration += f.duration;
    }
  }

  combine(pens?: Pen[]) {
    if (!pens) {
      pens = this.store.active;
    }
    if (!pens || !pens.length) {
      return;
    }

    if (pens.length === 1 && pens[0].type) {
      pens[0].type = PenType.Node;
      this.canvas.active(pens);
      this.render();
      return;
    }

    const rect = getRect(pens);
    const id = s8();
    let parent: Pen = {
      id,
      name: 'combine',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      children: [],
    };
    const p = pens.find((pen) => {
      return pen.width === rect.width && pen.height === rect.height;
    });
    if (p) {
      if (!p.children) {
        p.children = [];
      }
      parent = p;
    } else {
      this.canvas.makePen(parent);
    }

    pens.forEach((pen) => {
      if (pen === parent || pen.parentId === parent.id) {
        return;
      }
      parent.children.push(pen.id);
      pen.parentId = parent.id;
      const childRect = calcRelativeRect(pen.calculative.worldRect, rect);
      pen.x = childRect.x;
      pen.y = childRect.y;
      pen.width = childRect.width;
      pen.height = childRect.height;
      pen.locked = LockState.DisableMove;
      // pen.type = PenType.Node;
    });
    this.canvas.active([parent]);
    this.render();

    this.store.emitter.emit('add', [parent]);
  }

  uncombine(pen?: Pen) {
    if (!pen && this.store.active) {
      pen = this.store.active[0];
    }
    if (!pen || !pen.children) {
      return;
    }

    pen.children.forEach((id) => {
      const child: Pen = this.store.pens[id];
      child.parentId = undefined;
      child.x = child.calculative.worldRect.x;
      child.y = child.calculative.worldRect.y;
      child.width = child.calculative.worldRect.width;
      child.height = child.calculative.worldRect.height;
      child.locked = LockState.None;
      child.calculative.active = undefined;
    });
    pen.children = undefined;
    if (pen.name === 'combine') {
      this.delete([pen]);
    }
    this.inactive();
  }

  active(pens: Pen[], emit = true) {
    this.canvas.active(pens, emit);
  }

  inactive() {
    this.canvas.inactive();
  }

  /**
   * 删除画笔
   * @param pens 需要删除的画笔们
   * @param delLock 是否删除已经锁住的画笔
   */
  delete(pens?: Pen[], delLock = false) {
    this.canvas.delete(pens, undefined, delLock);
  }

  scale(scale: number, center = { x: 0, y: 0 }) {
    this.canvas.scale(scale, center);
  }

  translate(x: number, y: number) {
    this.canvas.translate(x, y);
  }

  translatePens(pens: Pen[], x: number, y: number) {
    this.canvas.translatePens(pens, x, y);
  }

  getParent(pen: Pen, root?: boolean) {
    return getParent(pen, root);
  }

  data() {
    const data = deepClone(this.store.data);
    data.version = pkg.version;
    return data;
  }

  copy(pens?: Pen[]) {
    this.canvas.copy(pens);
  }

  cut(pens?: Pen[]) {
    this.canvas.cut(pens);
  }

  paste() {
    this.canvas.paste();
  }

  undo() {
    this.canvas.undo();
  }

  redo() {
    this.canvas.redo();
  }

  listenSocket() {
    try {
      let socketFn: Function;
      if (this.store.data.socketCbJs) {
        socketFn = new Function('e', this.store.data.socketCbJs);
      }
      if (!socketFn) {
        return false;
      }
      this.socketFn = socketFn;
    } catch (e) {
      console.error('Create the function for socket:', e);
      return false;
    }

    return true;
  }

  connectWebsocket(websocket?: string) {
    this.closeWebsocket();
    if (websocket) {
      this.store.data.websocket = websocket;
    }
    if (this.store.data.websocket) {
      this.websocket = new WebSocket(this.store.data.websocket);
      this.websocket.onmessage = (e) => {
        this.doSocket(e.data);
      };

      this.websocket.onclose = () => {
        console.info('Canvas websocket closed and reconneting...');
        this.connectWebsocket();
      };
    }
  }

  closeWebsocket() {
    if (this.websocket) {
      this.websocket.onclose = undefined;
      this.websocket.close();
      this.websocket = undefined;
    }
  }

  connectMqtt(params?: {
    mqtt: string;
    mqttTopics: string;
    mqttOptions?: {
      clientId?: string;
      username?: string;
      password?: string;
      customClientId?: boolean;
    };
  }) {
    this.closeMqtt();
    if (params) {
      this.store.data.mqtt = params.mqtt;
      this.store.data.mqttTopics = params.mqttTopics;
      this.store.data.mqttOptions = params.mqttOptions;
    }
    if (this.store.data.mqtt) {
      if (this.store.data.mqttOptions.clientId && !this.store.data.mqttOptions.customClientId) {
        this.store.data.mqttOptions.clientId = s8();
      }

      this.mqttClient = mqtt.connect(this.store.data.mqtt, this.store.data.mqttOptions);
      this.mqttClient.on('message', (topic: string, message: any) => {
        this.doSocket(message.toString());
      });

      if (this.store.data.mqttTopics) {
        this.mqttClient.subscribe(this.store.data.mqttTopics.split(','));
      }
    }
  }

  closeMqtt() {
    if (this.mqttClient && this.mqttClient.close) {
      this.mqttClient.close();
    }
  }

  doSocket(message: any) {
    if (this.socketFn) {
      this.socketFn(message);
      return;
    }

    try {
      message = JSON.parse(message);
      if (!Array.isArray(message)) {
        message = [message];
      }
      message.forEach((item: any) => {
        this.setValue(item);
      });
    } catch (error) {
      console.warn('Invalid socket data:', error);
    }
  }

  setValue(data: any) {
    const pens: Pen[] = this.find(data.id || data.tag) || [];
    pens.forEach((pen) => {
      this.updateValue(pen, data);
      pen.onValue && pen.onValue(pen);
      this.store.data.locked && this.doEvent(pen, 'valueUpdate');
    });

    if (!this.store.data.locked && this.store.active.length) {
      this.canvas.calcActiveRect();
    }

    this.render(Infinity);
  }

  updateValue(pen: Pen, data: any) {
    this.canvas.updateValue(pen, data);
  }

  pushHistory(action: EditAction) {
    this.canvas.pushHistory(action);
  }

  showInput(pen: Pen, rect?: Rect) {
    this.canvas.showInput(pen, rect);
  }

  hideInput() {
    this.canvas.hideInput();
  }

  clearDropdownList() {
    this.canvas.clearDropdownList();
  }

  private onEvent = (eventName: string, e: any) => {
    switch (eventName) {
      case 'add':
        {
          e.forEach((pen: Pen) => {
            pen.onAdd && pen.onAdd(pen);
          });
        }
        this.onSizeUpdate();
        break;
      case 'enter':
        e.pen && e.pen.onMouseEnter && e.pen.onMouseEnter(e.pen, this.canvas.mousePos);
        this.store.data.locked && this.doEvent(e, eventName);
        break;
      case 'leave':
        e.pen && e.pen.onMouseLeave && e.pen.onMouseLeave(e.pen, this.canvas.mousePos);
        this.store.data.locked && this.doEvent(e, eventName);
        break;
      case 'active':
      case 'inactive':
        {
          this.store.data.locked &&
            e.forEach((pen: Pen) => {
              this.doEvent(pen, eventName);
            });
        }
        break;
      case 'click':
        e.pen && e.pen.onClick && e.pen.onClick(e.pen, this.canvas.mousePos);
        this.store.data.locked && e.pen && this.doEvent(e.pen, eventName);
        break;
      case 'mousedown':
        e.pen && e.pen.onMouseDown && e.pen.onMouseDown(e.pen, this.canvas.mousePos);
        this.store.data.locked && e.pen && this.doEvent(e.pen, eventName);
        break;
      case 'mouseup':
        e.pen && e.pen.onMouseUp && e.pen.onMouseUp(e.pen, this.canvas.mousePos);
        this.store.data.locked && e.pen && this.doEvent(e.pen, eventName);
        break;
      case 'dblclick':
        this.store.data.locked && e.pen && this.doEvent(e.pen, eventName);
        break;
      case 'valueUpdate':
        e.onValue && e.onValue(e);
        this.store.data.locked && this.doEvent(e, eventName);
        break;
      case 'update':
      case 'delete':
      case 'translatePens':
      case 'rotatePens':
      case 'resizePens':
        this.onSizeUpdate();
        break;
    }
  };

  private doEvent = (pen: Pen, eventName: string) => {
    if (!pen || !pen.events) {
      return;
    }

    pen.events.forEach((event) => {
      if (this.events[event.action] && event.name === eventName) {
        let can = !event.where;
        if (event.where) {
          if (event.where.fn) {
            can = event.where.fn(pen);
          } else if (event.where.fnJs) {
            try {
              event.where.fn = new Function('pen', 'params', event.where.fnJs);
            } catch (err) {
              console.error('Error: make function:', err);
            }
            if (event.where.fn) {
              can = event.where.fn(pen);
            }
          } else {
            switch (event.where.comparison) {
              case '>':
                can = pen[event.where.key] > event.where.value;
                break;
              case '>=':
                can = pen[event.where.key] >= event.where.value;
                break;
              case '<':
                can = pen[event.where.key] < event.where.value;
                break;
              case '<=':
                can = pen[event.where.key] <= event.where.value;
                break;
              case '=':
              case '==':
                can = pen[event.where.key] == event.where.value;
                break;
              case '!=':
                can = pen[event.where.key] != event.where.value;
                break;
            }
          }
        }
        can && this.events[event.action](pen, event);
      }
    });
  };

  pushChildren(parent: Pen, children: Pen[]) {
    if (!parent.children) {
      parent.children = [];
    }
    children.forEach((pen) => {
      if (!pen.calculative) {
        this.canvas.makePen(pen);
      }
      if (pen.parentId) {
        const p = this.store.pens[pen.parentId];
        const i = p.children.findIndex((id) => id === pen.id);
        p.children.splice(i, 1);
      }
      parent.children.push(pen.id);
      pen.parentId = parent.id;
      const childRect = calcRelativeRect(pen.calculative.worldRect, parent.calculative.worldRect);
      pen.x = childRect.x;
      pen.y = childRect.y;
      pen.width = childRect.width;
      pen.height = childRect.height;
      pen.locked = LockState.DisableMove;
      this.store.pens[pen.id] = pen;
    });
  }

  renderPenRaw(ctx: CanvasRenderingContext2D, pen: Pen, rect?: Rect) {
    renderPenRaw(ctx, pen, rect);
  }

  toPng(padding: Padding = 0, callback?: any) {
    return this.canvas.toPng(padding, callback);
  }

  downloadPng(name?: string, padding: Padding = 0) {
    const a = document.createElement('a');
    a.setAttribute('download', name || 'le5le.topology.png');
    a.setAttribute('href', this.toPng(padding));
    const evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    a.dispatchEvent(evt);
  }

  getRect(pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }

    return getRect(pens);
  }

  /**
   * 放大到屏幕尺寸，并居中
   * @param fit true，填满但完整展示；false，填满，但长边可能截取（即显示不完整）
   */
  fitView(fit: boolean = true, viewPadding: Padding = 10) {
    // 默认垂直填充，两边留白
    if (!this.hasView()) return;
    // 1. 重置画布尺寸为容器尺寸
    const { canvas } = this.canvas;
    const { offsetWidth: width, offsetHeight: height } = canvas;
    this.resize(width, height);
    // 2. 获取设置的留白值
    const padding = formatPadding(viewPadding);

    // 3. 获取图形尺寸
    const rect = this.getRect();

    // 4. 计算缩放比例
    const w = (width - padding[1] - padding[3]) / rect.width;
    const h = (height - padding[0] - padding[2]) / rect.height;
    let ratio = w;
    if (fit) {
      // 完整显示取小的
      ratio = w > h ? h : w;
    } else {
      ratio = w > h ? w : h;
    }
    // 该方法直接更改画布的 scale 属性，所以比率应该乘以当前 scale
    this.scale(ratio * this.store.data.scale);

    // 5. 居中
    this.centerView();
  }

  centerView() {
    if (!this.hasView()) return;
    const rect = this.getRect();
    const viewCenter = this.getViewCenter();
    const pensRect: Rect = this.getPenRect(rect);
    calcCenter(pensRect);
    const { center } = pensRect;
    const { scale, origin, x: dataX, y: dataY } = this.store.data;
    // center 的值，在缩放和拖拽画布过程中不发生变化，是相对值
    // viewCenter 是一个绝对值，需要根据 origin 的值，来计算出相对的值
    // store.data.x 是画布偏移值，在 translate 方法中与 scale 相关，这里也需要计算
    this.translate(
      (viewCenter.x - origin.x) / scale - center.x - dataX / scale,
      (viewCenter.y - origin.y) / scale - center.y - dataY / scale
    );
    const { canvas } = this.canvas;
    const x = (canvas.scrollWidth - canvas.offsetWidth) / 2;
    const y = (canvas.scrollHeight - canvas.offsetHeight) / 2;
    canvas.scrollTo(x, y);
  }

  hasView(): boolean {
    return !!this.store.data.pens.length;
  }

  private getViewCenter() {
    const { width, height } = this.canvas;
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  alignNodes(align: string, pens: Pen[] = this.store.data.pens, rect?: Rect) {
    !rect && (rect = this.getPenRect(this.getRect(pens)));
    const initPens = deepClone(pens); // 原 pens ，深拷贝一下
    for (const item of pens) {
      if (item.type === PenType.Line) {
        continue;
      }
      const penRect = this.getPenRect(item);
      switch (align) {
        case 'left':
          penRect.x = rect.x;
          break;
        case 'right':
          penRect.x = rect.x + rect.width - penRect.width;
          break;
        case 'top':
          penRect.y = rect.y;
          break;
        case 'bottom':
          penRect.y = rect.y + rect.height - penRect.height;
          break;
        case 'center':
          penRect.x = rect.x + rect.width / 2 - penRect.width / 2;
          break;
        case 'middle':
          penRect.y = rect.y + rect.height / 2 - penRect.height / 2;
          break;
      }
      this.setValue({ ...item, ...penRect });
    }
    this.canvas.calcActiveRect();
    this.pushHistory({
      type: EditType.Update,
      initPens,
      pens,
    });
  }

  /**
   * 水平或垂直方向的均分
   * @param direction 方向，width 说明水平方向间距相同
   * @param pens 节点们，默认全部的
   * @param distance 总的宽 or 高
   */
  private spaceBetweenByDirection(
    direction: 'width' | 'height',
    pens: Pen[] = this.store.data.pens,
    distance?: number
  ) {
    !distance && (distance = this.getPenRect(this.getRect(pens))[direction]);
    // 过滤出 node 节点 pens
    pens = pens.filter((item) => !item.type && !item.parentId);
    if (pens.length <= 2) {
      return;
    }
    const initPens = deepClone(pens); // 原 pens ，深拷贝一下
    // 计算间距
    const allDistance = pens.reduce((distance: number, currentPen: Pen) => {
      const currentPenRect = this.getPenRect(currentPen);
      return distance + currentPenRect[direction];
    }, 0);
    const space = (distance - allDistance) / (pens.length - 1);

    // 按照大小顺序排列画笔
    pens = pens.sort((a: Pen, b: Pen) => {
      if (direction === 'width') {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    const pen0Rect = this.getPenRect(pens[0]);
    let left = direction === 'width' ? pen0Rect.x : pen0Rect.y;
    for (const item of pens) {
      const penRect = this.getPenRect(item);
      direction === 'width' ? (penRect.x = left) : (penRect.y = left);
      left += penRect[direction] + space;
      this.setValue({ ...item, ...penRect });
    }
    this.pushHistory({
      type: EditType.Update,
      initPens,
      pens,
    });
  }

  spaceBetween(pens?: Pen[], width?: number) {
    this.spaceBetweenByDirection('width', pens, width);
  }

  spaceBetweenColumn(pens?: Pen[], height?: number) {
    this.spaceBetweenByDirection('height', pens, height);
  }

  layout(pens: Pen[] = this.store.data.pens, width?: number, space: number = 30) {
    const rect = this.getPenRect(getRect(pens));
    !width && (width = rect.width);

    // 1. 拿到全部节点中最大的高
    pens = pens.filter((item) => !item.type && !item.parentId);
    const initPens = deepClone(pens); // 原 pens ，深拷贝一下
    let maxHeight = 0;

    pens.forEach((pen: Pen) => {
      const penRect = this.getPenRect(pen);
      penRect.height > maxHeight && (maxHeight = penRect.height);
    });

    // 2. 遍历节点调整位置
    let currentX = rect.x;
    let currentY = rect.y;
    pens.forEach((pen: Pen, index: number) => {
      const penRect = this.getPenRect(pen);
      penRect.x = currentX;
      penRect.y = currentY + maxHeight / 2 - penRect.height / 2;

      this.setValue({ ...pen, ...penRect });

      if (index === pens.length - 1) {
        return;
      }
      const currentWidth = currentX + penRect.width - rect.x;
      const nextPenRect = this.getPenRect(pens[index + 1]);
      if (Math.round(width - currentWidth) >= Math.round(nextPenRect.width + space))
        // 当前行
        currentX += penRect.width + space;
      else {
        // 换行
        currentX = rect.x;
        currentY += maxHeight + space;
      }
    });
    this.pushHistory({
      type: EditType.Update,
      initPens,
      pens,
    });
  }

  gotoView(pen: Pen) {
    const center = this.getViewCenter();
    const x = center.x - pen.calculative.worldRect.x - pen.calculative.worldRect.width / 2;
    const y = center.y - pen.calculative.worldRect.y - pen.calculative.worldRect.height / 2;

    if (this.canvas.scroll && this.canvas.scroll.isShow) {
      this.canvas.scroll.translate(x - this.store.data.x, y - this.store.data.y);
    }

    this.store.data.x = x;
    this.store.data.y = y;

    this.canvas.render(Infinity);
  }

  showMap() {
    if (!this.map) {
      this.map = new Map(this.canvas);
    }
    this.map.show();
  }

  hideMap() {
    this.map.hide();
  }

  onSizeUpdate() {
    if (this.mapTimer) {
      clearTimeout(this.mapTimer);
      this.mapTimer = undefined;
    }

    this.mapTimer = setTimeout(() => {
      if (this.map && this.map.isShow) {
        this.map.show();
      }
      if (this.canvas.scroll && this.canvas.scroll.isShow) {
        this.canvas.scroll.resize();
      }
    }, 500);
  }

  toggleAnchorMode() {
    this.canvas.toggleAnchorMode();
  }

  addAnchorHand() {
    this.canvas.addAnchorHand();
  }

  removeAnchorHand() {
    this.canvas.removeAnchorHand();
  }

  toggleAnchorHand() {
    this.canvas.toggleAnchorHand();
  }

  /**
   * 将该画笔置顶，即放到数组最后，最后绘制即在顶部
   * @param pen pen 置顶的画笔
   * @param pens 画笔们
   */
  top(pen: Pen, pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }
    const index = pens.findIndex((p: Pen) => p.id === pen.id);
    if (index > -1) {
      pens.push(pens[index]);
      pens.splice(index, 1);
    }
  }

  /**
   * 该画笔置底，即放到数组最前，最后绘制即在底部
   */
  bottom(pen: Pen, pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }
    const index = pens.findIndex((p: Pen) => p.id === pen.id);
    if (index > -1) {
      pens.unshift(pens[index]);
      pens.splice(index + 1, 1);
    }
  }

  up(pen: Pen, pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }
    const index = pens.findIndex((p: Pen) => p.id === pen.id);

    if (index > -1 && index !== pens.length - 1) {
      pens.splice(index + 2, 0, pens[index]);
      pens.splice(index, 1);
    }
  }

  down(pen: Pen, pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }
    const index = pens.findIndex((p: Pen) => p.id === pen.id);
    if (index > -1 && index !== 0) {
      pens.splice(index - 1, 0, pens[index]);
      pens.splice(index + 1, 1);
    }
  }

  setLayer(pen: Pen, toIndex: number, pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }
    const index = pens.findIndex((p: Pen) => p.id === pen.id);
    if (index > -1) {
      if (index > toIndex) {
        // 原位置在后，新位置在前
        pens.splice(toIndex, 0, pens[index]);
        pens.splice(index + 1, 1);
      } else if (index < toIndex) {
        // 新位置在后
        pens.splice(toIndex, 0, pens[index]);
        pens.splice(index, 1);
      }
    }
  }

  changePenId(oldId: string, newId: string): boolean {
    if (oldId === newId) return false;
    const pens = this.find(oldId);
    if (pens.length === 1) {
      // 找到画笔，且唯一
      if (!this.find(newId).length) {
        // 若新画笔不存在
        pens[0].id = newId;
        // 更换 store.pens 上的内容
        this.store.pens[newId] = this.store.pens[oldId];
        delete this.store.pens[oldId];
        return true;
      }
    }
  }

  /**
   * 得到与当前节点连接的线
   * @param node 节点，非连线
   * @param type 类型，全部的连接线/入线/出线
   */
  getLines(node: Pen, type: 'all' | 'in' | 'out' = 'all'): Pen[] {
    if (node.type) {
      return [];
    }
    const lines: Pen[] = [];
    !node.connectedLines && (node.connectedLines = []);

    node.connectedLines.forEach((line) => {
      const linePen: Pen[] = this.find(line.lineId);
      if (linePen.length === 1) {
        switch (type) {
          case 'all':
            lines.push(linePen[0]);
            break;
          case 'in':
            // 进入该节点的线，即 线锚点的最后一个 connectTo 对应该节点
            linePen[0].anchors[linePen[0].anchors.length - 1].connectTo === node.id && lines.push(linePen[0]);
            break;
          case 'out':
            // 从该节点出去的线，即 线锚点的第一个 connectTo 对应该节点
            linePen[0].anchors[0].connectTo === node.id && lines.push(linePen[0]);
            break;
        }
      }
    });

    return lines;
  }

  /**
   * 得到当前节点的下一个节点，即出口节点数组
   * 得到当前连线的出口节点
   * @param pen 节点或连线
   */
  nextNode(pen: Pen): Pen[] {
    if (pen.type) {
      // 连线
      const nextNodeId = pen.anchors[pen.anchors.length - 1].connectTo;
      return this.find(nextNodeId);
    } else {
      // 节点
      // 1. 得到所有的出线
      const lines = this.getLines(pen, 'out');
      const nextNodes = [];
      // 2. 遍历出线的 nextNode
      lines.forEach((line) => {
        const lineNextNode = this.nextNode(line);
        for (const node of lineNextNode) {
          const have = nextNodes.find((next) => next.id === node.id);
          // 3. 不重复的才加进去
          !have && nextNodes.push(node);
        }
      });
      return nextNodes;
    }
  }

  /**
   * 得到当前节点的上一个节点，即入口节点数组
   * 得到当前连线的入口节点
   * @param pen 节点或连线
   */
  previousNode(pen: Pen): Pen[] {
    if (pen.type) {
      // 连线
      const preNodeId = pen.anchors[0].connectTo;
      return this.find(preNodeId);
    } else {
      // 节点
      // 1. 得到所有的入线
      const lines = this.getLines(pen, 'in');
      const preNodes: Pen[] = [];
      // 2. 遍历入线的 preNode
      lines.forEach((line) => {
        const linePreNode = this.previousNode(line);
        for (const node of linePreNode) {
          const have = preNodes.find((pre) => pre.id === node.id);
          // 3. 不重复的才加进去
          !have && preNodes.push(node);
        }
      });
      return preNodes;
    }
  }

  toComponent(pens?: Pen[]) {
    if (!pens) {
      pens = this.store.data.pens;
    }

    if (pens.length === 1) {
      pens[0].type = PenType.Node;
      return deepClone(pens);
    }

    const rect = getRect(pens);
    const id = s8();
    let parent: Pen = {
      id,
      name: 'combine',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      children: [],
    };
    const p = pens.find((pen) => {
      return pen.width === rect.width && pen.height === rect.height;
    });
    if (p) {
      if (!p.children) {
        p.children = [];
      }
      parent = p;
    } else {
      this.canvas.makePen(parent);
    }

    pens.forEach((pen) => {
      if (pen === parent || pen.parentId === parent.id) {
        return;
      }
      if (pen.parentId) {
        // 已经是其它节点的子节点，x,y,w,h 已经是百分比了
        return;
      }
      parent.children.push(pen.id);
      pen.parentId = parent.id;
      const childRect = calcRelativeRect(pen.calculative.worldRect, rect);
      pen.x = childRect.x;
      pen.y = childRect.y;
      pen.width = childRect.width;
      pen.height = childRect.height;
      pen.locked = LockState.DisableMove;
      // pen.type = PenType.Node;
    });

    return deepClone(pens);
  }

  destroy(global?: boolean) {
    for (const pen of this.store.data.pens) {
      pen.onDestroy && pen.onDestroy(pen);
    }
    clearStore(this.store);
    this.canvas.destroy();
    // Clear data.
    globalStore[this.store.id] = undefined;
    this.canvas = undefined;

    if (global) {
      globalStore.htmlElements = {};
    }
  }
}
