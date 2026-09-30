/**
 * src/components/common/LoginPromptModal.tsx
 *
 * Modal that appears when an unauthenticated user clicks on Cart or Wishlist,
 * prompting them to sign in or register to sync real data with the database.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiHeart, FiShoppingBag } from 'react-icons/fi';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cart' | 'wishlist';
  onContinueAsGuest?: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  type,
  onContinueAsGuest,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isCart = type === 'cart';
  const Icon = isCart ? FiShoppingBag : FiHeart;
  const title = isCart ? 'Sign In to View Your Cart' : 'Sign In to View Your Wishlist';
  const description = isCart
    ? 'Sign in to access your saved cart items across devices, view real-time stock, and enjoy secure checkout.'
    : 'Sign in to sync your favorite handcrafted items directly to your personal account.';
  const destination = isCart ? '/cart' : '/wishlist';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#e8d5c0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#6E1717]/10 text-[#6E1717] flex items-center justify-center mx-auto border border-[#6E1717]/20">
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#6E1717]">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed px-2">{description}</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate(`/login?redirect=${destination}`);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6E1717] to-[#C85A2E] hover:from-[#4B0F0F] hover:to-[#6E1717] text-white font-semibold text-xs shadow-md shadow-[#6E1717]/20 transition text-center block"
          >
            Sign In with Email or Google
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-[#e8d5c0] bg-[#FFF8ED] hover:bg-white text-[#6E1717] font-semibold text-xs transition text-center block"
          >
            Create Free Account
          </button>

          {onContinueAsGuest && (
            <button
              onClick={() => {
                onClose();
                onContinueAsGuest();
              }}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 underline font-medium transition"
            >
              Continue as Guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
