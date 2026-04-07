import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Check } from 'lucide-react';

const INDUSTRIES = [
  'E-commerce',
  'Healthcare',
  'Education',
  'Real Estate',
  'Salon & Beauty',
  'Restaurant & Food',
  'Retail',
  'Professional Services',
  'Other',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');

  const handleBusinessDetails = async () => {
    setLoading(true);
    try {
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name: businessName,
          slug,
          industry,
          phone,
          onboarding_step: 1,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('tenant_members').insert({
        tenant_id: tenant.id,
        user_id: user!.id,
        role: 'owner',
        status: 'active',
      });

      await refreshSession();
      setStep(2);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600">Let's set up your workspace</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-24 h-1 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Business Details
                </h2>
                <p className="text-gray-600">
                  Tell us about your business
                </p>
              </div>

              <Input
                label="Business Name"
                placeholder="Acme Inc"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Business Phone (Optional)"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Button
                onClick={handleBusinessDetails}
                className="w-full"
                loading={loading}
                disabled={!businessName || !industry}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You're all set!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your workspace has been created. Let's explore your dashboard.
                </p>
                <Button onClick={handleComplete} className="w-full">
                  Go to Dashboard
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Next steps:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Connect WhatsApp</p>
                      <p className="text-sm text-gray-600">
                        Link your WhatsApp Business account
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Import Contacts</p>
                      <p className="text-sm text-gray-600">
                        Add your customer contacts to CRM
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Automation</p>
                      <p className="text-sm text-gray-600">
                        Set up auto-replies and workflows
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
