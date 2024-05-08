import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';
import { getAuth } from 'firebase/auth';

function Landing() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="relative">
          <img
            src="/imgs/5233.jpg"
            className="max-w-xl rounded-lg shadow-2xl"
            alt="Landing"
          />
          <svg
            className="absolute -top-10 -left-10 w-20 h-20 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <svg
            className="absolute bottom-0 right-0 w-20 h-20 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <a href="http://www.freepik.com" className='font-extralight text-xs'>Designed by pch.vector / Freepik</a>
        </div>
        <div>
          <h1 className="text-5xl font-bold">Welcome to </h1>
          {/* AI generated svg */}
          <div className="block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF4136" />
                  <stop offset="100%" stopColor="#0074D9" />
                </linearGradient>
              </defs>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="80" fontWeight="bold" fill="url(#gradient)">
                <tspan>V</tspan>
                <tspan>eil</tspan>
                <tspan>C</tspan>
                <tspan>hat</tspan>
              </text>
            </svg>
          </div>
          <p className="py-6">
            Connect with interesting strangers based on your preferences and engage in meaningful conversations.
          </p>
          <ul className="list-disc list-inside mb-6">
            <li>Personalized matches</li>
            <li>Engaging conversations</li>
            <li>Expand your social network</li>
            <li>Privacy and safety assured</li>
          </ul>
          <NavLink to="/searchuser"><button className="btn btn-primary">Get Started</button></NavLink>
        </div>
      </div>
    </div>
  );
}

export default Landing;