// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      alert('Logged in!');
      navigate('/dashboard');  // ✅ redirect to dashboard
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard` // ✅ redirect after Google OAuth
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex flex-col items-center gap-2 min-h-screen justify-center">
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
}
