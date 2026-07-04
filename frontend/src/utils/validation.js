export const PHONE_FORMAT_ERROR = 'Số điện thoại không đúng định dạng.';
export const EMPLOYEE_DATE_ERROR = 'Năm sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm.';

export const isValidVietnamPhoneNumber = (value) => /^(0\d{9}|\+84\d{9})$/.test(String(value || '').trim());

export const countryDialOptions = [
  { code: 'VN', flag: '🇻🇳', name: 'Việt Nam', dialCode: '+84', minLength: 9, maxLength: 10, example: '0816151762' },
  { code: 'US', flag: '🇺🇸', name: 'Hoa Kỳ', dialCode: '+1', minLength: 10, maxLength: 10, example: '4155552671' },
  { code: 'JP', flag: '🇯🇵', name: 'Nhật Bản', dialCode: '+81', minLength: 10, maxLength: 10, example: '9012345678' },
  { code: 'KR', flag: '🇰🇷', name: 'Hàn Quốc', dialCode: '+82', minLength: 9, maxLength: 10, example: '1012345678' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', dialCode: '+65', minLength: 8, maxLength: 8, example: '81234567' },
  { code: 'TH', flag: '🇹🇭', name: 'Thái Lan', dialCode: '+66', minLength: 9, maxLength: 9, example: '812345678' },
  { code: 'CN', flag: '🇨🇳', name: 'Trung Quốc', dialCode: '+86', minLength: 11, maxLength: 11, example: '13800138000' },
  { code: 'FR', flag: '🇫🇷', name: 'Pháp', dialCode: '+33', minLength: 9, maxLength: 9, example: '612345678' },
  { code: 'DE', flag: '🇩🇪', name: 'Đức', dialCode: '+49', minLength: 10, maxLength: 11, example: '15123456789' },
];

export const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

export const normalizeInternationalPhoneNumber = (value, country = countryDialOptions[0]) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.startsWith('+')) {
    return `+${digitsOnly(raw)}`;
  }

  const nationalNumber = country.code === 'VN'
    ? digitsOnly(raw).replace(/^0/, '')
    : digitsOnly(raw);

  return `${country.dialCode}${nationalNumber}`;
};

export const isValidInternationalPhoneNumber = (value, country = countryDialOptions[0]) => {
  const raw = String(value || '').trim();
  if (!raw) return false;

  if (raw.startsWith('+')) {
    return /^\+\d{7,15}$/.test(normalizeInternationalPhoneNumber(raw, country));
  }

  const digits = digitsOnly(raw);
  if (country.code === 'VN' && /^0\d{9}$/.test(digits)) return true;

  const nationalLength = country.code === 'VN' && digits.startsWith('0')
    ? digits.length - 1
    : digits.length;

  return nationalLength >= country.minLength && nationalLength <= country.maxLength;
};

export const isValidEmployeeYearAndHireDate = (yearOfBirth, hireDate) => {
  const birthYear = Number(yearOfBirth);
  if (!Number.isInteger(birthYear)) return false;

  const hireDateValue = new Date(`${hireDate}T00:00:00`);
  if (!hireDate || Number.isNaN(hireDateValue.getTime())) return false;

  const currentYear = new Date().getFullYear();
  if (birthYear < 1900 || birthYear > currentYear) return false;

  return hireDateValue.getFullYear() - birthYear >= 16;
};
