// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [serverMessage, setServerMessage] = useState<string>('Pinging server...');

  useEffect(() => {
    // Get logged-in user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) console.error('Error fetching user:', error);
      else setUser(user);
    });
  }, []);

  useEffect(() => {
    // Ping server only if user is set (so we have token)
    if (!user) return;

    const pingServer = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      try {
        const res = await fetch('http://localhost:3000/api/protected', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setServerMessage(data.message); // Should say: Hello user@example.com
        } else {
          setServerMessage(`Error: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
        setServerMessage('Error: Could not reach server');
      }
    };

    pingServer();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Dashboard</h1>

      {user ? (
        <>
          <p className="text-xl mb-2">Hello, {user.user_metadata.full_name || user.email}</p>
          <p className="text-green-600 mb-4">{serverMessage}</p>
          <button onClick={() => supabase.auth.signOut().then(() => location.href = '/')}>
            Logout
          </button>
        </>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}
