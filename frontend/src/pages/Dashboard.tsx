// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get the current logged-in user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) console.error('Error fetching user:', error);
      else setUser(user);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Dashboard</h1>
      {user ? (
        <>
          <p className="text-xl">Hello, {user.user_metadata.full_name || user.email}</p>
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
