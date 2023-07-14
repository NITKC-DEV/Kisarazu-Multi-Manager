export function find(dbName: any, collectionName: any, filter: any): Promise<WithId<Document>[]>;
export function includes(dbName: any, collectionName: any, filter: any): Promise<boolean>;
export function update(dbName: any, collectionName: any, filter: any, update: any): Promise<void>;
export function insert(dbName: any, collectionName: any, object: any): Promise<void>;
export function updateOrInsert(dbName: any, collectionName: any, filter: any, object: any): Promise<void>;
declare function _delete(dbName: any, collectionName: any, filter: any): Promise<void>;
export { _delete as delete };
export function open(): Promise<void>;
export function close(): Promise<void>;
