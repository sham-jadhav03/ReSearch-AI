import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-app p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-default bg-surface-primary p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border-strong bg-surface-secondary">
            <span className="text-3xl font-semibold tracking-wider text-text-primary">
              {getInitial(user?.username)}
            </span>
          </div>

          {/* User Details */}
          <h2 className="mb-1 text-2xl font-bold text-text-primary">
            {user?.username || 'User Profile'}
          </h2>
          <p className="text-sm text-text-secondary mb-8 font-medium">
            {user?.email || 'No email provided'}
          </p>

          <div className="w-full space-y-3.5">
            <button
              onClick={() => navigate('/')}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-default bg-surface-secondary px-4 py-3 font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
            >
              <i className="ri-arrow-left-line text-lg" />
              Back to Chat
            </button>

            <button
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-medium text-red-400 transition-colors hover:bg-red-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <i className="ri-logout-box-r-line text-lg" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;