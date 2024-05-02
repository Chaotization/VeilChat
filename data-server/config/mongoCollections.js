import { dbConnection as _dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
	let _col = undefined;

	return async () => {
		if (!_col) {
			const db = await _dbConnection();
			_col = await db.collection(collection);
		}

		return _col;
	};
};

export const users = getCollectionFn('users');
export const messages = getCollectionFn('messages');

export {users, messages}