var Socket = /** @class */ (function () {
    function Socket(url, cb) {
        this.url = url;
        this.cb = cb;
        this.fns = {};
        this.init();
    }
    Socket.prototype.init = function () {
        var _this = this;
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = this.cb;
        this.socket.onclose = function () {
            console.info('Canvas websocket closed and reconneting...');
            _this.init();
        };
    };
    Socket.prototype.close = function () {
        this.socket.onclose = undefined;
        this.socket.close();
    };
    return Socket;
}());
export { Socket };
//# sourceMappingURL=socket.js.map