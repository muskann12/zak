import React, { useState, useEffect } from 'react';
import { User, AppView } from '../types';
import { loginUser, registerUser, submitPayment, pollApprovalStatus, validateReferralCode, getSession } from '../services/api';
import { Loader2, QrCode, CheckCircle, AlertCircle, Smartphone, CreditCard, Tag, School, MapPin, User as UserIcon, Ticket, ArrowRight, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';

// Refactored components moved outside AuthFlow to prevent re-creation on render and fix type inference issues
const InputLabel = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{children}</label>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-lg py-3 px-4 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all placeholder:text-gray-400 ${props.className || ''}`}
  />
);

const PrimaryButton = ({ children, disabled, onClick, type = "submit" }: any) => (
  <button 
    type={type}
    disabled={disabled}
    onClick={onClick}
    className="w-full bg-brand hover:bg-brand-dark text-white dark:text-black font-bold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-brand/20 flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
  >
    {disabled ? <Loader2 className="animate-spin" /> : children}
  </button>
);

const CardWrapper = ({ children, title, subtitle, error }: { children?: React.ReactNode, title: React.ReactNode, subtitle?: string, error?: string }) => (
  <div className="w-full max-w-md mx-auto bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#222] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-8 md:p-10">
          <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
              {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>}
          </div>
          {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16}/> {error}
              </div>
          )}
          {children}
      </div>
  </div>
);

interface AuthFlowProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ currentView, setView, onLoginSuccess, onBackToLanding }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', referralCode: '', instituteName: '', instituteLocation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  
  // Logic for discount
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');
  
  const basePrice = 1500;
  const discountAmount = 150;
  const finalPrice = isDiscountApplied ? (basePrice - discountAmount) : basePrice;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(formData.email, formData.password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
      if (!formData.referralCode) return;
      setVerifyingCode(true);
      setError('');
      setDiscountMessage('');
      
      try {
          const result = await validateReferralCode(formData.referralCode);
          if (result.valid) {
              setIsDiscountApplied(true);
              setDiscountMessage(result.message);
          } else {
              setIsDiscountApplied(false);
              setError(result.message);
          }
      } catch (e) {
          setError("Error validating code");
      } finally {
          setVerifyingCode(false);
      }
  };

  const handleSignupUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      console.log('Registering user with:', {
        name: formData.name,
        email: formData.email,
        password: '***',
        role: 'user',
        referralCode: isDiscountApplied ? formData.referralCode : undefined
      });

      const newUser = await registerUser(
        formData.name.trim(), 
        formData.email.trim(), 
        formData.password, 
        'user', 
        isDiscountApplied ? formData.referralCode : undefined
      );
      setTempUserId(newUser.id);
      setView(AppView.PAYMENT);
    } catch (err: any) {
      console.error('Signup error:', err);
      // Handle duplicates nicely
      if (err.message && err.message.toLowerCase().includes('already registered')) {
         setError('This email is already registered. Please login instead.');
      } else {
         setError(err.message || 'Signup failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = await registerUser(formData.name, formData.email, formData.password, 'trainer', '', formData.instituteName, formData.instituteLocation);
      setTempUserId(newUser.id);
      setView(AppView.PAYMENT);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const [senderName, setSenderName] = useState('');
  const [successConfetti, setSuccessConfetti] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!tempUserId) return;
    if (!senderName.trim()) {
        setError('Please enter the name of the account you sent payment from');
        return;
    }
    setLoading(true);
    try {
      await submitPayment(tempUserId, senderName);
      setView(AppView.PENDING_APPROVAL);
      setSuccessConfetti(true);
    } catch (err) {
      setError('Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (currentView === AppView.PENDING_APPROVAL && tempUserId && !isRejected) {
      interval = setInterval(async () => {
        const result = await pollApprovalStatus(tempUserId);
        // Handle result being string or boolean
        const status = typeof result === 'string' ? result : (result ? 'approved' : 'pending');

        if (status === 'approved') {
          clearInterval(interval);
          setApprovalSuccess(true);
          
          // Try to auto-login if we have credentials
          if (formData.email && formData.password) {
             try {
                // Short delay to ensure DB is consistent
                await new Promise(r => setTimeout(r, 1000));
                const loginData = await loginUser(formData.email, formData.password);
                
                // Show success message briefly before redirecting
                setTimeout(() => {
                    onLoginSuccess(loginData);
                }, 2000);
             } catch (err) {
                console.error("Auto-login failed:", err);
                // Even if auto-login fails, UI shows success and user can click login manually if needed (not implemented yet but better than crash)
                setTimeout(() => setView(AppView.LOGIN), 3000);
             }
          } else {
             // No password (refresh case), send to login
             setTimeout(() => setView(AppView.LOGIN), 2500);
          }
        } else if (status === 'rejected') {
            clearInterval(interval);
            setIsRejected(true);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [currentView, tempUserId, setView, onLoginSuccess, formData, isRejected]);

  if (currentView === AppView.LOGIN) {
    return (
      <CardWrapper title={<span>Ex-<span className="text-brand">ZakVibe</span></span>} subtitle="Sign in to your Dashboard" error={error}>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <InputLabel>Email Address</InputLabel>
            <StyledInput type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
                <InputLabel>Password</InputLabel>
                <a href="#" className="text-xs text-brand hover:text-brand-dark font-medium">Forgot Password?</a>
            </div>
            <StyledInput type="password" required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <PrimaryButton disabled={loading}>Sign In</PrimaryButton>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#222] text-center">
             <p className="text-sm text-gray-500 mb-4">Don't have an account?</p>
             <div className="grid grid-cols-2 gap-3 mb-6">
                 <button onClick={() => setView(AppView.SIGNUP_USER)} className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] py-2.5 rounded-lg hover:border-brand hover:text-brand transition">Join as User</button>
                 <button onClick={() => setView(AppView.SIGNUP_TRAINER)} className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] py-2.5 rounded-lg hover:border-brand hover:text-brand transition">Join as Trainer</button>
             </div>
             
             <button onClick={onBackToLanding} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-1 mx-auto">
                 <ArrowLeft size={12} /> Back to Home
             </button>
        </div>
      </CardWrapper>
    );
  }

  if (currentView === AppView.SIGNUP_USER) {
    return (
      <CardWrapper title="Create User Account" subtitle="Start your product research journey" error={error}>
        <form onSubmit={handleSignupUser} className="space-y-5">
          <div>
             <InputLabel>Full Name</InputLabel>
             <StyledInput type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
             <InputLabel>Email Address</InputLabel>
             <StyledInput type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
             <InputLabel>Password</InputLabel>
             <StyledInput type="password" required placeholder="Create a secure password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          {/* Dynamic Code Verification Field */}
          <div>
             <InputLabel>Referral Code (Optional)</InputLabel>
             <div className="relative flex gap-2">
                 <div className="relative flex-1">
                     <Ticket size={16} className="absolute left-3 top-3.5 text-gray-400" />
                     <StyledInput 
                        type="text" 
                        placeholder="EX-1234" 
                        className={`pl-10 uppercase font-mono tracking-widest ${isDiscountApplied ? 'border-green-500 text-green-600 font-bold bg-green-50 dark:bg-green-900/10' : ''}`}
                        value={formData.referralCode} 
                        onChange={e => {
                            setFormData({...formData, referralCode: e.target.value.toUpperCase()});
                            setIsDiscountApplied(false);
                            setDiscountMessage('');
                        }} 
                     />
                 </div>
                 <button 
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || !formData.referralCode}
                    className="bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-white px-4 rounded-lg text-xs font-bold transition disabled:opacity-50"
                 >
                    {verifyingCode ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                 </button>
             </div>
             {discountMessage && (
                 <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                     <CheckCircle size={12} /> {discountMessage}
                 </div>
             )}
          </div>
          
          <PrimaryButton disabled={loading}>
             Proceed to Payment <ArrowRight size={16} />
          </PrimaryButton>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => setView(AppView.LOGIN)} className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Already have an account? Sign In</button>
        </div>
      </CardWrapper>
    );
  }

  if (currentView === AppView.SIGNUP_TRAINER) {
    return (
      <CardWrapper title="Partner Registration" subtitle="Apply to become a certified trainer" error={error}>
        <form onSubmit={handleSignupTrainer} className="space-y-5">
          <div>
             <InputLabel>Full Name</InputLabel>
             <StyledInput type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
             <InputLabel>Email Address</InputLabel>
             <StyledInput type="email" required placeholder="name@institute.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
             <InputLabel>Password</InputLabel>
             <StyledInput type="password" required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <InputLabel>Institute</InputLabel>
               <StyledInput type="text" required placeholder="Tech Academy" value={formData.instituteName} onChange={e => setFormData({...formData, instituteName: e.target.value})} />
            </div>
            <div>
               <InputLabel>City</InputLabel>
               <StyledInput type="text" required placeholder="Lahore" value={formData.instituteLocation} onChange={e => setFormData({...formData, instituteLocation: e.target.value})} />
            </div>
          </div>
          <PrimaryButton disabled={loading}>Submit Application</PrimaryButton>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => setView(AppView.LOGIN)} className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Back to Login</button>
        </div>
      </CardWrapper>
    );
  }

  if (currentView === AppView.PAYMENT) {
    return (
      <CardWrapper title="Complete Subscription" subtitle="Secure payment via JazzCash/EasyPaisa" error={error}>
        <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#222]">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Total Amount</div>
                <div className="text-4xl font-black text-brand flex items-center justify-center gap-1">
                    <span className="text-xl align-top">$</span>{finalPrice} <span className="text-sm text-gray-400 font-medium">PKR</span>
                </div>
                {isDiscountApplied && <div className="text-xs text-green-500 font-bold line-through mt-1 opacity-70">1500 PKR</div>}
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-dashed border-gray-300 dark:border-[#333] mb-6 flex flex-col items-center">
            <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=03200148120" alt="Payment QR" className="w-32 h-32" />
            </div>
            <div className="text-gray-900 dark:text-white font-mono font-bold text-lg tracking-wider mb-1">+92 320 0148120</div>
            <div className="flex gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-wide">
                <span>JazzCash</span> • <span>EasyPaisa</span> • <span>Bank Transfer</span>
            </div>
        </div>
        
        <div className="mb-4">
            <InputLabel>Sender Account Name</InputLabel>
            <StyledInput 
                type="text" 
                placeholder="Name on your EasyPaisa/JazzCash Account" 
                value={senderName} 
                onChange={e => setSenderName(e.target.value)} 
            />
            <p className="text-[10px] text-gray-500 mt-1">Required for verification</p>
        </div>

        <PrimaryButton disabled={loading} onClick={handlePaymentSubmit} type="button">
            <CheckCircle size={18} /> I Have Transferred Funds
        </PrimaryButton>
        
        <div className="mt-4 text-center">
            <button onClick={() => setView(AppView.LOGIN)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">Cancel Payment</button>
        </div>
      </CardWrapper>
    );
  }

  if (currentView === AppView.PENDING_APPROVAL) {
    return (
      <CardWrapper title={approvalSuccess ? "Approved!" : (isRejected ? "Rejected" : "Under Review")} subtitle={approvalSuccess ? "Redirecting..." : (isRejected ? "Access Denied" : "Application submitted successfully")} error={error}>
        {isRejected ? (
             <div className="absolute inset-0 bg-white dark:bg-[#151515] z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Rejected</h3>
                <p className="text-gray-500 text-center mb-6">Your request was declined by the administrator.</p>
                 <button onClick={() => setView(AppView.LOGIN)} className="px-6 py-2 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-sm text-gray-900 dark:text-white rounded-lg font-bold transition">Return to Login</button>
            </div>
        ) : approvalSuccess ? (
             <div className="absolute inset-0 bg-white dark:bg-[#151515] z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Approved!</h3>
                <p className="text-gray-500 text-center mb-6">Your account has been activated. Entering dashboard...</p>
                <div className="w-full bg-gray-100 dark:bg-[#222] h-1.5 rounded-full overflow-hidden w-2/3 mx-auto">
                    <div className="h-full bg-green-500 animate-pulse w-full"></div>
                </div>
            </div>
        ) : (
        <div className="text-center py-6">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Account Pending Approval</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Your application is currently being reviewed by our administration team. 
                <br/>You will receive an email notification once approved.
            </p>
            
            <div className="text-xs text-gray-400 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded">
               Status updates automatically every 5 seconds.
            </div>
        </div>
        )}
      </CardWrapper>
    );
  }

  return null;
};