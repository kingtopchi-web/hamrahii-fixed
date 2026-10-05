/**
 * Profile Image Helper
 * Correctly resolves profile photo URLs whether they are:
 * - Absolute URLs (Cloudinary, Google photo, etc.)
 * - Relative upload paths (/uploads/profile/...)
 * - Missing / undefined (fallback to /default-avatar.jpg)
 */
export const getProfileImageUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
    return '/default-avatar.jpg';
  }

  const trimmed = photoUrl.trim();

  // If already absolute or blob/data URI, return directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Determine base assets URL
  let backendOrigin = '';
  try {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
    if (backendUrl) {
      const parsed = new URL(backendUrl);
      backendOrigin = parsed.origin;
    }
  } catch (e) {
    // ignore
  }

  let assetsBase = (import.meta.env.VITE_ASSETS_URL || '').trim().replace(/\/+$/, '');

  // If assetsBase is localhost but backend is remote (or vice-versa), use backendOrigin
  if (backendOrigin) {
    if (
      !assetsBase ||
      (assetsBase.includes('localhost') && !backendOrigin.includes('localhost')) ||
      (!assetsBase.includes('localhost') && backendOrigin.includes('localhost'))
    ) {
      assetsBase = backendOrigin;
    }
  }

  if (!assetsBase) {
    assetsBase = typeof window !== 'undefined' ? window.location.origin : '';
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${assetsBase}${cleanPath}`;
};

export const getDefaultProfilePhoto = (user) => {
  if (!user) return '/default-avatar.jpg';
  const defaultPhoto =
    user?.profilePhotos?.find((p) => p?.isDefault)?.url ||
    user?.profilePhotos?.[0]?.url ||
    user?.profilePhoto;
  return getProfileImageUrl(defaultPhoto);
};

export const getCarImageUrl = (carOrPhoto) => {
  if (!carOrPhoto) return '/default-car.svg';

  let photoUrl = '';
  if (typeof carOrPhoto === 'string') {
    photoUrl = carOrPhoto;
  } else if (Array.isArray(carOrPhoto?.images) && carOrPhoto.images.length > 0) {
    photoUrl = carOrPhoto.images[0];
  } else if (typeof carOrPhoto?.image === 'string') {
    photoUrl = carOrPhoto.image;
  }

  if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
    return '/default-car.svg';
  }

  const trimmed = photoUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  let backendOrigin = '';
  try {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
    if (backendUrl) {
      const parsed = new URL(backendUrl);
      backendOrigin = parsed.origin;
    }
  } catch (e) {
    // ignore
  }

  let assetsBase = (import.meta.env.VITE_ASSETS_URL || '').trim().replace(/\/+$/, '');
  if (backendOrigin) {
    if (
      !assetsBase ||
      (assetsBase.includes('localhost') && !backendOrigin.includes('localhost')) ||
      (!assetsBase.includes('localhost') && backendOrigin.includes('localhost'))
    ) {
      assetsBase = backendOrigin;
    }
  }

  if (!assetsBase) {
    assetsBase = typeof window !== 'undefined' ? window.location.origin : '';
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${assetsBase}${cleanPath}`;
};

export const getPlateImageUrl = (plateUrl) => {
  if (!plateUrl || typeof plateUrl !== 'string' || plateUrl.trim() === '') {
    return '/default-car.svg';
  }
  return getCarImageUrl(plateUrl);
};
