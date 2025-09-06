import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BouncingLoader from '../components/BouncingLoader';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => Promise<any>;
    onSignUp: (email: string, pass: string) => Promise<any>;
    t: (key: string) => string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, t }) => {
    const [email, setEmail] = useState('test@yoyo.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isSignUp) {
                await onSignUp(email, password);
            } else {
                await onLogin(email, password);
            }
        } catch (err: any) {
            let message = err.message || 'An unknown error occurred.';
            // Improve Firebase error messages for users
            if (message.includes('auth/email-already-in-use')) {
                message = 'This email is already in use. Please log in or use a different email.';
            } else if (message.includes('auth/wrong-password') || message.includes('auth/user-not-found') || message.includes('auth/invalid-credential')) {
                message = 'Invalid email or password. Please try again.';
            } else if (message.includes('auth/weak-password')) {
                message = 'Password should be at least 6 characters.';
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-primary">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-dark-secondary"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">ProjectHub</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t(isSignUp ? 'signUpTitle' : 'loginTitle')}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={t('email')} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={t('password')} />
                        </div>
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 h-10 items-center">
                            {isLoading ? <BouncingLoader /> : t(isSignUp ? 'signUp' : 'logIn')}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-medium text-primary hover:text-primary-dark focus:outline-none">
                        {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
