import { useState } from 'react';
import axios from 'axios';
import { Github, X, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebaseConfig';

interface LoginProps {
  onLoginSuccess: (email: string, username: string, token: string) => void;
  API_BASE_URL: string;
}

const OnboardingModal = ({ email, onComplete }: { email: string; onComplete: (username: string, token: string) => void }) => {
  const [role, setRole] = useState('Developer');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username || email.split('@')[0];
    onComplete(finalUsername, 'REQUIRES_TOKEN_FETCH');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Welcome! 🎉</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Choose a username"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
            <option>Developer</option>
            <option>Manager</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

const ForgotPasswordModal = ({ show, onClose, API_BASE_URL }: { show: boolean; onClose: () => void; API_BASE_URL: string }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/forgot-password`, { email: resetEmail });
      setMessage(res.data.message);
    } catch {
      setError('Error sending link. Email not found.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Reset Password</h2>
        {error && <div className="p-2 mb-3 text-red-700 bg-red-50 rounded-lg border border-red-100 break-words flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
        {message && <div className="p-2 mb-3 text-green-700 bg-green-50 rounded-lg border border-green-100 break-words">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
};

const Login = ({ onLoginSuccess, API_BASE_URL }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [finalEmail, setFinalEmail] = useState('');
  const [socialToken, setSocialToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const endpoint = isRegistering ? `${API_BASE_URL}/api/register` : `${API_BASE_URL}/api/login`;
    const payload = isRegistering ? { email, password, username } : { email, password };
    try {
      const res = await axios.post(endpoint, payload);
      if (isRegistering) {
        setSuccessMsg('Registration Successful! Please login.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        const token = res.data.token;
        const uName = res.data.user.username || 'User';
        onLoginSuccess(email, uName, token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network Error');
    }
  };

  const handleSocialLogin = async (provider: any) => {
    try {
      const res = await signInWithPopup(auth, provider);
      const userEmail = res.user.email || `hidden_${res.user.uid}`;
      const backendRes = await axios.post(`${API_BASE_URL}/api/auth/social`, { email: userEmail, displayName: res.user.displayName });
      const token = backendRes.data.token;
      const uName = backendRes.data.user.username || 'User';
      if (backendRes.data.isNewUser) {
        setFinalEmail(userEmail);
        setSocialToken(token);
        setShowOnboarding(true);
      } else {
        onLoginSuccess(userEmail, uName, token);
      }
    } catch (err: any) {
      setError(err.message || 'Social login failed.');
    }
  };

  const handleOnboardingComplete = (uName: string) => {
    setShowOnboarding(false);
    onLoginSuccess(finalEmail, uName, socialToken);
    setSocialToken('');
  };

  if (showOnboarding) return <OnboardingModal email={finalEmail} onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <ForgotPasswordModal show={showForgot} onClose={() => setShowForgot(false)} API_BASE_URL={API_BASE_URL} />
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-1/2 bg-blue-700 items-center justify-center p-10 text-white">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-4">Welcome to Nexus</h2>
            <p className="text-blue-200 text-lg">Manage your workflows efficiently.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{isRegistering ? 'Create Account' : 'Sign In'}</h1>
          <p className="text-gray-500 mb-6">{isRegistering ? 'Enter details to create an account' : 'Sign in to continue'}</p>
          {!isRegistering && (
            <>
              <div className="space-y-3 mb-6">
                <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl hover:bg-blue-50 transition-colors">
                  <span className="text-xl font-bold text-red-500">G</span> Continue with Google
                </button>
                <button onClick={() => handleSocialLogin(githubProvider)} className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl hover:bg-blue-50 transition-colors">
                  <Github className="w-6 h-6" /> Continue with GitHub
                </button>
              </div>
              <div className="flex items-center py-2 mb-6">
                <div className="flex-grow border-t border-gray-300" />
                <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-gray-300" />
              </div>
            </>
          )}
          <div className="mb-4 min-h-[48px] break-words">
            {error && <div className="p-2 text-red-700 bg-red-50 rounded-lg border border-red-100">{error}</div>}
            {successMsg && <div className="p-2 text-green-700 bg-green-50 rounded-lg border border-green-100">{successMsg}</div>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" required />}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" required />
            <div className="flex justify-between items-center">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" required />
              {!isRegistering && <button type="button" onClick={() => setShowForgot(true)} className="ml-2 text-sm text-blue-600 hover:text-blue-800">Forgot?</button>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors">{isRegistering ? 'Sign Up' : 'Sign In'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline">{isRegistering ? 'Sign In' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
