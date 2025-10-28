
/**
 * Formats a date value (could be Date, Timestamp, string, or number) into a readable string
 * @param dateValue - The date value to format
 * @param options - Formatting options
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(
  dateValue: any,
  options: {
    includeTime?: boolean;
    relative?: boolean;
  } = {}
): string {
  if (!dateValue) return "N/A";

  let date: Date;

  try {
    // Handle different date formats
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      // Firestore Timestamp
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return "N/A";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    // Handle relative dates
    if (options.relative) {
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      } else {
        return "Just now";
      }
    }

    // Format the date
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (options.includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return "N/A";
  }
}

/**
 * Formats a date for display in pick cards (compact format)
 */
export function formatPickDate(dateValue: any): string {
  return formatDate(dateValue, { includeTime: false });
}

/**
 * Formats a date with time for detailed views
 */
export function formatDateTime(dateValue: any): string {
  return formatDate(dateValue, { includeTime: true });
}

/**
 * Formats a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateValue: any): string {
  return formatDate(dateValue, { relative: true });
}
