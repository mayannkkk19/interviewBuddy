export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getRandomColor = (seed) => {
  const colors = [
    '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b',
    '#ef4444', '#ec4899', '#14b8a6', '#f97316'
  ];
  const index = seed ? seed.length % colors.length : Math.floor(Math.random() * colors.length);
  return colors[index];
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data.message || error.response.statusText || 'Server error';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred.';
};