import {createUser} from "./data/users.js";

const user1 = await createUser("Mike", "River", "mike.river12@example.com", ["chinese"], "+19293335817", "Abc12345678!", "C:\\Users\\jinxi\\git_repos\\CS554-VeilChat\\data-server\\public\\images.jpg");
console.log(user1);