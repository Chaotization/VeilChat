import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('nord');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'nord' ? 'dracula' : 'nord');
  };

  return (
    <div className="theme-toggle swap swap-rotate" onClick={toggleTheme}>
      {theme === 'nord' ? (
        <span className="material-symbols-outlined cursor-pointer text-4xl hover:text-secondary">light_mode</span>
        ) : (
        <span className="material-symbols-outlined cursor-pointer text-4xl hover:text-secondary">dark_mode</span>
      )}
    </div>
  );
};

export default ThemeToggle;