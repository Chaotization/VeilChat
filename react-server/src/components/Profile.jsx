import { useState, useEffect } from "react"
import { getAuth } from 'firebase/auth';
import ReactModal from "react-modal";
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import Resizer from 'react-image-file-resizer';
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";
import PhoneVerificationModal from './PhoneVerification.jsx';
import { useUserStore } from "../context/userStore";
import Loader from "./Loader.jsx";
import {db} from '../firebase/FirebaseFunctions';
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_ID,
  },
});

function Profile(){
    const auth =getAuth();
    const currentUser=auth.currentUser;
    const [data, setData] = useState("");
    const [openModal,setOpenModal]=useState(false);
    const [loading, setLoading]=useState(false);
    const [uploaded, setUploaded]=useState(false);
    const[error, setError]=useState(null);
    const navigate=useNavigate();
    const [languages, setLanguages]=useState("");
    const [uploadError, setUploadError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [phoneNumberVerified, setPhoneNumberVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
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

    const onVerificationSuccess = () => {
        setPhoneNumberVerified(true);
        setErrors(errors.filter(e => e !== "Please verify your phone number."));
    };

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


    if(loading)
    {
        return <div><Loader/></div>
    }
    const handleImageChange = (e) => {
        const file = e.target.files[0];
      Resizer.imageFileResizer(
          file,
          720,
          560,
          'JPEG',
          100,
          0,
          (resizedImage) => {
              if (resizedImage.size / 1024 / 1024 > 5) {
                  alert('Image size should be less than 5MB.');
                  return;
              }

              setImageFile(resizedImage);
              setUploaded(true)
          },
          'blob'
      );
      
  }
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
    
  async function handleEditForm(e){
        e.preventDefault();
        setErrors([]);
        
        const regex = /^[A-Za-zÀ-ÿ ]+$/;
        let fname=document.getElementById('first_name')?.value;
        let lname=document.getElementById('last_name')?.value;
        let dob=document.getElementById("dob")?.value;
        let phoneNumber=document.getElementById('phoneNumber')?.value;
        let gender=document.getElementById('gender')?.value;
        let updatedUser={uId:data.userId}
        updatedUser['email']=currentUser.email;
    if(fname?.trim())
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
    if(lname?.trim())
    {
        if(!regex.test(lname.trim()))
        {
            setErrors((prevState) => {
                return [...prevState, "Invalid Last name"]
              });
        }
        else  updatedUser['lastName']=lname.trim();
    }

      if(phoneNumber?.trim())
      {
          updatedUser['phoneNumber']="+1"+phoneNumber;

          if (phoneNumber !== data.phoneNumber) {
              if (!phoneNumberVerified) {
                  setErrors(prevState => [...prevState, "Please verify your phone number."]);
                  return;
              }
          }
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
    if(phoneNumber?.trim())
    {
        updatedUser['phoneNumber']="+1"+phoneNumber;
    }
    if(gender && gender!=='select')
    {
        updatedUser['gender']=gender;
    }
    if(languages)
    {
        updatedUser['languages']=languages;
    }
    let profilePictureUrl = ""
                if (imageFile) {
                    profilePictureUrl = await uploadToS3();

                }
    updatedUser['profilePictureLocation']=profilePictureUrl
    console.log(profilePictureUrl)
    if(!errors || errors.length===0)
    {
        try
    
        {
                const userDocRef = doc(db, "users", currentUser.uid);
                console.log(userDocRef)
                await updateDoc(userDocRef, {
                    firstName: fname||"",
                    lastName: lname||"",
                    dob: dob||"",
                    gender: gender||"",
                    phoneNumber: phoneNumber||"",
                    languages: languages||[],
                    profilePictureLocation: profilePictureUrl || ""
                });

                let response=await fetch("http://localhost:4000/user/updateuser",{
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body:JSON.stringify(updatedUser)
                });

                let data=await response.json()

                
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
                    setUploaded(false);
                    //alert("Sucessfully updated your profile");
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
        else{
          setErrors([]);
          console.log("success",data);
          setData(data);
          setUploaded(false);
          //alert("Sucessfully updated your profile");
        setOpenModal(false);}
  
    }

  if(data && data.firstName){
    console.log(data)
    let dob=new Date(data.dob);
     let dateOfBirth=String(dob.getMonth() + 1).padStart(2, '0').toString()+"-"+String(dob.getDate()).padStart(2, '0').toString()+"-"+parseInt(dob.getFullYear().toString());
    const rootElement = document.getElementById('root');
    return(
        <div className="container my-6 mx-auto">
            <div className="profile-container mx-auto max-w-sm rounded-lg shadow-md overflow-hidden">
            <div className="relative">
            <form onSubmit={handleEditForm}>
            <img
              src={data.profilePictureLocation || "/imgs/profile.jpeg"}
              alt={`${data.firstName} ${data.lastName}'s profile picture`}
              className="w-64 h-64 mx-auto rounded-full"
            />
        <label className="absolute bottom-4 right-4 cursor-pointer">
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {!uploaded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition duration-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 011.414 1.414l-8 8a1 1 0 01-1.414-1.414l8-8zM15 4a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h10z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <button type="submit" className="flex items-center space-x-2 py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 00-1 1v6a1 1 0 002 0v-6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4 10a1 1 0 002 0v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-2 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">Upload</span>
            </button>
          )}
        </label>
        </form>
    </div>
      <div className="px-6 py-4">
        <h2 className="text-xl font-bold">
          {data.firstName} {data.lastName}
        </h2>
        <p className="text-sm ">User since: {data.userSince.split('-')[0]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <p className="text-sm ">Mobile: {data.phoneNumber}</p>
          <p className="text-sm ">Email: {data.email}</p>
          <p className="text-sm ">Born on: {dateOfBirth}</p>
        </div>
        <p className="text-sm  mt-4">
          Languages you know:
          {data.languages && data.languages.length > 0 && (
            <>
              {data.languages.map((lang) => (
                <span key={lang} className="inline-block px-3 mr-1 text-sm rounded-full">
                  {lang}
                </span>
              ))}
            </>
          )}
        </p>
        {data.friends && data.friends.length > 0 && (
          <>
            <h3 className="text-lg font-medium mt-6">Friends</h3>
            <ol className="list-none space-y-2 pl-4">
              {data.friends.map((friend) => (
                <li key={friend.userId} className="text-base ">
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
      <div className="container bg-base-100">
       <ReactModal isOpen={openModal} contentLabel="editProfile" appElement={rootElement} className=""> 
        <h2 className="text-center bg-base-100 text-2xl font-medium mb-4">Editing profile Information</h2>
         <form
          onSubmit={(e)=>{handleEditForm(e); setFormSubmitted(true)}}
         
          className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="text-sm font-bold mb-2">
              First Name:
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              defaultValue={data.firstName}    
              //onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"/>
          </div>
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block  text-sm font-bold mb-2">
              Last Name:
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              defaultValue={data.lastName}
              //onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        <div className="mb-4">
          <label htmlFor="dob"
          className="block  text-sm font-bold mb-2">
            Date of Birth:
          </label>
          <input
              type="date"
              name="dob"
              id="dob"
              min={1900}
              max={2024}
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
             <PhoneVerificationModal initialPhoneNumber={phoneNumber} onVerificationSuccess={onVerificationSuccess} />


        <div className="mb-4">
            <label
              htmlFor="gender"
              className="block  text-sm font-bold mb-2">
              Gender:
            </label>
            <select
              name="gender"
              id="gender"
              className=" border rounded py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
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
              className="block  text-sm font-bold mb-2">
              Languages you know:(choose maximum 3)
            </label>
            <select
              name="languages[]" 
              id="languages"
              className="border rounded py-1 px-3  leading-tight focus:outline-none focus:shadow-outline"
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
            <button type="button" className="bg-blue-300 hover:bg-red-300   py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={() => handleLanguageRemove(language)}>
            {language}
            </button>
          </span>
        ))}
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
              <button type="button" className="btn btn-secondary" onClick={()=>setOpenModal(!openModal)}>close</button>
            <button
              type="submit"
              className="btn btn-primary">
              Make Changes
            </button>
          
                </div></div></form></ReactModal>
                </div>
                </div>
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