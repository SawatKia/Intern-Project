import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

import Loading from "../Pages/Loading";
import auth from "../services/authenticationApi";

const ProtectedRoutes = () => {
  const [user, setUser] = useState<boolean>(false); // Use state to hold user state
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isVerify = await auth.verify_credentials(); // Await the promise
        if (isVerify) {
          setUser(true);
        }
      } catch (error) {
        setUser(false); // Set user to false indicating authentication failed
      } finally {
        setLoading(false); // Set loading to false after fetch is complete
      }
    };

    fetchUser(); // Call the asynchronous function
  }, []);

  // Render based on the user state
  if (loading) {
    return <Loading />; // Show a loading indicator while fetching user data
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
