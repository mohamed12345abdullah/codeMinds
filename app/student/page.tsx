



import NavbarPage from '../components/Navbar';

export default function StudentPage() {
  return (
    <div>
      <NavbarPage />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <p className="text-gray-300 mt-2">Welcome to your learning dashboard</p>
      </div>
    </div>
  );
}