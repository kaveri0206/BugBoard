import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  LogIn, 
  Code2, 
  CheckSquare 
} from 'lucide-react';
import { ROLES } from '../../config/constants';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: ROLES.DEVELOPER,
  });
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === ROLES.ADMIN) {
      addToast('Security Restriction: Administrator accounts cannot be self-registered.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register(formData);
      const user = res.data.data.user;
      setRegisteredUser(user);
      
      // Open success popup modal
      setSuccessModalOpen(true);
      addToast('Account created successfully! Please sign in.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    setSuccessModalOpen(false);
    navigate('/login');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Create Workspace Account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Join your team as a Software Engineer or QA Specialist.
        </p>
      </div>

      {/* Admin Warning Banner */}
      <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Admin Notice:</strong> System Administrator roles must be provisioned internally by platform leads and cannot be self-registered.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          required
          placeholder="e.g. Marcus Brody"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Corporate Email Address"
          type="email"
          required
          placeholder="developer@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Password (min 6 characters)"
          type="password"
          required
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <Input
          label="Department / Squad"
          required
          placeholder="e.g. Core Infrastructure, Frontend Apps"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />

        <Select
          label="Assigned Engineering Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { label: 'Developer (Software Engineer)', value: ROLES.DEVELOPER },
            { label: 'Tester (QA Automation & SDET)', value: ROLES.TESTER },
          ]}
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
          Create Account &rarr;
        </Button>
      </form>

      <div className="mt-6 text-xs text-center text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-sky-600 hover:underline">
          Sign In
        </Link>
      </div>

      {/* Success Registration Dialog Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={handleProceedToLogin}
        title="Registration Completed"
        maxWidth="max-w-md"
      >
        <div className="py-4 space-y-4 text-center">
          <div className="flex items-center justify-center mx-auto rounded-full shadow-inner w-14 h-14 bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Welcome aboard, {registeredUser?.name}!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Your profile has been created with role clearance:{' '}
              <strong className="text-slate-800">{registeredUser?.role}</strong>.
            </p>
          </div>

          <div className="p-3 space-y-1 text-xs text-left border rounded-lg bg-slate-50 border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Email:</span>
              <span className="font-semibold text-slate-800">{registeredUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Authentication:</span>
              <span className="font-medium text-emerald-600">Ready for Login</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleProceedToLogin}
              className="w-full gap-2 shadow-md bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
            >
              <LogIn size={16} /> Proceed to Sign In
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}