import {
  EMPLOYEE_DATE_ERROR,
  PHONE_FORMAT_ERROR,
  isValidEmployeeYearAndHireDate,
  isValidVietnamPhoneNumber,
} from './validation';

describe('validation helpers', () => {
  test('kiểm tra định dạng số điện thoại Việt Nam', () => {
    expect(isValidVietnamPhoneNumber('0816151762')).toBe(true);
    expect(isValidVietnamPhoneNumber('+84816151762')).toBe(true);
    expect(isValidVietnamPhoneNumber('Lam Dong')).toBe(false);
    expect(isValidVietnamPhoneNumber('116')).toBe(false);
  });

  test('kiểm tra năm sinh và ngày vào làm của nhân viên', () => {
    expect(isValidEmployeeYearAndHireDate('1992', '2023-12-01')).toBe(true);
    expect(isValidEmployeeYearAndHireDate('2000', '2001-01-01')).toBe(false);
  });

  test('giữ thông báo lỗi tiếng Việt không bị mojibake', () => {
    expect(PHONE_FORMAT_ERROR).toBe('Số điện thoại không đúng định dạng.');
    expect(EMPLOYEE_DATE_ERROR).toContain('Nhân viên phải đủ 16 tuổi');
  });
});
