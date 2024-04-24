import {createUser} from "./data/users.js";

const user1 = await createUser("Mike", "River", "mike.river12344@example.com", ["chinese"], "+19293335817", "Abc12345678!", "");
console.log(user1);