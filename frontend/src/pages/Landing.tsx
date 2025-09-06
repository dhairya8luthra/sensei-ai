import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/signup"><button>Sign Up</button></Link>
    </div>
  );
}
