import { useState, useEffect, useRef, useContext } from "react"
import { getAuth } from 'firebase/auth';
import Resizer from 'react-image-file-resizer';
import { useUserStore } from '../context/userStore';
import { useNavigate, Link, Navigate } from "react-router-dom";
import { db } from '../firebase/FirebaseFunctions';
import { setDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import upload from "../context/upload.js";

function AddUser(props)
{

    const auth =getAuth();
    const navigate=useNavigate();
    const loggedUser=auth.currentUser;
//const { currentUser, isLoading } = useUserStore();
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
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    dob: "",
    email: "",
    gender:"",
    languages:""
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    Resizer.imageFileResizer(
      file,
      150,
      150,
      'JPEG',
      100, 
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
    }
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
  //console.log(loggedUser, currentUser)
  const handleLanguageRemove = (languageToRemove) => {
    if(languages.length<2)
    {
        alert("You need to choose atleast one language");
    }
    else{
    setLanguages(languages.filter((lang) => lang !== languageToRemove));}
  };
    
  const handleSignUp=async(e)=>
  {
    e.preventDefault();
      setErrors([]);
      const regex = /^[A-Za-zÀ-ÿ ]+$/;
    if(!regex.test(formData.first_name.trim()))
    {
        setErrors((prevState) => {
            return [...prevState, "Invalid First name"]
          });
    }
    if(!regex.test(formData.last_name.trim()))
    {
        setErrors((prevState) => {
            return [...prevState, "Invalid Last name"]
          });
    }
    
    let dob=document.getElementById("dob").value;
    dob = new Date(dob)
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
      return
    }
    if(formData.gender==="select")
    {
      setErrors((prevState) => {
        return [...prevState, "Select your gender"]
      });
      return
    }
    let phone=document.getElementById("phoneNumber").value.trim();



    if(!errors.length>0){

      try{
    //I AM NOT FAMILIAR WITH THIS, THIS IS THROWING ERROR(MAYBE BCOZ OF PIC FILE), SO I COMMENTED IT, PLEASE REMOVE THIS WHEN YOU FIGURE IT OUT, THANK YOU-BNKVARMA
          let profilePictureUrl = ""
          if (imageFile) {
            profilePictureUrl = await upload(imageFile);
          }

          //save to firebase db
          const userDocRef = doc(db, "users", loggedUser.uid);
          await setDoc(userDocRef, {
              id: loggedUser.uid,
              firstName: formData.first_name.trim(),
              lastName: formData.last_name.trim(),
              email: loggedUser.email,
              dob: `${month}/${day}/${year}`,
              gender: formData.gender,
              phoneNumber: "+1"+phone,
              languages: languages,
              friends: [],
              profilePictureLocation: profilePictureUrl || ""
          });

          await setDoc(doc(db, "userchats", loggedUser.uid), {
            chats: [],
          });

      let response = await fetch("http://localhost:4000/user/updateuser", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.first_name.trim(),
                    lastName: formData.last_name.trim(),
                    email: loggedUser.email,
                    languages: languages,
                    gender: formData.gender,
                    dob: `${month}/${day}/${year}`, 
                    phoneNumber: "+1"+phone,
                   profilePictureLocation: imageFile || ""
                })
      });

      let data=await response.json()
      if (!response.ok) {
        if (data && data.message) {
            setErrors((prevState) => {
                return [...prevState, "Trouble with the server"];
              });
            return
          } else {
            setErrors((prevState) => {
                return [...prevState, "An error occurred while signing up"];
              });
            return
          }
        }
        else{
          setErrors([]);
          let redr=props.redirect;
          navigate('/checker')
           return
        }
      } catch(e){
        setErrors((prevState) => {
          return [...prevState, e.message];
        });
        return
      }
    }
    return
  }
return(
    <div>

    <form
          onSubmit={handleSignUp}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-gray-700 text-sm font-bold mb-2">
              First Name:
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              required
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
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
              value={formData.last_name}
              required
              onChange={handleChange}
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
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              required
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
              required
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
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
              required
              className=" border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.gender}
              onChange={handleChange}>
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
              required
              className="border rounded py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={languages}  
              onChange={handleLanguages}
              multiple
              max={3} 
              style={{ height: '250px' }}
            >
  {availableLanguages.map((lang)=>(
    <option key = {lang}value={lang}>{lang}</option>
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
        <input type="file" accept="image/*" onChange={handleImageChange}/>
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
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
              Begin
            </button>
          
                </div>
          </div>
        </form></div>
)
}

export default AddUser;
