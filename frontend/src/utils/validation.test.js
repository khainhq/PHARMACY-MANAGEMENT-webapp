import {
  EMPLOYEE_DATE_ERROR,
  PHONE_FORMAT_ERROR,
  countryDialOptions,
  isValidEmployeeYearAndHireDate,
  isValidInternationalPhoneNumber,
  isValidVietnamPhoneNumber,
  normalizeInternationalPhoneNumber,
} from './validation';

const country = (code) => countryDialOptions.find((option) => option.code === code);

describe('validation helpers', () => {
  test('kiểm tra định dạng số điện thoại Việt Nam', () => {
    expect(isValidVietnamPhoneNumber('0816151762')).toBe(true);
    expect(isValidVietnamPhoneNumber('+84816151762')).toBe(true);
    expect(isValidVietnamPhoneNumber('Lam Dong')).toBe(false);
    expect(isValidVietnamPhoneNumber('116')).toBe(false);
  });

  test('chấp nhận số điện thoại quốc tế nhập theo định dạng nội địa có số 0 đầu', () => {
    expect(isValidInternationalPhoneNumber('0812345678', country('TH'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('0812345678', country('TH'))).toBe('+66812345678');

    expect(isValidInternationalPhoneNumber('0123456789', country('MY'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('0123456789', country('MY'))).toBe('+60123456789');

    expect(isValidInternationalPhoneNumber('09123456789', country('PH'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('09123456789', country('PH'))).toBe('+639123456789');
  });

  test('chấp nhận số quốc tế có dấu cộng hoặc nhập cả mã quốc gia không có dấu cộng', () => {
    expect(isValidInternationalPhoneNumber('+66 81 234 5678', country('TH'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('+66 81 234 5678', country('TH'))).toBe('+66812345678');

    expect(isValidInternationalPhoneNumber('66812345678', country('TH'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('66812345678', country('TH'))).toBe('+66812345678');

    expect(isValidInternationalPhoneNumber('81234567', country('SG'))).toBe(true);
    expect(normalizeInternationalPhoneNumber('81234567', country('SG'))).toBe('+6581234567');
  });

  test('vẫn từ chối số điện thoại quốc tế sai độ dài', () => {
    expect(isValidInternationalPhoneNumber('0123', country('TH'))).toBe(false);
    expect(isValidInternationalPhoneNumber('1234567890123456', country('TH'))).toBe(false);
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
