/**
 * Cek apakah user dengan role tertentu boleh mengakses halaman dengan level akses minimum.
 * role kecil (1) artinya punya akses lebih tinggi (admin), role besar (3) artinya lebih terbatas.
 */
export const hasAccess = (userRole, minRequiredRole) => {
  if (userRole === 0) return true; // Superadmin, bisa akses semua
  return userRole <= minRequiredRole;
};