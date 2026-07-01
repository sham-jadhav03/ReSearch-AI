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
    <div className="min-h-screen w-full bg-[#0f0f10] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161618] border border-white/[0.07] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col items-center text-center relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-6 ring-4 ring-white/[0.04]">
            <span className="text-3xl font-semibold text-white tracking-wider">
              {getInitial(user?.username)}
            </span>
          </div>

          {/* User Details */}
          <h2 className="text-2xl font-bold text-white mb-1">
            {user?.username || 'User Profile'}
          </h2>
          <p className="text-sm text-[#888892] mb-8 font-medium">
            {user?.email || 'No email provided'}
          </p>

          <div className="w-full space-y-3.5">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl border border-white/[0.07] bg-white/5 text-white font-medium hover:bg-white/10 hover:border-white/15 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="ri-arrow-left-line text-lg" />
              Back to Chat
            </button>

            <button
              onClick={onLogout}
              className="w-full py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-medium hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
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