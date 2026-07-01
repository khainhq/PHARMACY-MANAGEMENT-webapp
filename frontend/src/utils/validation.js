export const PHONE_FORMAT_ERROR = 'Số điện thoại không đúng định dạng.';
export const EMPLOYEE_DATE_ERROR = 'Năm sinh và ngày vào làm không hợp lệ. Nhân viên phải đủ 16 tuổi vào ngày vào làm.';

export const isValidVietnamPhoneNumber = (value) => /^(0\d{9}|\+84\d{9})$/.test(String(value || '').trim());

export const isValidEmployeeYearAndHireDate = (yearOfBirth, hireDate) => {
  const birthYear = Number(yearOfBirth);
  if (!Number.isInteger(birthYear)) return false;

  const hireDateValue = new Date(`${hireDate}T00:00:00`);
  if (!hireDate || Number.isNaN(hireDateValue.getTime())) return false;

  const currentYear = new Date().getFullYear();
  if (birthYear < 1900 || birthYear > currentYear) return false;

  return hireDateValue.getFullYear() - birthYear >= 16;
};
