import React, { useEffect, useRef } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useState, useContext } from "react";
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions.js';
import AuthContext from "./AuthContext.jsx";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Resizer from 'react-image-file-resizer';
import SocialSignIn from './SocialSignIn.jsx';

function SignUp() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [continuePage, setContinuePage]=useState(false);
  const [languages, setLanguages]=useState([]);
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
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender:"",
    phoneNumber:""
  });
  const [errors, setErrors] = useState([]);
  const[profilePictureLocation, setProfilePictureLocation]=useState(null);
  const [loading, setLoading]=useState([]);
  const [password, setPassword] = useState("");
  const [repeat_password, setRepeatPassword] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Stores the uploaded image file
  const cropperRef = useRef(null);
const AWS_ACCESS_KEY_ID=import.meta.env.VITE_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_ID=import.meta.env.VITE_AWS_SECRET_ACCESS_ID
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [strength, setStrength] = useState("weak");
  const [match, setMatch] = useState(false);
  if (currentUser) {
    return <Navigate to='/home' />;
}
  function handlePwdChange(e) {
    let newPwd = e.target.value;
    setPassword(newPwd);
    validatePassword(newPwd);
  }
  function validatePassword(password) {
    const hasUpperCase = /[A-Z]/g.test(password);
    const hasLowerCase = /[a-z]/g.test(password);
    const hasNumber = /[0-9]/g.test(password);
    const hasSpecialChar = /[!@#$%^&*()]/g.test(password);

    if (password.length < 8) {
      setStrength("weak");
    } else if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      setStrength("strong");
    } else {
      setStrength("medium");
    }
    return;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    Resizer.imageFileResizer(
      file,
      150,
      150,
      'JPEG',
      100, // Image quality (0 to 100)
      0, // Rotation (0 to 360)
      (resizedImage) => {
        // Check the size of the resized image
        if (resizedImage.size / 1024 / 1024 > 5) {
          alert('Image size should be less than 5MB.');
          return;
        }
        
        setImageFile(resizedImage);
      },
      'blob'
    );
    }

