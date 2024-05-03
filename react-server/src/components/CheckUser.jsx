import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import React,{useState, useEffect} from 'react';
import AddUser from './AddUser';
import Home from './ProtectedHome';
function CheckUser() {
    const [data, setData] = useState("");
    const[loading, setLoading]=useState(false);
    const[error, setError]=useState(null);
    const auth =getAuth();  
    const currentUser=auth.currentUser;

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
            
          } catch (error) {
           setError(error);
          }
          setLoading(false);
        };
      
        if(currentUser)
        {fetchData();}
        else {
            navigate('/signin');
          }
      },[]); 
    console.log("Inside checkuser", data);
    if(loading)
    {
        return <div>Loader</div>
    }
    else{
    if(!data)
    {
       return <AddUser task="add"/>
    }
    else
    {
        if(!data.firstName || !data.lastName || !data.dob || !data.phoneNumber)
        {
            return <AddUser task="add"/>
        }
        return <Home tested="true" firstName={data.firstName}/>
    }
}
    
}

export default CheckUser;