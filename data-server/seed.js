import {createUser, getUserInfoByUserId, updateFriendStatus, loginUser, logoutUser} from "./data/users.js";
//
// const user1 = await createUser("Mike", "River", "mike.river12@example.com", ["chinese"], "male", "10/18/2000", "+19293335817", "Abc12345678!", "C:\\Users\\jinxi\\git_repos\\CS554-VeilChat\\data-server\\public\\images.jpg");
// const user2 = await createUser("John", "Doe", "john.doe1@example.com", ["english"], "male", "05/20/1998", "+123456789", "Passw0rd!", "");
// const user3 = await createUser("Alice", "Smith", "alice.smith2@example.com", ["spanish"], "female", "01/29/1988","+19876543210", "P@ssword123", "")
// const user4 = await createUser("Emma", "Johnson", "emma.johnson3@example.com", ["french"], "female", "04/03/1996","+17654328901", "Passw0rd!", "")
// const user5 = await createUser("Michael", "Brown", "michael.brown4@example.com", ["chinese"], "male", "02/25/2006", "+16543218790", "Abc123456!", "")
// const user6 = await createUser("Sophia", "Martinez", "sophia.martinez5@example.com", ["english"], "female", "12/23/1994", "+15432109876", "P@ssw0rd", "")
// const user7 = await createUser("Daniel", "Garcia", "daniel.garcia6@example.com", ["spanish"], "female", "06/13/1988", "+18907654321", "Abc12345678!", "")
// const user8 = await createUser("Olivia", "Lopez", "olivia.lopez7@example.com", ["french"], "male", "07/19/1998", "+12345678901", "P@ssword123", "")
// const user9 = await createUser("Ethan", "Rodriguez", "ethan.rodriguez8@example.com", ["chinese"], "male", "11/13/2000", "+19876543210", "Passw0rd!", "")
// const user10 = await createUser("Ava", "Perez", "ava.perez9@example.com", ["english"], "female", "01/11/2011", "+17654328901", "Abc123456!", "")


// const updatefriend1 = await updateFriendStatus("663471f8a58f64d05f17795e", "663471faa58f64d05f17795f", "send");
// const updatefriend2 = await updateFriendStatus("663471faa58f64d05f17795f", "663471f8a58f64d05f17795e", "accept");
//
// const updatefriend3 = await updateFriendStatus("663471f8a58f64d05f17795e", "663471fba58f64d05f177960", "send");
// const updatefriend4 = await updateFriendStatus("663471fba58f64d05f177960", "663471f8a58f64d05f17795e", "reject");
//
// const updatefriend5 = await updateFriendStatus("663471f8a58f64d05f17795e", "663471faa58f64d05f17795f", "delete");


const login1=await loginUser("mike.river12@example.com", "Abc12345678!");
const login2=await loginUser("john.doe1@example.com", "Passw0rd!");
const logout1= await logoutUser( '663471f8a58f64d05f17795e' );