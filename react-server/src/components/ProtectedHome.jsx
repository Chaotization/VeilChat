import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext.jsx';

function Home() {
    const {currentUser} = useContext(AuthContext);
    console.log(currentUser);
    return (
        <div className='card'>
            <h2>
                Hello {currentUser && currentUser.displayName}, this is the Protected
                Home page
            </h2>
        </div>
    );
}

export default Home;