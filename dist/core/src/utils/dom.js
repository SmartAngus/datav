import { Store } from 'le5le-store';
export function createDiv(node) {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.outline = 'none';
    div.style.left = '-9999px';
    div.style.bottom = '-9999px';
    div.style.width = node.rect.width + 'px';
    div.style.height = node.rect.height + 'px';
    if (node.elementId) {
        div.id = node.elementId;
    }
    return div;
}
export function createInput(node) {
    var input = document.createElement('input');
    input.style.position = 'absolute';
    input.style.outline = 'none';
    input.style.left = '-9999px';
    input.style.bottom = '-9999px';
    input.style.width = node.rect.width + 'px';
    input.style.height = node.rect.height + 'px';
    input.style.border = '1px solid #cdcdcd';
    input.classList.add('set-text-input');
    if (node.elementId) {
        input.id = node.elementId;
    }
    return input;
}
export function loadJS(url, callback, render) {
    var loaderScript = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.src = url;
    loaderScript.addEventListener('load', function () {
        if (callback) {
            callback();
        }
        // how to do
        if (render) {
            Store.set('LT:render', true);
        }
    });
    document.body.appendChild(loaderScript);
}
//# sourceMappingURL=dom.js.map