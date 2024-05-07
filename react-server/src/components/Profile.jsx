import { useState, useEffect } from "react"
import { getAuth } from 'firebase/auth';
import ReactModal from "react-modal";
import Resizer from 'react-image-file-resizer';
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
function Profile(){
const auth =getAuth();
const currentUser=auth.currentUser;
const [data, setData] = useState("");
const [openModal,setOpenModal]=useState(false);
const [loading, setLoading]=useState(false);
const[error, setError]=useState(null);
 const navigate=useNavigate();

  const [languages, setLanguages]=useState("");
  const [uploadError, setUploadError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const langs= [
    "English",
    "Arabic",
    "Bengali",
    "Chinese",
    "French",
    "German",
    "Hindi",
    "Indonesian",
    "Japanese",
    "Marathi",
    "Nigerian Pidgin",
    "Portuguese",
    "Russian",
    "Spanish",
    "Tamil",
    "Telugu",
    "Turkish",
    "Urdu",
    "Vietnamese"
  ];
  const [availableLanguages, setAvailableLanguages]=useState(langs)
  const [errors, setErrors] = useState([]);
  const[profilePictureLocation, setProfilePictureLocation]=useState(null);
    const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_ID,
        },
    });

useEffect(() => {
    const fetchData = async () => {
        setLoading(true)
      try {
        let response = await fetch("http://localhost:4000/user/userinfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email }),
        });

        if (!response.ok) {

          throw new Error(`Request failed`);

        }
        const jsonData = await response.json();
        setData(jsonData);
        setLanguages(jsonData.languages)
      } catch (error) {

       setError(error);
       setLoading('false')
       alert('There was some problem processing your data')
       navigate('/home')
       return
      }
      setLoading(false);
    };

    if(currentUser)
    {fetchData();}
    else {
        navigate('/signin');
        return
      }
  },[]);

  console.log(currentUser)
  if(loading)
  {
    return <div> Fetching the data from server</div>
  }
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log(file);
        Resizer.imageFileResizer(
            file,
            300,
            300,
            'JPEG',
            90,
            0,
            (resizedImage) => {
                if (resizedImage.size / 1024 / 1024 > 5) {
                    alert('Image size should be less than 5MB.');
                    return;
                }

                setImageFile(resizedImage);
            },
            'blob'
        );
    };
  const handleLanguages=(e)=>
  {

    if(!languages.includes(e.target.value))
    {
      if(languages.length>2)
      {
        alert("You already selected 3 languages...")
      }
      else
      {
    setLanguages([...languages,e.target.value])
      }
    }
  }
  const handleLanguageRemove = (languageToRemove) => {
    if(languages.length<2)
    {
        alert("You need to choose atleast one language");
    }
    else{
    setLanguages(languages.filter((lang) => lang !== languageToRemove));}
  };
    const uploadToS3 = async () => {
        try {
            const randomString =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            const currentFileName = `usersProfileFolder/${randomString}.jpeg`;

            const params = {
                Bucket: "veilchat-s3",
                Key: currentFileName,
                Body: imageFile,
                ContentType: 'image/jpeg',
                ACL: "public-read",
            };

            console.log("Uploading with parameters:", params);

            const command = new PutObjectCommand(params);
            await s3Client.send(command);

            const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
            console.log("Image uploaded successfully:", fileUrl);

            return fileUrl;
        } catch (error) {
            console.error("S3 Upload Error:", error);
        }
    };


    async function handleEditForm(e){
        e.preventDefault();
        setErrors([]);

        const regex = /^[A-Za-zÀ-ÿ ]+$/;
        let fname=document.getElementById('first_name').value;
        let lname=document.getElementById('last_name').value;
        let dob=document.getElementById("dob").value;
        let phoneNumber=document.getElementById('phoneNumber').value;
        let gender=document.getElementById('gender').value;
        let updatedUser={_id:data.userId}
        updatedUser['email']=data.email;
    if(fname.trim())
    {
        if(!regex.test(fname.trim()))
        {
           setErrors((prevState) => {
            return [...prevState, "Invalid First name"]
          });
        }
        else{
        updatedUser['firstName']=fname.trim();}
    }
    if(lname.trim())
    {
        if(!regex.test(lname.trim()))
        {
            setErrors((prevState) => {
                return [...prevState, "Invalid Last name"]
              });
        }
        else  updatedUser['lastName']=lname.trim();
    }
    if(dob)
    {
        dob=new Date(dob);

    let yearOfBirth=parseInt(dob.getFullYear());
    const day = String(dob.getDate()).padStart(2, '0');
    const year=yearOfBirth.toString();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    let today=new Date();
    let age=parseInt(today.getFullYear())-yearOfBirth;
    if(age<18){

      setErrors((prevState) => {
        return [...prevState, "You must be 18 years old to continue..."]
      });
    }
    else
    {
        updatedUser['dob']=`${month}/${day}/${year}`;
    }

    }
    if(phoneNumber.trim())
    {
        updatedUser['phoneNumber']="+1"+phoneNumber;
    }
    if(gender!=='select')
    {
        updatedUser['gender']=gender;
    }
    if(languages)
    {
        updatedUser['languages']=languages;
    }
    if(!errors || errors.length===0)
    {
        try

        {
            let profilePictureUrl = ""
            if (imageFile) {
                profilePictureUrl = await uploadToS3();

            }
            if(profilePictureUrl){
                updatedUser['profilePictureLocation']=profilePictureUrl;
            }


            let response=await fetch("http://localhost:4000/user/updateuser",{
          method:"POST",
          headers: { 'Content-Type': 'application/json' },
          body:JSON.stringify(updatedUser)
      });

      let data=await response.json()

      console.log("data:",data)
      if (!response.ok) {
          if (data && data.message) {
              setErrors((prevState) => {
                  return [...prevState, data.message+" Refresh this page and try again"];
                });
              return
            } else {
              setErrors((prevState) => {
                  return [...prevState, "An error occurred while updating"];
                });
              return
            }
          }
        else{
          setErrors([]);
          console.log("success",data);
          setData(data);
          alert("Sucessfully updated your profile");
        setOpenModal(false);}
      }
  catch(e)
  {
      setErrors((prevState) => {
          return [...prevState, e+" Refresh and try again..."];
        });
      return
  }
    }

  }

  if(data && data.firstName){
    console.log(data)
    let dob=new Date(data.dob);
     let dateOfBirth=String(dob.getMonth() + 1).padStart(2, '0').toString()+"-"+String(dob.getDate()).padStart(2, '0').toString()+"-"+parseInt(dob.getFullYear().toString());
    const rootElement = document.getElementById('root');
    return(
        <div className="container">
            <div className="profile-container mx-auto max-w-sm rounded-lg shadow-md bg-white overflow-hidden">
      <img
        src={data.profilePictureLocation || '/imgs/profile.jpeg'}
        alt={`${data.firstName} ${data.lastName}'s profile picture`}
        className="w-full h-64 object-cover rounded-t-lg"
      />

      <div className="px-6 py-4">
        <h2 className="text-xl font-bold text-gray-800">
          {data.firstName} {data.lastName}
        </h2>
        <p className="text-sm text-gray-600">Joined on: {data.userSince.split(' ')[0]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <p className="text-sm text-gray-600">Mobile: {data.phoneNumber}</p>
          <p className="text-sm text-gray-600">Email: {data.email}</p>
          <p className="text-sm text-gray-600">Born on: {dateOfBirth}</p>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Languages you know:
          {data.languages && data.languages.length > 0 && (
            <>
              {data.languages.map((lang, index) => (
                <span key={lang} className="inline-block px-3 mr-1 text-sm text-gray-700 bg-gray-200 rounded-full">
                  {lang}
                </span>
              ))}
            </>
          )}
        </p>
        {data.friends && data.friends.length > 0 && (
          <>
            <h3 className="text-lg font-medium mt-6 text-gray-800">Friends</h3>
            <ol className="list-none space-y-2 pl-4">
              {data.friends.map((friend) => (
                <li key={friend.userId} className="text-base text-gray-600">
                  {friend.firstName}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpenModal(!openModal)}
        className="block w-full px-4 py-2 rounded-b-lg text-sm font-medium text-center text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Edit Profile
      </button>
    </div>
       <ReactModal isOpen={openModal} contentLabel="editProfile" appElement={rootElement}>
        <h2 className="text-center text-2xl font-medium mb-4">Editing profile Information</h2>
         <form
          onSubmit={handleEditForm}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-white-700 text-sm font-bold mb-2">
              First Name:
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              defaultValue={data.firstName}
              //onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"/>
          </div>
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block text-gray-700 text-sm font-bold mb-2">
              Last Name:
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              defaultValue={data.lastName}
              //onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        <div className="mb-4">
          <label htmlFor="dob"
          className="block text-gray-700 text-sm font-bold mb-2">
            Date of Birth:
          </label>
          <input
              type="date"
              name="dob"
              id="dob"
              min={1900}
              max={2024}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumber"
          className="block text-gray-700 text-sm font-bold mb-2">
            Mobile Number:
          </label>
          <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="1234567890" pattern="[0-9]{10}"
              //defaultValue={data.phoneNumber}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>


        <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-gray-700 text-sm font-bold mb-2">
              Gender:
            </label>
            <select
              name="gender"
              id="gender"
              className=" border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue={data.gender}
               //onChange={handleChange}
               >
              <option key="some_random_value" value="select">
                Select
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Non-Binary</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="languages"
              className="block text-gray-700 text-sm font-bold mb-2">
              Languages you know:(choose maximum 3)
            </label>
            <select
              name="languages[]"
              id="languages"
              className="border rounded py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={languages}
              onChange={handleLanguages}
              multiple
              max={3}
              style={{ height: '250px' }}
            >
  {availableLanguages.map((lang)=>(
    <option key = {lang} value={lang}>{lang}</option>
  ))}
            </select>
          </div>
          <div className="container">
  {languages && languages.length > 0 && (
    <div className="mb-3">

        {languages.map((language) => (
          <span key={language} className="me-2 mb-2 inline-flex">
            <button type="button" className="bg-blue-300 hover:bg-red-300 text-black  py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={() => handleLanguageRemove(language)}>
            {language}
            </button>
          </span>
        ))}
    </div>
  )}
</div>
<div className="container">
      <label className="block text-gray-700 text-sm font-bold mb-2">Upload your Profile picture:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploadError &&<p style={{color:"red"}}>{uploadError}</p>}
        {imageFile && (
        <div>
          <img src={URL.createObjectURL(imageFile)} alt="Resized" />
          {/* <button type="button" className="bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"onClick={uploadToS3}>Upload</button> */}
        </div>
      )}

    </div>
        <div className="container">
            {errors.length>0 && <ul>
                {errors.map((error)=>(
                    <li key={error}style={{color:"red"}}>
                        {error}
                    </li>
                ))}
                </ul>}
        </div>
          <div className="mb-6">
            <div className="flex space-x-10">
              <button type="button" className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline" onClick={()=>setOpenModal(!openModal)}>close</button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
              Make Changes
            </button>

                </div></div></form></ReactModal></div>
    )
}
else
{
  return(<div>
   {currentUser && <AddUser  firstName={currentUser.displayName}redirect="/profile"/>}
    </div>)
}
}

export default Profile;