/**
 * Utility to clear temporary user session form drafts (Offer Ride, Add Car, etc.)
 * across logout, login, and user transitions.
 * 
 * IMPORTANT: This only removes temporary, uncommitted client-side form drafts.
 * It NEVER deletes user accounts, saved vehicles, database records, tokens,
 * or persistent application preferences.
 */
export const clearUserSessionDrafts = () => {
  try {
    // Temporary Offer Ride form state
    localStorage.removeItem("rideData");
    sessionStorage.removeItem("rideData");

    // Temporary Add Car form draft
    localStorage.removeItem("vehicle_form_draft");
    sessionStorage.removeItem("vehicle_form_draft");

    // Stale frequent routes cache
    localStorage.removeItem("frequentRoutes");
    sessionStorage.removeItem("frequentRoutes");
  } catch (error) {
    console.error("Error clearing user session drafts:", error);
  }
};
