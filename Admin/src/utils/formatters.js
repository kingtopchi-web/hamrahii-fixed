export const formatUserName = (user) => {
  if (!user) return 'NA';
  const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : '';
  const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  if (typeof user.name === 'string' && user.name.trim()) return user.name.trim();
  return 'NA';
};

export const formatUserEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'NA';
  }
  return email.trim();
};
