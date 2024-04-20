import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import AuthContext from "./AuthContext";
import { State, City } from "country-state-city";
function SignUp() {
  const { loggedIn, handleLogedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    city: "",
    state: "",
    country: "US",
  });
  const [errors, setErrors] = useState([]);
  const [password, setPassword] = useState("");
  const [repeat_password, setRepeatPassword] = useState("");
  let [user_name, setUserName] = useState("");
  let [userMatch, setUserMatch] = useState(false);
  if (loggedIn) navigate("/");
  let states = State.getAllStates().filter(
    (state) => state.countryCode === "US"
  );

  let [cities, setCities] = useState([]);
  useEffect(() => {
    let c = City.getAllCities().filter(
      (city) => city.stateCode === formData.state
    );
    setCities(c);
  }, [formData.state]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [strength, setStrength] = useState("weak");
  const [match, setMatch] = useState(false);
  function handlePwdChange(e) {
    let newPwd = e.target.value;
    setPassword(newPwd);
    validatePassword(newPwd);
  }
  function handleUserName(e) {
    let user = e.target.value;
    setUserName(user);
    const regex = /^[^\s]+$/;
    if (regex.test(user)) {
      setUserMatch(true);
    } else {
      setUserMatch(false);
    }
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
  function handleRePwdChange(e) {
    let newPwd = e.target.value;
    setRepeatPassword(newPwd);
    setMatch(password === newPwd);
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.repeat_password) {
      setErrors((prevState) => {
        return [...prevState, "Passwords doesn't match"];
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <h2 style={{ textAlign: "center" }}>Create a new profile</h2>
      <div className="container">
        <form
          onSubmit={handleSubmit}
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
              htmlFor="user_name"
              className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              required
              onChange={handleUserName}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {user_name && (
              <span style={{ color: userMatch ? "green" : "red" }}>
                {userMatch ? "Format Accepted " + "\u2714" : "\u2716"}
              </span>
            )}
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
              Repeat Password:
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
          </div>

          <div className="mb-4">
            <label
              htmlFor="state"
              className="block text-gray-700 text-sm font-bold mb-2">
              State:
            </label>
            <select
              name="state"
              required
              value={formData.state}
              onChange={handleChange}>
              <option key="some_random_value" value="select">
                Select
              </option>
              {states.map((state) => (
                <option
                  key={state.latitude + state.longitude}
                  value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          {formData.state && cities.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-gray-700 text-sm font-bold mb-2">
                City:
              </label>
              <select
                name="city"
                value={formData.city}
                required
                onChange={handleChange}>
                {cities.map((city) => (
                  <option
                    key={city.latitude + city.longitude}
                    value={city.isoCode}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* <div className="mb-4">
          <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country:</label>
          <input type="text" name="country" value={formData.country} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div> */}
          <div className="mb-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