const uploadToS3 = async () => {
  try {
    const s3Client = new S3Client({
      region:'us-east-1',
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_ID,
      },
     
    });


    const params = {
      Bucket: "veilchat-s3",
      Key: `${Date.now()}-${imageFile.name}`,
      Body: imageFile,
      ContentType: 'image/jpeg',
      ACL : "public-read"
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    console.log("Image uploaded successfully:", response.Location);
    console.log(response);
    setProfilePictureLocation(response.Location);
  } catch (error) {
    setErrors((prevState) => {
      return [...prevState,error];
    });

  }
};



  function handleRePwdChange(e) {
    let newPwd = e.target.value;
    setRepeatPassword(newPwd);
    setMatch(password === newPwd);
  }
  if (currentUser) {
    return <Navigate to='/home' />;
}

  const handleSubmit = async(e) => {

    e.preventDefault();
    setLoading(true);

    setErrors([]);
    if (password !== repeat_password) {
      setErrors((prevState) => {
        return [...prevState, "Passwords don't match"];
      });

    }

  if(!errors.length){
    
     try {
           const userCredential= await doCreateUserWithEmailAndPassword(
                formData.email,
                password           
            );
            //console.log("User created successfully:", userCredential);           
              setContinuePage(true);
              return
        } catch (error) {
            alert(error.code);
            navigate('/signin');
        }
        setLoading(false);
        setContinuePage(true);
  }
  setLoading(false)
  return;
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
  console.log(languages);
}
const handleLanguageRemove = (languageToRemove) => {
  setLanguages(languages.filter((lang) => lang !== languageToRemove));
};
  

        const handleSignUp=async(e)=>
        {
          e.preventDefault();
          setErrors([]);
          setMatch(false);
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
    dob=new Date(dob);
   
    let yearOfBirth=parseInt(dob.getFullYear());
    let today=new Date()
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

    if(!errors.length>0)
    {
    let response=await fetch("http://localhost:4000/signup",{
        method:"POST",
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(
            {
                "firstName":formData.first_name.trim(),
                "lastName":formData.last_name.trim(),
                "email":formData.email.trim(),
                "password":password,
                "dob":dob,
                "gender":formData.gender,
                "languages":languages,
                "phoneNumber":phone,
                "profilePictureLocation":setImageFile|| ""
            })
    });
    try
    {
    let data=await response.json()
    if (!response.ok) {
        if (data && data.message) {
            setErrors((prevState) => {
                return [...prevState, data.message];
              });
            return
          } else {
            setErrors((prevState) => {
                return [...prevState, "An error occurred while logging in"];
              });
            return
          }
        }
      else{
        setErrors([]);
        setContinuePage(false);
        alert("Sucessfully created your profile");
        navigate('/signin');}
    }
catch(e)
{
    setErrors((prevState) => {
        return [...prevState, e.message];
      });
      return
}}
if(loading)
{
  return <div>loading..</div>
}
return
  };

  return ( 
  <div className="max-w-md mx-auto my-8">
    {!continuePage?
    <div>
      <h2 style={{textAlign:"center", fontWeight:"bold"}}>Create a new profile</h2>
      <div className='card'>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              required
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={password}
              required
              onChange={handlePwdChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {password && (
              <span
                style={
                  strength === "weak"
                    ? { color: "red" }
                    : strength === "medium"
                    ? { color: "orange" }
                    : { color: "green" }
                }>
                {strength}
              </span>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="repeat_password"
              className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password:
            </label>
            <input
              type="password"
              name="repeat_password"
              value={formData.repeat_password}
              required
              onChange={handleRePwdChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {repeat_password && (
              <span style={match ? { color: "green" } : { color: "red" }}>
                {match ? "Passwords Match" : "Passwords doesn't Match"}
              </span>
            )}
          </div >
          {errors.length>0 && <ul>
                {errors.map((error)=>(
                    <li key={error}style={{color:"red"}}>
                        {error}
                    </li>
                ))}
                </ul>}
          <div className="flex justify-between items-center">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                    id='submitButton'
                    name='submitButton'
                    type='submit'
                >
                    Continue
                </button>

            <Link to="/signin">
              <button className="bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-l from-green-700 to-green-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-lg shadow-green-500/50">
                Already have an account
                </button>

                </Link>
                </div>
            </form>
            <br />
           
            <SocialSignIn />
            
        </div></div>:( <div className="container">
       
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
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
              placeholder="123-456-7890" pattern="[0-9]{10}"
              required
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
              <option value="non-binary">Non-Binary</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="languages"
              className="block text-gray-700 text-sm font-bold mb-2">
              Languages:(choose maximum 3)
            </label>
            <select
    name="languages[]" 
    id="languages"
    required
    className="border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    value={languages}  
    onChange={handleLanguages}
    multiple
    max={3} 
  >
  {availableLanguages.map((lang)=>(
    <option key = {lang}value={lang}>{lang}</option>
  ))}
            </select>
          </div>
          <div className="container">
  {languages && languages.length > 0 && (
    <div className="card mb-3"> 
      <div className="card-body d-flex flex-wrap">
        {languages.map((language) => (
          <span key={language} className="me-2 mb-2">
            
            <button type="button" className="bg-blue-300 hover:bg-red-300 text-black  py-1 px-1 rounded focus:outline-none focus:shadow-outline" onClick={() => handleLanguageRemove(language)}>
            {language}
            </button>
          </span>
        ))}
      </div>
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
              <button type="button" className="bg-gray-500 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline" onClick={()=>setContinuePage(false)}>back</button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
              Sign Up
            </button>
          
                </div>
          </div>
        </form>
      </div>)}
    </div>
  );
}

export default SignUp;
