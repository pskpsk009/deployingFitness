const USER_PROFILE_KEY = "userProfile";
const API_BASE = process.env.REACT_APP_API_URL || "";

export const saveUserProfile = (profile) => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

// authenticatedFetch no longer performs direct navigation. It returns null on
// missing/invalid tokens so calling code can handle navigation through React.
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found. User is not authenticated.");
    return null;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(
      url.startsWith("http") ? url : `${API_BASE}${url}`,
      { ...options, headers }
    );
    if (response.status === 401 || response.status === 403) {
      console.error("Token is invalid or expired.");
      localStorage.removeItem("token"); // Remove invalid token
      return null;
    }
    return response;
  } catch (error) {
    console.error("Error making authenticated request:", error);
    return null;
  }
};

export const loadUserProfile = async () => {
  // Call /me which returns the profile for the authenticated token
  const response = await authenticatedFetch("/me");
  if (response) {
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    console.error("Failed to fetch user profile. Status:", response.status);
  }
  return { username: "", weight: null, height: null, bmi: null };
};

// validateToken returns true/false and does not navigate. Components should
// perform routing based on the result.
export const validateToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found. User is not authenticated.");
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/validate-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log("Token is valid.");
      return true;
    } else {
      console.error("Token is invalid or expired.");
      localStorage.removeItem("token"); // Remove invalid token
      return false;
    }
  } catch (error) {
    console.error("Error validating token:", error);
    localStorage.removeItem("token"); // Remove token on error
    return false;
  }
};
