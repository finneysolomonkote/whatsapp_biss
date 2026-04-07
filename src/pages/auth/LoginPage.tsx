import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { MessageSquare, Sparkles, Mail, Lock } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../../lib/dummyData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtNiA0LTEwIDEwLTEwczEwIDQgMTAgMTAtNCAxMC0xMCAxMC0xMC00LTEwLTEwek0wIDEwYzAtNiA0LTEwIDEwLTEwczEwIDQgMTAgMTAtNCAxMC0xMCAxMC0xMC00LTEwLTEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="gradient-primary p-4 rounded-2xl shadow-lg shadow-purple-500/50">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">Continue to your dashboard</p>
        </div>

        <div className="glass-effect rounded-2xl shadow-2xl border border-white/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start space-x-2 animate-pulse">
                <div className="flex-shrink-0 mt-0.5">⚠️</div>
                <div>{error}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-white py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500 font-medium">Or try demo</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 hover:from-amber-200 hover:via-yellow-200 hover:to-orange-200 text-gray-900 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Try Demo Account</span>
          </button>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};
