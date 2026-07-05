export const PHONE_FORMAT_ERROR = 'Số điện thoại không đúng định dạng.';
export const EMPLOYEE_DATE_ERROR = 'Ngày sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm.';

export const isValidVietnamPhoneNumber = (value) => /^(0\d{9}|\+84\d{9})$/.test(String(value || '').trim());

export const countryDialOptions = [
  { code: 'BN', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1e7-1f1f3.svg', name: 'Brunei', dialCode: '+673', minLength: 7, maxLength: 7, example: '7123456' },
  { code: 'KH', flagUrl: 'https://emojigraph.org/media/apple/flag-cambodia_1f1f0-1f1ed.png', name: 'Campuchia', dialCode: '+855', minLength: 8, maxLength: 9, example: '12345678' },
  { code: 'TL', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f9-1f1f1.svg', name: 'Timor-Leste', dialCode: '+670', minLength: 7, maxLength: 8, example: '77123456' },
  { code: 'ID', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1ee-1f1e9.svg', name: 'Indonesia', dialCode: '+62', minLength: 9, maxLength: 12, example: '8123456789' },
  { code: 'LA', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f1-1f1e6.svg', name: 'Lào', dialCode: '+856', minLength: 8, maxLength: 10, example: '2055123456' },
  { code: 'MY', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f2-1f1fe.svg', name: 'Malaysia', dialCode: '+60', minLength: 9, maxLength: 10, example: '123456789' },
  { code: 'MM', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f2-1f1f2.svg', name: 'Myanmar', dialCode: '+95', minLength: 7, maxLength: 10, example: '912345678' },
  { code: 'PH', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f5-1f1ed.svg', name: 'Philippines', dialCode: '+63', minLength: 10, maxLength: 10, example: '9123456789' },
  { code: 'SG', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f8-1f1ec.svg', name: 'Singapore', dialCode: '+65', minLength: 8, maxLength: 8, example: '81234567' },
  { code: 'TH', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1f9-1f1ed.svg', name: 'Thái Lan', dialCode: '+66', minLength: 9, maxLength: 9, example: '812345678' },
  { code: 'VN', flagUrl: 'https://images.emojiterra.com/google/noto-emoji/unicode-17.0/color/svg/1f1fb-1f1f3.svg', name: 'Việt Nam', dialCode: '+84', minLength: 9, maxLength: 10, example: '0816151762' },
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

export const isValidEmployeeBirthDateAndHireDate = (birthDate, hireDate) => {
  const birthDateValue = new Date(`${birthDate}T00:00:00`);
  const hireDateValue = new Date(`${hireDate}T00:00:00`);
  if (!birthDate || !hireDate || Number.isNaN(birthDateValue.getTime()) || Number.isNaN(hireDateValue.getTime())) {
    return false;
  }

  const today = new Date();
  if (birthDateValue.getFullYear() < 1900 || birthDateValue > today) return false;

  const minimumHireDate = new Date(birthDateValue);
  minimumHireDate.setFullYear(minimumHireDate.getFullYear() + 16);
  return hireDateValue >= minimumHireDate;
};
