import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  Building,
  Check,
  X,
  Clock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const SUPPORTED_COUNTRY_OPTIONS = [
  { code: '+63', country: 'Philippines', flag: '🇵🇭', placeholder: '9171234567' },
  { code: '+1', country: 'US / Canada', flag: '🇺🇸', placeholder: '4155552671' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', placeholder: '91234567' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', placeholder: '7911123456' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', placeholder: '412345678' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', placeholder: '9012345678' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', placeholder: '51234567' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', placeholder: '501234567' },
];

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmailValue, setVerifiedEmailValue] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isOtpPanelOpen, setIsOtpPanelOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(0);     // 60s cooldown
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // General Form Errors / Loading
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Email Gmail-Only Check
  const isGmail = useMemo(() => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
  }, [email]);

  const emailErrorMessage = useMemo(() => {
    if (!email) return null;
    if (email.includes('@') && !email.toLowerCase().endsWith('@gmail.com')) {
      return 'Registration is restricted to valid Gmail addresses ending in @gmail.com.';
    }
    if (!isGmail) {
      return 'Please enter a valid Gmail address (e.g. yourname@gmail.com).';
    }
    return null;
  }, [email, isGmail]);

  // Reset verification if email changes
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (isEmailVerified && newEmail !== verifiedEmailValue) {
      setIsEmailVerified(false);
      setVerifiedEmailValue('');
      setIsOtpPanelOpen(false);
      setOtpCode('');
    }
  };

  // 2. OTP Countdown Timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpPanelOpen && otpTimerSeconds > 0 && !isEmailVerified) {
      interval = setInterval(() => {
        setOtpTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpPanelOpen, otpTimerSeconds, isEmailVerified]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 3. Request OTP
  const handleSendOtp = async () => {
    if (!isGmail) {
      setFormError('Please enter a valid Gmail address ending in @gmail.com.');
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);
    setFormError(null);

    try {
      await authApi.sendOtp(email.trim());
      setIsOtpPanelOpen(true);
      setOtpTimerSeconds(600);
      setResendCooldown(60);
      setOtpCode('');
    } catch (err: any) {
      // Extract remaining cooldown if returned from backend 429
      const remaining = err.data?.error?.details?.remainingCooldown;
      if (typeof remaining === 'number' && remaining > 0) {
        setResendCooldown(remaining);
      }

      const errorMessage = err.message || 'Failed to send verification code. Please try again.';

      if (err.status === 409) {
        // Genuine existing account conflict
        setFormError(errorMessage);
        if (isOtpPanelOpen) setOtpError(errorMessage);
      } else if (err.status === 429) {
        // Cooldown or rate-limit violation
        setFormError(errorMessage);
        if (isOtpPanelOpen) setOtpError(errorMessage);
      } else {
        setFormError(errorMessage);
        if (isOtpPanelOpen) setOtpError(errorMessage);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 4. Verify OTP Code
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await authApi.verifyOtp(email.trim(), otpCode.trim());
      setIsEmailVerified(true);
      setVerifiedEmailValue(email.trim());
      if (res.verificationToken) {
        setVerificationToken(res.verificationToken);
      }
      setIsOtpPanelOpen(false);
    } catch (err: any) {
      if (err.status === 410) {
        setOtpError('Verification code has expired. Please request a new code.');
      } else if (err.status === 429) {
        setOtpError(err.message || 'Too many attempts. Please request a new code.');
      } else {
        setOtpError(err.message || 'Incorrect verification code. Please try again.');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 5. Phone Validation
  const phoneValidation = useMemo(() => {
    const cleanDigits = phone.replace(/[\s\-_()]/g, '');
    if (!cleanDigits) {
      return { isValid: false, error: null };
    }

    if (countryCode === '+63') {
      if (cleanDigits.startsWith('0')) {
        return {
          isValid: false,
          error: 'Invalid Philippine mobile number. Enter 10 digits after +63 without the leading 0. Example: 9171234567',
        };
      }
      if (!/^\d+$/.test(cleanDigits)) {
        return { isValid: false, error: 'Mobile number must contain only digits.' };
      }
      if (cleanDigits.length !== 10) {
        return {
          isValid: false,
          error: `Philippine mobile number must be exactly 10 digits (currently ${cleanDigits.length}). Example: 9171234567`,
        };
      }
      if (!cleanDigits.startsWith('9')) {
        return { isValid: false, error: 'Philippine mobile number must begin with 9 (e.g. 9171234567).' };
      }
      return { isValid: true, error: null };
    }

    if (!/^\d{7,15}$/.test(cleanDigits)) {
      return { isValid: false, error: 'Phone number must be between 7 and 15 digits.' };
    }

    return { isValid: true, error: null };
  }, [countryCode, phone]);

  // 6. Live Password Criteria
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  const isPasswordStrong = useMemo(() => {
    return Object.values(passwordCriteria).every(Boolean);
  }, [passwordCriteria]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return null;
    if (passwordScore <= 2) return { label: 'Weak password', color: 'text-rose-600 dark:text-rose-400' };
    if (passwordScore === 3) return { label: 'Fair', color: 'text-amber-600 dark:text-amber-400' };
    if (passwordScore === 4) return { label: 'Good', color: 'text-sky-600 dark:text-sky-400' };
    return { label: 'Strong password', color: 'text-emerald-600 dark:text-emerald-400' };
  }, [password, passwordScore]);

  // 7. Confirm Password Match
  const isConfirmPasswordMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // 8. Master Form Valid State
  const isFormComplete = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isGmail &&
      isEmailVerified &&
      phoneValidation.isValid &&
      isPasswordStrong &&
      confirmPassword.length > 0 &&
      confirmPassword === password
    );
  }, [
    firstName,
    lastName,
    isGmail,
    isEmailVerified,
    phoneValidation.isValid,
    isPasswordStrong,
    confirmPassword,
    password,
  ]);

  // 9. Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await registerAuth({
        email: email.trim(),
        password,
        confirmPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        countryCode,
        phone: phone.trim(),
        companyName: companyName.trim() || undefined,
        verificationToken: verificationToken || undefined,
      });

      navigate('/workspaces');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountry = SUPPORTED_COUNTRY_OPTIONS.find((c) => c.code === countryCode) || SUPPORTED_COUNTRY_OPTIONS[0];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-background">
      <Card className="w-full max-w-xl shadow-2xl border-border/80 bg-card/90 backdrop-blur-xl my-4">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">Create Your Account</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Verified members gain instant booking privileges & member perks
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {formError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* Email Field with Verification Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Gmail Address (Strictly @gmail.com)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    disabled={isEmailVerified}
                    className={
                      isEmailVerified
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : emailErrorMessage
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {isEmailVerified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {!isEmailVerified ? (
                  <Button
                    type="button"
                    variant={isGmail ? 'primary' : 'outline'}
                    size="md"
                    onClick={handleSendOtp}
                    isLoading={isSendingOtp}
                    disabled={!isGmail || isSendingOtp}
                    className="shrink-0 font-bold px-4 shadow-sm"
                  >
                    Verify
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEmailVerified(false);
                      setVerifiedEmailValue('');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Change
                  </Button>
                )}
              </div>

              {emailErrorMessage && !isEmailVerified && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50">
                  {emailErrorMessage}
                </p>
              )}

              {isEmailVerified && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Gmail address verified successfully.
                </p>
              )}
            </div>

            {/* OTP Code Entry Drawer (when OTP is sent) */}
            {isOtpPanelOpen && !isEmailVerified && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3 duration-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Enter Verification Code
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimer(otpTimerSeconds)}</span>
                  </div>
                </div>

                {otpError && (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium animate-in fade-in-50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-40 sm:w-48 text-center text-xl font-mono tracking-widest font-black rounded-xl border border-border bg-background py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleVerifyOtp}
                    isLoading={isVerifyingOtp}
                    disabled={otpCode.length !== 6 || isVerifyingOtp}
                    className="font-bold shrink-0"
                  >
                    Verify Code
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/50">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || isSendingOtp}
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Country Calling Code & Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                {/* Country Code Dropdown */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-card/80 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0"
                >
                  {SUPPORTED_COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.country} ({c.code})
                    </option>
                  ))}
                </select>

                {/* Local Phone Digits Input */}
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    placeholder={selectedCountry.placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="h-4 w-4" />}
                    className={
                      phone && !phoneValidation.isValid
                        ? 'border-destructive focus-visible:ring-destructive'
                        : phone && phoneValidation.isValid
                        ? 'border-emerald-500 focus-visible:ring-emerald-500'
                        : ''
                    }
                    required
                  />
                  {phone && phoneValidation.isValid && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {phone && !phoneValidation.isValid && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50 leading-tight">
                  {phoneValidation.error}
                </p>
              )}
            </div>

            {/* Company / Organization (Optional) */}
            <Input
              label="Company / Organization (Optional)"
              placeholder="Acme Innovations"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building className="h-4 w-4" />}
            />

            {/* Password Input with Live Requirements */}
            <div className="space-y-2">
              <Input
                label="Create Strong Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                className={
                  password && !isPasswordStrong
                    ? 'border-amber-500 focus-visible:ring-amber-500'
                    : password && isPasswordStrong
                    ? 'border-emerald-500 focus-visible:ring-emerald-500'
                    : ''
                }
                required
              />

              {password && passwordStrengthLabel && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className={`font-bold ${passwordStrengthLabel.color}`}>
                    {passwordStrengthLabel.label}
                  </span>
                </div>
              )}

              {/* Password Requirements Live Checklist */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs">
                <div className="font-semibold text-muted-foreground mb-1">Password Requirements:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                    {passwordCriteria.hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                    {passwordCriteria.hasUpper ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                    {passwordCriteria.hasLower ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                    {passwordCriteria.hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    <span>One numeric digit (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'} sm:col-span-2`}>
                    {passwordCriteria.hasSpecial ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    <span>One special character (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                className={
                  confirmPassword && !isConfirmPasswordMatch
                    ? 'border-destructive focus-visible:ring-destructive'
                    : confirmPassword && isConfirmPasswordMatch
                    ? 'border-emerald-500 focus-visible:ring-emerald-500'
                    : ''
                }
                required
              />

              {confirmPassword && !isConfirmPasswordMatch && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50">
                  Passwords do not match.
                </p>
              )}

              {confirmPassword && isConfirmPasswordMatch && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match perfectly.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-primary/25 mt-4"
              isLoading={isSubmitting}
              disabled={!isFormComplete || isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border/60">
            Already a CoSpace member?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
