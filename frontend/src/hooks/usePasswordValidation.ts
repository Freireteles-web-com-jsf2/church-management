import { useState, useEffect, useCallback } from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  };
  requirements: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    noWeakPatterns: boolean;
    noWhitespace: boolean;
    validLength: boolean;
  };
}

export interface UsePasswordValidationOptions {
  validateOnChange?: boolean;
  debounceMs?: number;
}

export const usePasswordValidation = (
  password: string,
  options: UsePasswordValidationOptions = {}
) => {
  const { validateOnChange = true, debounceMs = 300 } = options;
  const { validatePassword, getPasswordStrength } = useLocalAuth();
  
  const [validationResult, setValidationResult] = useState<PasswordValidationResult>({
    isValid: false,
    errors: [],
    strength: {
      score: 0,
      level: 'weak',
      feedback: []
    },
    requirements: {
      minLength: false,
      hasLetter: false,
      hasNumber: false,
      hasSpecialChar: false,
      hasLowercase: false,
      hasUppercase: false,
      noWeakPatterns: false,
      noWhitespace: false,
      validLength: false,
    }
  });

  const [debouncedPassword, setDebouncedPassword] = useState(password);

  // Debounce password input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPassword(password);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [password, debounceMs]);

  const validatePasswordInternal = useCallback((pwd: string): PasswordValidationResult => {
    if (!pwd) {
      return {
        isValid: false,
        errors: [],
        strength: {
          score: 0,
          level: 'weak',
          feedback: []
        },
        requirements: {
          minLength: false,
          hasLetter: false,
          hasNumber: false,
          hasSpecialChar: false,
          hasLowercase: false,
          hasUppercase: false,
          noWeakPatterns: false,
          noWhitespace: false,
          validLength: false,
        }
      };
    }

    const validation = validatePassword(pwd);
    const strength = getPasswordStrength(pwd);

    // Check individual requirements
    const requirements = {
      minLength: pwd.length >= 8,
      hasLetter: /[a-zA-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      noWeakPatterns: !(/(.)\1{2,}/.test(pwd) || /123456|654321|abcdef|qwerty/i.test(pwd) || /password|senha|admin|user|login/i.test(pwd)),
      noWhitespace: pwd === pwd.trim(),
      validLength: pwd.length <= 128,
    };

    return {
      isValid: validation.valid,
      errors: validation.errors || [],
      strength,
      requirements
    };
  }, [validatePassword, getPasswordStrength]);

  // Update validation result when password changes
  useEffect(() => {
    if (validateOnChange) {
      const result = validatePasswordInternal(debouncedPassword);
      setValidationResult(result);
    }
  }, [debouncedPassword, validateOnChange, validatePasswordInternal]);

  // Manual validation function
  const validate = useCallback((pwd?: string) => {
    const passwordToValidate = pwd !== undefined ? pwd : password;
    const result = validatePasswordInternal(passwordToValidate);
    setValidationResult(result);
    return result;
  }, [password, validatePasswordInternal]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const { requirements, strength, isValid, errors } = validationResult;
    
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const totalRequirements = Object.keys(requirements).length;
    
    return {
      isValid,
      errors,
      strength: strength.level,
      score: strength.score,
      progress: (metRequirements / totalRequirements) * 100,
      metRequirements,
      totalRequirements,
      feedback: strength.feedback
    };
  }, [validationResult]);

  // Get requirements status for UI display
  const getRequirementsStatus = useCallback(() => {
    const { requirements } = validationResult;
    
    return [
      { text: 'Pelo menos 8 caracteres', met: requirements.minLength },
      { text: 'Pelo menos uma letra', met: requirements.hasLetter },
      { text: 'Pelo menos um número', met: requirements.hasNumber },
      { text: 'Pelo menos um caractere especial', met: requirements.hasSpecialChar },
      { text: 'Sem padrões fracos', met: requirements.noWeakPatterns },
      { text: 'Sem espaços no início/fim', met: requirements.noWhitespace },
      { text: 'Comprimento válido (≤128)', met: requirements.validLength },
      ...(password.length >= 12 ? [
        { text: 'Pelo menos uma letra minúscula', met: requirements.hasLowercase },
        { text: 'Pelo menos uma letra maiúscula', met: requirements.hasUppercase },
      ] : [])
    ];
  }, [validationResult, password.length]);

  return {
    validationResult,
    validate,
    getValidationSummary,
    getRequirementsStatus,
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    strength: validationResult.strength,
    requirements: validationResult.requirements
  };
};