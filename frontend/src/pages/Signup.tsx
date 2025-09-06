import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email to confirm signup!');
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="flex flex-col items-center gap-2 min-h-screen justify-center">
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleEmailSignup}>Sign Up</button>
      <button onClick={handleGoogleSignup}>Sign Up with Google</button>
    </div>
  );
}
