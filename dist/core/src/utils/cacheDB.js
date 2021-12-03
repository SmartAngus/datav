export function createCacheTable() {
    var request = indexedDB.open('topology-caches'); // 默认版本 1
    request.onupgradeneeded = function (e) {
        // 建表
        var db = e.target.result;
        if (db.objectStoreNames.contains('caches')) {
            db.deleteObjectStore('caches');
        }
        db.createObjectStore('caches', {
            keyPath: 'dbIndex',
        });
    };
    request.onsuccess = function (event) {
        var db = request.result;
        if (!db.objectStoreNames.contains('caches')) {
            return;
        }
        var get = db.transaction(['caches'], 'readwrite').objectStore('caches');
        get.clear(); // 创建表格同时清空
    };
    request.onerror = function (e) {
        console.warn('数据库打开失败' + e);
    };
}
export function spliceCache(index) {
    var request = indexedDB.open('topology-caches'); // 默认版本 1
    request.onsuccess = function (event) {
        var db = request.result;
        if (!db.objectStoreNames.contains('caches')) {
            return;
        }
        var get = db.transaction(['caches'], 'readwrite').objectStore('caches');
        get.delete(IDBKeyRange.lowerBound(index));
    };
    request.onupgradeneeded = function (e) {
        // 建表
        var db = e.target.result;
        if (db.objectStoreNames.contains('caches')) {
            db.deleteObjectStore('caches');
        }
        db.createObjectStore('caches', {
            keyPath: 'dbIndex',
        });
    };
}
export function pushCache(data, index, length) {
    var request = indexedDB.open('topology-caches'); // 默认版本 1
    request.onsuccess = function (event) {
        var db = request.result;
        if (!db.objectStoreNames.contains('caches')) {
            return;
        }
        var push = db.transaction(['caches'], 'readwrite').objectStore('caches');
        data.dbIndex = index;
        push.add(data);
        var result = push.count();
        result.onsuccess = function () {
            if (result.result > length) {
                // 把最前面的一个扔出去
                push.delete(index - length);
            }
        };
    };
    request.onupgradeneeded = function (e) {
        // 建表
        var db = e.target.result;
        if (db.objectStoreNames.contains('caches')) {
            db.deleteObjectStore('caches');
        }
        db.createObjectStore('caches', {
            keyPath: 'dbIndex',
        });
    };
}
export function getCache(index) {
    return new Promise(function (resolve, reject) {
        var request = indexedDB.open('topology-caches'); // 默认版本 1
        request.onsuccess = function (event) {
            var db = request.result;
            if (!db.objectStoreNames.contains('caches')) {
                resolve(null);
                return;
            }
            var objectStore = db.transaction(['caches']).objectStore('caches');
            var get = objectStore.get(index);
            get.onsuccess = function () {
                // undefined 也传出去
                resolve(get.result);
            };
        };
        request.onupgradeneeded = function (e) {
            // 建表
            var db = e.target.result;
            if (db.objectStoreNames.contains('caches')) {
                db.deleteObjectStore('caches');
            }
            db.createObjectStore('caches', {
                keyPath: 'dbIndex',
            });
        };
    });
}
//# sourceMappingURL=cacheDB.js.map