import React, { useEffect, useRef, useState } from 'react'
import './ChatRoom.css'
import { doc, onSnapshot} from "firebase/firestore";
import { db } from '../../../firebase/FirebaseFunctions';

const ChatRoom = () =>{

  const [chat, setChats] = useState();
  const endRef = useRef(null)

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

 
  return (
      <div className="chat">
        <div className="top">
          <div className="user">
            <img src = "./public/imgs/avatar.png" alt="" />
            <div className='texts'>
            <span>Su Zhang</span>
            <p>user description</p>
            </div>
          </div>
          <div className="icons"></div>
        </div>
        <div className="center">
          <div className="message">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat sdkfjskjkfsdjfksfjksjfkskfs  sjfksjfksdjfksjfjksfdjsfjksjdkjfksjfdfjksjfks s sksjdksj</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message own">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message own">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          <div className="message">
            <img src="./public/imgs/avatar.png" alt="" />
            <div className="texts">
              <p>sample chat I must be long enough to be scrolled down to take another line, and maybe another line, and maybe another line</p>
              <span>sample mins ago</span>
            </div>
          </div>
          {/* Auto scroll down to last message */}
          <div ref={endRef}></div>
        </div>
        <div className="bottom">
          <div className="icons"></div>
          <input type = 'text' placeholder='Type a message...' />
          <button className='sendButton'>Send</button>
        </div>
      
      
      
      
      </div>
  )
}

export default ChatRoom
