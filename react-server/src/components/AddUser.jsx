import {useState} from "react"
import {getAuth} from 'firebase/auth';
import Resizer from 'react-image-file-resizer';
import {useUserStore} from '../context/userStore';
import {useNavigate} from "react-router-dom";
import {db} from '../firebase/FirebaseFunctions';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import PhoneVerificationModal from "./PhoneVerification.jsx";

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_ID,
    },
});

function AddUser(props)
{

    const auth =getAuth();
    const navigate=useNavigate();
    const loggedUser=auth.currentUser;
    const { currentUser} = useUserStore();
    const [languages, setLanguages]=useState("");
    const [uploadError, setUploadError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
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
    const [formData, setFormData] = useState({
          uId: "",
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
    const handleLanguages=(e)=> {

        if(!languages.includes(e.target.value)) {
            if(languages.length>2) {
                alert("You already selected 3 languages...")
            } else {
                setLanguages([...languages,e.target.value])
            }
        }
    }
  //console.log(loggedUser, currentUser)
    const handleLanguageRemove = (languageToRemove) => {
        if(languages.length<2) {
        alert("You need to choose atleast one language");
    } else{
    setLanguages(languages.filter((lang) => lang !== languageToRemove));}
    };

    const onVerificationSuccess = () => {
        setPhoneNumberVerified(true);
        setErrors(errors.filter(e => e !== "Please verify your phone number."));
    };
    const handleSignUp=async(e)=> {
      e.preventDefault();
      setErrors([]);
      const regex = /^[A-Za-zÀ-ÿ ]+$/;
      if(!regex.test(formData.first_name.trim())) {
          setErrors((prevState) => {
            return [...prevState, "Invalid First name"]
          });
      }
      if(!regex.test(formData.last_name.trim())) {
          setErrors((prevState) => {
              return [...prevState, "Invalid Last name"]
          });
      }
      if (!phoneNumberVerified) {
          setErrors(prevState => [...prevState, "Please verify your phone number."]);
          return;
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

        try {
            let profilePictureUrl = ""
            if (imageFile) {
                profilePictureUrl = await uploadToS3();
            }
          //save to firebase db
          const userDocRef = doc(db, "users", loggedUser.uid);
          await updateDoc(userDocRef, {
              firstName: formData.first_name.trim(),
              lastName: formData.last_name.trim(),
              dob: `${month}/${day}/${year}`,
              gender: formData.gender,
              phoneNumber: "+1"+phone,
              languages: languages,
              profilePictureLocation: profilePictureUrl || ""
          });
          await useUserStore.getState().fetchUserInfo(loggedUser.uid);
          const userChatsRef = doc(db, "userchats", loggedUser.uid);
          const userChatsSnap = await getDoc(userChatsRef);
          if (!userChatsSnap.exists()) {
              await setDoc(userChatsRef, { chats: [] });
          }

          
      let response = await fetch("http://localhost:4000/user/updateuser", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uId:loggedUser.uid,
                    firstName: formData.first_name.trim(),
                    lastName: formData.last_name.trim(),
                    email: loggedUser.email,
                    languages: languages,
                    gender: formData.gender,
                    dob: `${month}/${day}/${year}`, 
                    phoneNumber: "+1"+phone,
                    profilePictureLocation: profilePictureUrl || ""
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
        } else{
            setErrors([]);
            alert("Info added, you can access other pages now")
            navigate('/')
           return
        }} catch(e){
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
      <h4 style={{background:"white",color:"purple"}} className="text-center text-2xl font-medium mb-4"> Dear {props.firstName || "user"}, fill this form to continue</h4>
    <form
          onSubmit={handleSignUp}
          className=" shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block  text-sm font-bold mb-2">
              First Name:
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              required
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"/>
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
              value={formData.last_name}
              required
              onChange={handleChange}
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
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              required
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
              required
              className=" border rounded py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
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
              className="block  text-sm font-bold mb-2">
              Languages you know:(choose maximum 3)
            </label>
            <select
              name="languages[]" 
              id="languages"
              required
              className="border rounded py-1 px-3  leading-tight focus:outline-none focus:shadow-outline"
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
            <button type="button" className="btn btn-primary" onClick={() => handleLanguageRemove(language)}>
            {language}
            </button>
          </span>
        ))}
    </div>
  )}
</div>
<div className="container">
      <label className="block  text-sm font-bold mb-2">Upload your Profile picture:</label>
        <input type="file" accept="image/*" onChange={handleImageChange}/>
        {uploadError &&<p style={{color:"red"}}>{uploadError}</p>}
        {imageFile && (
        <div>
          <img src={URL.createObjectURL(imageFile)} alt="Resized" />
          {/* <button type="button" className="bg-green-500 hover:bg-green-700 font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"onClick={uploadToS3}>Upload</button> */}
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
              className="btn btn-primary">
              Begin
            </button>
          
                </div>
          </div>
        </form></div>
)
}

export default AddUser;
