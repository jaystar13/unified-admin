import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: ko });
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const formatGameDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) {
    return '오늘';
  }
  if (isTomorrow(d)) {
    return '내일';
  }
  if (isYesterday(d)) {
    return '어제';
  }

  return format(d, 'M월 d일 (E)', { locale: ko });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}:${minutes}`;
};

export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(d, 'M월 d일');
};
