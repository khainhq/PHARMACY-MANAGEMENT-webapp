import { applyListFilters, formatVietnamDateTime } from './listFilters';

const records = [
  { id: 'old', name: 'Cũ', date: '2026-05-29T08:00:00' },
  { id: 'target', name: 'Đúng ngày', date: '2026-05-30T09:15:30.1234567' },
  { id: 'new', name: 'Mới', date: '2026-06-01T10:00:00' },
];

describe('listFilters utilities', () => {
  test('định dạng ngày giờ Việt Nam theo ngày/tháng/năm giờ/phút/giây', () => {
    expect(formatVietnamDateTime('2026-05-30T09:15:30.1234567')).toBe('30/05/2026 09:15:30');
  });

  test('lọc đúng một ngày cụ thể', () => {
    const result = applyListFilters(records, {
      selectedDate: '2026-05-30',
      getDate: (record) => record.date,
      getSearchText: (record) => record.name,
    });

    expect(result.map((record) => record.id)).toEqual(['target']);
  });

  test('lọc theo khoảng ngày và sắp xếp mới nhất', () => {
    const result = applyListFilters(records, {
      fromDate: '2026-05-30',
      toDate: '2026-06-01',
      sortOrder: 'newest',
      getDate: (record) => record.date,
      getSearchText: (record) => record.name,
    });

    expect(result.map((record) => record.id)).toEqual(['new', 'target']);
  });

  test('sắp xếp cũ nhất', () => {
    const result = applyListFilters(records, {
      sortOrder: 'oldest',
      getDate: (record) => record.date,
      getSearchText: (record) => record.name,
    });

    expect(result.map((record) => record.id)).toEqual(['old', 'target', 'new']);
  });
});
