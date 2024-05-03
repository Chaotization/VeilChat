import { MongoClient } from "mongodb";
import { mongoConfig } from "./settings.js";


let _connection = undefined;
let _db = undefined;

export async function dbConnection() {
    if (!_connection) {
        //mongoConfig.serverUrl
        _connection = await MongoClient.connect(mongoConfig.serverUrl);
        _db = await _connection.db(mongoConfig.database);
    }

    return _db;
}
export function closeConnection() {
    _connection.close();
}