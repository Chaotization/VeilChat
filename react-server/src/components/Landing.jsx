import React,{useContext} from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function Landing() {   
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="/imgs/hero.webp"
          className="max-w-sm rounded-lg shadow-2xl"
          alt="Landing"
        />
        <div>
          <h1 className="text-5xl font-bold">Welcome to VeilChat!</h1>
          <p className="py-6">
            VeilChat is a unique blind dating platform that connects you with interesting strangers based on your preferences. Our platform aims to create meaningful conversations and potentially lasting connections.
          </p>
          <h2 className="text-3xl font-bold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside mb-6">
            <li>Sign up and set your preferences</li>
            <li>Get matched with a stranger who shares similar interests</li>
            <li>Start a conversation and get to know each other</li>
            <li>If you enjoy the conversation, you can choose to follow each other</li>
            <li>Continue building your connection and see where it leads!</li>
          </ol>
          <p className="mb-6">
            With VeilChat, you have the opportunity to expand your social circle, engage in exciting conversations, and potentially find your perfect match.
          </p>
          <h2 className="text-3xl font-bold mb-4">Why choose VeilChat?</h2>
          <ul className="list-disc list-inside mb-6">
            <li>Connect with individuals who share your interests</li>
            <li>Engage in meaningful conversations</li>
            <li>Expand your social network</li>
            <li>Potentially find your perfect match</li>
            <li>Privacy and safety assured</li>
          </ul>
          <div className="flex justify-center">
            <button className="btn btn-primary mr-4">Sign Up</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );}


export default Landing;