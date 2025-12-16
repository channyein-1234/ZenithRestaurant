import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // <-- hook to navigate

  const handleLogin = async (e) => {
    e.preventDefault();

    // Login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    // Login successful → redirect to /dashboard
    setMessage(`Welcome back, ${email}`);
    console.log("Logged in user:", data.user);

    navigate("/kitchenDashboard"); // <-- redirect
  };

  return (
    <div className="max-w-md w-full mx-auto mt-6 sm:mt-8 md:mt-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-5 md:mb-6 text-sky-600 text-center">
        Login
      </h2>

      <form className="flex flex-col gap-3 sm:gap-4 md:gap-5" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 sm:p-3 md:p-4 rounded focus:outline-sky-400 text-sm sm:text-base md:text-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 sm:p-3 md:p-4 rounded focus:outline-sky-400 text-sm sm:text-base md:text-lg"
          required
        />
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold p-2 sm:p-3 md:p-4 rounded text-sm sm:text-base md:text-lg"
        >
          Login
        </button>
      </form>

      {message && (
        <p className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg text-red-500 text-center">
          {message}
        </p>
      )}
    </div>
  );
}
