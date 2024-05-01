import React from 'react';
import SignOutButton from './SignOut.jsx';
import ChangePassword from './ChangePassword.jsx';
import DeleteUserButton from './DeleteUser.jsx';

function Account() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl font-bold mb-6">Account Page</h2>
          <div className="space-y-4">
            <ChangePassword />
            <SignOutButton />
            <DeleteUserButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;