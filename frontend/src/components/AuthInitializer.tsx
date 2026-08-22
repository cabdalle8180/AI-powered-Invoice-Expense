import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { verifySession } from "../features/auth/authSlice";

/**
 * Restores authenticated session on browser refresh when a token exists.
 */
const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(verifySession());
    }
  }, [dispatch, token]);

  return null;
};

export default AuthInitializer;
