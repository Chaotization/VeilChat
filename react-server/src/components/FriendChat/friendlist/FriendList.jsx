import React from 'react'
import './FriendList.css'

const FriendList = () =>{
  return (
      <div className="friendList">
        <div className='search'>
            <div className="searchbar">
                <img src = "" alt="" />
                <input type = "text" placeholder='Search Friend' />
            </div>
        </div>

          <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Friend1</span>
            </div>
          </div>

          <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Friend2</span>
            </div>
          </div>

          <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Friend3</span>
            </div>
          </div>

          
      </div>
  )
}

export default FriendList