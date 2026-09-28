/**
 * server/src/controllers/auth.controller.ts
 *
 * Authentication controller handling HTTP request/response with TypeScript.
 */

import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import env from '../config/env';

const COOKIE_NAME = 'hh_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

export const clearAuthCookie = (res: Response): void => {
  const opts = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: (env.isProduction ? 'none' : 'lax') as any,
  };
  res.clearCookie(COOKIE_NAME, opts);
  res.clearCookie('access_token', opts);
  res.clearCookie('refresh_token', opts);
  res.clearCookie('oauth_state', opts);
  res.clearCookie('oauth_nonce', opts);
  res.clearCookie('oauth_redirect_uri', opts);
};

const handleError = (res: Response, error: any): Response => {
  const status = error.statusCode || 500;
  const message = error.message || 'An unexpected error occurred.';

  if (status >= 500) {
    console.error(`[Auth] ${status} —`, error);
  }

  return res.status(status).json({ message });
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const result = await authService.register({ name, email, password });
    setAuthCookie(res, result.token);
    return res.status(201).json({
      message: 'Account created successfully.',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await authService.login({ email, password });
    setAuthCookie(res, result.token);
    return res.json({
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User identifier missing from session.' });
    }
    const user = await authService.getProfile(userId);
    return res.json({ user });
  } catch (err) {
    return handleError(res, err);
  }
};

export const logout = (_req: Request, res: Response): Response => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const result = await authService.forgotPassword(email);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const token = req.params.token as string;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const result = await authService.resetPassword(token, password);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};
