import './Chat.css'
import { AuthContext } from '../../../context/AuthContext';
import { useContext } from 'react';

const Chat = () =>{

    return (
        <div className="list">
        {/*user information here */}
        <div className='chatList'>
           <div className='search'>
            <div className="searchbar">
                <img src = "" alt="" />
                <input type = "text" placeholder='Search Chat' />
            </div>
           </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
           </div>
        </div>
        </div>
    )
}

export default Chat;