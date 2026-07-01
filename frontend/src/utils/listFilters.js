const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const hasTimezonePattern = /(Z|[+-]\d{2}:?\d{2})$/i;

const normalizeDateText = (value) => {
  if (value == null) return '';

  const text = String(value).trim();
  if (!text) return '';

  const trimmedFraction = text.replace(/(\.\d{3})\d+/, '$1');

  if (dateOnlyPattern.test(trimmedFraction)) {
    return `${trimmedFraction}T00:00:00+07:00`;
  }

  if (!hasTimezonePattern.test(trimmedFraction)) {
    return `${trimmedFraction}+07:00`;
  }

  return trimmedFraction;
};

export const toVietnamDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalized = normalizeDateText(value);
  if (!normalized) return null;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getVietnamDateKey = (value) => {
  const date = toVietnamDate(value);
  if (!date) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

export const formatVietnamDateTime = (value) => {
  const date = toVietnamDate(value);
  if (!date) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.day}/${dateParts.month}/${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
};

export const formatDateInputValue = (value) => getVietnamDateKey(value);

export const applyListFilters = (
  items,
  {
    keyword = '',
    getSearchText = () => '',
    getDate = () => '',
    sortOrder = 'newest',
    selectedDate = '',
    fromDate = '',
    toDate = '',
  } = {}
) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const searchable = getSearchText(item).toLowerCase();
    const itemDateKey = getVietnamDateKey(getDate(item));

    const matchesKeyword = !normalizedKeyword || searchable.includes(normalizedKeyword);
    const matchesSelectedDate = !selectedDate || itemDateKey === selectedDate;
    const matchesFromDate = !fromDate || (itemDateKey && itemDateKey >= fromDate);
    const matchesToDate = !toDate || (itemDateKey && itemDateKey <= toDate);

    return matchesKeyword && matchesSelectedDate && matchesFromDate && matchesToDate;
  });

  if (!sortOrder) return filtered;

  return [...filtered].sort((left, right) => {
    const leftTime = toVietnamDate(getDate(left))?.getTime() || 0;
    const rightTime = toVietnamDate(getDate(right))?.getTime() || 0;
    return sortOrder === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
  });
};
