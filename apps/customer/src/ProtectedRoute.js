import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const table = params.get("table");
  const token = params.get("token");

  const [isValid, setIsValid] = useState(null); // null = loading, true/false = validated

  useEffect(() => {
    const validateToken = async () => {
      // If either table or token is missing, immediately invalidate
      if (!table || !token || isNaN(parseInt(table))) {
        setIsValid(false);
        return;
      }

      // Query Supabase table_tokens to verify table+token
      const { data, error } = await supabase
        .from("table_tokens")
        .select("*")
        .eq("table_num", parseInt(table))
        .eq("token", token)
        .single();

      if (error || !data) {
        setIsValid(false); // invalid token
      } else {
        setIsValid(true); // valid token
      }
    };

    validateToken();
  }, [table, token]);

  // While checking token, show loading
  if (isValid === null) {
    return <div>Validating table access...</div>;
  }

  // Invalid table or token → redirect to menu
  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  // Token valid → render the protected page
  return children;
}
