module ml {
    /**
     * Model Storage class
     * author @wellflat
     */
    export class ModelStorage {
        
        constructor(private name: string, private version: number) {
            var idb: IDBFactory = indexedDB;
            var dbr: IDBOpenDBRequest = idb.open(name, version);
            dbr.onupgradeneeded = this.upgrade;
        }

        private upgrade(e: any): void {
            var db: IDBDatabase = e.target.result;
            var store: IDBObjectStore = db.createObjectStore("model", { keyPath: "timestamp" });
            store.createIndex("name", "name", { unique: true });
        }

        public load(callback: (data: Object) => void): void {
            var dbr: IDBOpenDBRequest = indexedDB.open(this.name, this.version);
            dbr.onsuccess = (e: any) => {
                var db: IDBDatabase = dbr.result;
                var trans: IDBTransaction = db.transaction("model", "readonly");
                var store: IDBObjectStore = trans.objectStore("model");
                var tmp: Object = null;
                store.openCursor().onsuccess = (e: any) => {
                    var cursor: IDBCursorWithValue = e.target.result;
                    if(cursor) {
                        //console.log(cursor.key, cursor.value);
                        tmp = cursor.value;
                        cursor.continue();
                    } else {
                        callback(tmp);
                    }
                };
            };
        }

        public add(model: Model, callback: () => void): void {
            model.updateTimestamp();
            var dbr: IDBOpenDBRequest = indexedDB.open(this.name, this.version);
            dbr.onsuccess = () => {
                var db: IDBDatabase = dbr.result;
                var trans: IDBTransaction = db.transaction("model", "readwrite");
                var store: IDBObjectStore = trans.objectStore("model");
                var req: IDBRequest = store.add(model);
                req.onsuccess = () => {
                    console.log("add#onsuccess");
                    callback();
                };
                req.onerror = () => {
                    console.log("add#onerror");
                    callback();
                };
            };
        }

        public delete(callback: () => void): void {
            var dbr: IDBOpenDBRequest = indexedDB.open(this.name, this.version);
            dbr.onsuccess = () => {
                var db: IDBDatabase = dbr.result;
                var trans: IDBTransaction = db.transaction("model", "readwrite");
                var store: IDBObjectStore = trans.objectStore("model");
                var req: IDBRequest = store.clear();
                req.onsuccess = () => {
                    console.log("delete#onsuccess");
                    callback();
                };
                req.onerror = () => {
                    console.log("delete#onerror");
                    callback();
                };
            };
        }
    }
} 