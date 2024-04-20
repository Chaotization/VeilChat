import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import AuthContext from "./AuthContext";

const SignOut = () => {
  const { loggedIn, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (!loggedIn) return navigate("/");

    try {
      const response = await fetch("http://localhost:4000/logout");
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        alert(data.message);
        handleLogout();
        navigate("/");
      } else {
        console.log("Error parsing logout response:", data.message);
        alert("An error occurred while logging out.");
      }
      handleLogout()
    } catch (error) {
      console.error("Error during logout request:", error);
      alert("An error occurred while logging out.");
    }
  };

  useEffect(() => {
    handleSignOut();
  }, []);
};

export default SignOut;
