import { useState } from 'react';
import axios from 'axios';
import { Github, X, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebaseConfig';

// --- TYPES ---
interface LoginProps {
    onLoginSuccess: (email: string, username: string, token: string) => void;
    API_BASE_URL: string;
}

// --- ONBOARDING MODAL ---
const OnboardingModal = ({ email, onComplete }: { email: string, onComplete: (username: string, token: string) => void }) => {
    const [role, setRole] = useState("Developer");
    const [username, setUsername] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUsername = username || email.split('@')[0];
        onComplete(finalUsername, "REQUIRES_TOKEN_FETCH"); 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Welcome! 🎉</h2>
                <p className="text-gray-600 mb-6 border-b pb-4">Please set up your profile.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                            placeholder="Choose a username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                            <option>Developer</option>
                            <option>Manager</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mt-4">Continue</button>
                </form>
            </div>
        </div>
    );
};


// --- FORGOT PASSWORD MODAL ---
const ForgotPasswordModal = ({ show, onClose, API_BASE_URL }: { show: boolean, onClose: () => void, API_BASE_URL: string }) => {
    const [resetEmail, setResetEmail] = useState("");
    const [resetMsg, setResetMsg] = useState("");
    const [error, setError] = useState("");

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post(`${API_BASE_URL}/api/forgot-password`, { email: resetEmail });
            setResetMsg(res.data.message);
        } catch (err: any) { 
            setError("Error sending link. Email not found."); 
        }
    }

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Reset Password</h2>
                
                {error && <div className="p-3 mb-3 text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
                
                {resetMsg ? (
                    <div className="p-3 mb-3 text-green-700 bg-green-50 rounded-lg border border-green-100">{resetMsg}</div>
                ) : (
                    <p className="text-sm text-gray-600 mb-4">Enter email address to receive reset instructions.</p>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Email" required />
                    <button type="submit" className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Send Reset Link</button>
                </form>
            </div>
        </div>
    );
};


// --- MAIN LOGIN COMPONENT ---
const Login = ({ onLoginSuccess, API_BASE_URL }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");
  const [socialToken, setSocialToken] = useState(""); // State to temporarily hold token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");

    const endpoint = isRegistering ? `${API_BASE_URL}/api/register` : `${API_BASE_URL}/api/login`;
    const payload = isRegistering ? { email, password, username } : { email, password };

    try {
      const res = await axios.post(endpoint, payload);
      if (isRegistering) {
          setSuccessMsg("Registration Successful! Please login.");
          setIsRegistering(false); 
          setEmail(''); setPassword(''); setUsername('');
      } else {
          const token = res.data.token;
          const uName = res.data.user.username || "User";
          onLoginSuccess(email, uName, token);
      }
    } catch (err: any) { 
        const msg = err.response?.data?.message || "Network Error. Server may be offline.";
        setError(msg); 
    }
  };

  const handleSocialLogin = async (provider: any) => {
    try {
        const res = await signInWithPopup(auth, provider);
        
        let userEmail = res.user.email || `hidden_${res.user.uid}`; 
        
        if (userEmail.startsWith('hidden_')) { 
            setError("Warning: Email is private. Proceeding with UID."); 
        }

        const backendRes = await axios.post(`${API_BASE_URL}/api/auth/social`, { email: userEmail });
        
        const token = backendRes.data.token;
        const uName = backendRes.data.user.username || "User";
        
        if (backendRes.data.isNewUser) {
            setFinalEmail(userEmail);
            setSocialToken(token); // Save the valid token temporarily
            setShowOnboarding(true); 
        } else {
            onLoginSuccess(userEmail, uName, token);
        }
    } catch (err: any) {
        if (err.code === 'auth/account-exists-with-different-credential') {
            setError("Account already linked with another provider.");
        } else { setError(err.message || "Social login failed."); }
    }
  }

  const handleOnboardingComplete = (uName: string, dummyToken: string) => {
    setShowOnboarding(false);
    onLoginSuccess(finalEmail, uName, socialToken); 
    setSocialToken(""); // Clear state
  };


  if (showOnboarding) {
      return <OnboardingModal email={finalEmail} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      
      <ForgotPasswordModal show={showForgot} onClose={() => setShowForgot(false)} API_BASE_URL={API_BASE_URL} />

      <div className="w-full max-w-5xl h-[600px] flex rounded-2xl shadow-2xl overflow-hidden border border-white/50">
        
        {/* Left Half: Welcome/Blue Section */}
        <div className="hidden md:flex w-1/2 bg-blue-700 items-center justify-center p-12 text-white">
            <div className="text-center">
                <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
                    Welcome to Nexus
                </h2>
                <p className="text-blue-200 text-lg">
                    Manage your workflows, data pipelines, and jobs efficiently.
                </p>
            </div>
        </div>

        {/* Right Half: Form Section (White/Blur) */}
        <div className="w-full md:w-1/2 p-10 bg-white/90 backdrop-blur-sm flex flex-col justify-center">
            
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {isRegistering ? "Create Account" : "Sign in"}
                </h1>
                <p className="text-gray-500 mt-2">
                    {isRegistering ? "Enter details to create an account" : "Sign in to continue"}
                </p>
            </div>

            {/* --- Social Login Section (Hide on Register) --- */}
            {!isRegistering && (
                <>
                    <div className="space-y-3 mb-6">
                        <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-blue-50 transition-colors shadow-sm bg-white">
                            <span className="text-xl font-bold text-red-500">G</span><span className="font-semibold text-gray-700">Continue with Google</span>
                        </button>
                        <button onClick={() => handleSocialLogin(githubProvider)} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-blue-50 transition-colors shadow-sm bg-white">
                            <Github className="w-6 h-6 text-gray-800" /><span className="font-semibold text-gray-700">Continue with GitHub</span>
                        </button>
                    </div>
                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                </>
            )}
            
            {/* --- Messages & Fixed Placeholder --- */}
            <div className="mb-4 h-12">
                {/* FIX: Error/Success Placeholder for Stability */}
                {error && <div className="p-3 text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
                {successMsg && <div className="p-3 text-green-700 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">{successMsg}</div>}
            </div>
            
            {/* --- Form --- */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 outline-none transition-shadow bg-white" placeholder="johndoe" required />
                  </div>
              )}
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 outline-none transition-shadow bg-white" placeholder="name@company.com" required />
              </div>
              <div>
                  <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      {!isRegistering && <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</button>}
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 outline-none transition-shadow bg-white" placeholder="••••••••" required />
              </div>
              
              <button type="submit" className="w-full p-3 text-lg text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 mt-5">
                  {isRegistering ? "Sign Up" : "Sign In"}
              </button>
            </form>

            {/* --- Toggle Link --- */}
            <div className="mt-6 text-center text-sm">
                {isRegistering ? (
                    <p className="text-gray-600">Already have an account? <button onClick={() => setIsRegistering(false)} className="text-blue-600 font-bold hover:underline">Sign In</button></p>
                ) : (
                    <p className="text-gray-600">Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-blue-600 font-bold hover:underline">Sign Up</button></p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;