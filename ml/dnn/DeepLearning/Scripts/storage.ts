module rt {
    /**
     * Model Storage class
     */
    export class ModelStorage {
        //declare var window.indexedDB, window.webkitIndexedDB, window.mozIndexedDB;

        constructor(private name: string, private version: number) {
            var idb: IDBFactory = indexedDB;
            var dbr: IDBOpenDBRequest = idb.open(name, version);
            dbr.onupgradeneeded = this.upgrade;
            console.log(dbr);
        }

        public upgrade(e: any): void {
            var db: IDBDatabase = e.target.result;
            var store: IDBObjectStore = db.createObjectStore("model", { keyPath: "timestamp" });
            console.log(store);
            store.createIndex("name", "name", { unique: true });
        }

        public search(e: any): void {
            var db: IDBDatabase = e.target.result;
            var trans: IDBTransaction = db.transaction("model", "readwrite");
            var store: IDBObjectStore = trans.objectStore("model");
        }

        public add(da: DenoisingAutoencoders): void {
            var dbr: IDBOpenDBRequest = indexedDB.open(this.name, this.version);
            dbr.onsuccess = () => {
                console.log("add#onsuccess");
                var db: IDBDatabase = dbr.result;
                var trans: IDBTransaction = db.transaction("model", "readwrite");
                var store: IDBObjectStore = trans.objectStore("model");
                store.add(da);
            };
        }

        public delete(): void {
            var dbr: IDBOpenDBRequest = indexedDB.open(this.name, this.version);
            dbr.onsuccess = () => {
                console.log("delete#onsuccess");
                var ret = indexedDB.deleteDatabase(this.name);
                console.log(ret);
            };
        }
    }
} 