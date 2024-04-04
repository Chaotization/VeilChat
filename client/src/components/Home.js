import React, { useContext, useEffect, useState } from 'react';
import '../App.css';
import { AuthContext } from '../firebase/Auth';
import MyInvites from './MyInvites';
import Card from 'react-bootstrap/Card';
import Schedules from './Schedules';

function Home() {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('User Search useEffect')
    async function fetchData() {
        try {
            if (currentUser !== null) {
                setLoading(false);
            } else {
                setLoading(true);
            }
        } catch (e) {
            console.log(e);
        }
    }
    fetchData();
  }, []);

  if(loading){
    console.log("HERE");
    return(
      <div>
        Loading...
      </div>
    )
  }
  return (
    <div className="container">
      <h1>Welcome {currentUser.displayName}</h1>
      <div className="row">
        <div class="col">
          <Card id="Account">
            <Card.Body>
              <Card.Title>{currentUser.displayName}</Card.Title>
              <Card.Text>{currentUser.email}</Card.Text>
            </Card.Body>
          </Card>
          <Card id="Invites">
            <Card.Body>
              <MyInvites />
            </Card.Body>
          </Card>
        </div>
        <div class="col">
          <Card id="Schedules">
            <Card.Body>
              <Schedules />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;
