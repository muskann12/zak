import React from 'react';
import { User } from '../types';
import { CheckCircle, Copy, LogOut, Chrome } from 'lucide-react';

interface UserSuccessViewProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
}

export const UserSuccessView: React.FC<UserSuccessViewProps> = ({ user, onLogout }) => {

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-4 relative font-sans transition-colors duration-300">
      
      {/* Background (Blurred/Inactive) */}
      <div className="max-w-md w-full opacity-50 pointer-events-none filter blur-sm">
         <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
         <h1 className="text-2xl font-bold text-gray-400 mb-2 text-center">Account Active</h1>
      </div>

      {/* Mandatory Modal Popup - Cannot be closed */}
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#151515] rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-gray-100 dark:border-[#333] transform transition-all animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
              
              {/* Decorative Header */}
              <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>

              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <CheckCircle size={32} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Account Created</h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3 mb-6 text-left flex items-start gap-3">
                 <div className="mt-0.5 text-blue-500"><Chrome size={18} /></div>
                 <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Your account has been successfully created. You can now log in to the <span className="font-bold">Chrome Extension</span> using the same email and password.
                 </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-[#333] mb-6 text-left">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Registered Email</div>
                  <div className="flex justify-between items-center">
                      <span className="font-mono font-medium text-gray-900 dark:text-white text-sm truncate pr-2">{user.email}</span>
                      <button 
                        onClick={copyEmail} 
                        className="text-brand hover:text-brand-dark transition p-1.5 rounded-md hover:bg-brand/10"
                        title="Copy Email"
                      >
                        <Copy size={14}/>
                      </button>
                  </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-200 text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <LogOut size={16} /> Sign Out
              </button>
           </div>
      </div>
    </div>
  );
};