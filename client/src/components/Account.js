import React, {useContext, useState} from 'react';
import '../App.css';
import ChangePassword from './ChangePassword';
import ChangeUserInfo from './ChangeUserInfo';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {AuthContext} from '../firebase/Auth';

function Account() {
  const {currentUser} = useContext(AuthContext);
  const [showChangePW, setShowChangePW] = useState(false);
  const [showChangeInfo, setShowChangeInfo] = useState(false);

  let User = () => {return (
        <Card id={currentUser.uid}>
          <Card.Body>
            <Card.Title>{currentUser.displayName}</Card.Title>
            <Card.Text>{currentUser.email}</Card.Text>
          </Card.Body>
        </Card>
    );
  }


  if(!showChangePW && ! showChangeInfo){
    return (
      <div className="container mr-auto">
        <h1>Account Info</h1>
        <User />
        <Button onClick={()=> {
          setShowChangePW(false);
          setShowChangeInfo(true)}
          }>Change User Info</Button>
        <Button onClick={()=> {
          setShowChangePW(true);
          setShowChangeInfo(false)}
          }>Change Password</Button>
      </div>
    );
  }else if (showChangeInfo) {
    return(
    <div className="container mr-auto">
        <h1>Account Info</h1>
        <User />
        <Button onClick={()=> {
          setShowChangePW(false);
          setShowChangeInfo(false)}
          }>Change User Info</Button>
        <Button onClick={()=> {
          setShowChangePW(true);
          setShowChangeInfo(false)}
          }>Change Password</Button>
        <div class="container mr-auto">
          <ChangeUserInfo />
        </div>
      </div>
    );
  } else {
    return (
      <div className="container mr-auto">
        <h1>Account Info</h1>
        <User />
        <Button onClick={()=> {
          setShowChangePW(false);
          setShowChangeInfo(true)}
          }>Change User Info</Button>
        <Button onClick={()=> {
          setShowChangePW(false);
          setShowChangeInfo(false)}
          }>Change Password</Button>
        <div className="container mr-auto">
          <ChangePassword />
        </div>
      </div>
    );
  }
}

export default Account;
