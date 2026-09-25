/**
 * src/hooks/useGoogleAuth.js
 *
 * Custom hook that encapsulates the entire Google One-Tap / popup
 * credential flow so Login and Register pages share identical logic
 * without any duplication.
 *
 * Usage:
 *   const { handleGoogleSuccess, handleGoogleError, googleLoading, googleError } =
 *     useGoogleAuth({ onSuccess });
 *
 *   <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
 */

import { useState, useCallback } from 'react';
import { useNavigate }           from 'react-router-dom';
import { useAuth }               from '../context/AuthContext';
import { googleLogin }           from '../services/authService';

interface UseGoogleAuthOptions {
  redirectTo?: string;
  onSuccess?: (user: any) => void;
}

const useGoogleAuth = ({ redirectTo = '/', onSuccess }: UseGoogleAuthOptions = {}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError,   setGoogleError]   = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  /**
   * Called by <GoogleLogin onSuccess={...}> with the credential response
   * object from Google Identity Services.
   *
   * @param {import('@react-oauth/google').CredentialResponse} credentialResponse
   */
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setGoogleError('');
    setGoogleLoading(true);

    try {
      // credentialResponse.credential is the raw Google ID token (JWT string)
      const response = await googleLogin(credentialResponse.credential);

      // Persist token + user in AuthContext (and localStorage for rehydration)
      login(response.token, response.user);

      // Optional caller-defined side-effect (e.g. analytics event)
      onSuccess?.(response.user);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setGoogleError(
        err.response?.data?.message ||
        'Google Sign-In failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [login, navigate, redirectTo, onSuccess]);

  /**
   * Called by <GoogleLogin onError={...}> when the Google popup is
   * dismissed or the browser blocks the One-Tap prompt.
   */
  const handleGoogleError = useCallback(() => {
    setGoogleError('Google Sign-In was cancelled or failed. Please try again.');
  }, []);

  /** Clear the error manually (e.g. when the user starts typing). */
  const clearGoogleError = useCallback(() => setGoogleError(''), []);

  return {
    handleGoogleSuccess,
    handleGoogleError,
    clearGoogleError,
    googleLoading,
    googleError,
  };
};

export default useGoogleAuth;
