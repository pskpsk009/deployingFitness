import React, { useState, useEffect } from "react";
import { loadUserProfile } from "./utils/userProfileUtils";
import Advertisement from "./components/Advertisement";
import AdvertisementPopup from "./components/AdvertisementPopup";
import FrontendLogger from "./components/FrontendLogger";
import Logger from "./components/Logger";
import Home from "./components/Home";

const App = () => {
  const [currentStep, setCurrentStep] = useState(process.env.REACT_APP_SKIP_POPUP === "true" ? "login" : "popup"); // Manage the current step in the flow
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    console.log("Current step:", currentStep); // Debug log for state transitions
  }, [currentStep]);

  // Load the authenticated profile at app startup and pick initial step
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const profile = await loadUserProfile();
        setUserProfile(profile || null);
        if (profile && profile.username) setCurrentStep("frontendLogger");
        else setCurrentStep("login");
      } catch (err) {
        console.error("Failed to load user profile on startup:", err);
        setCurrentStep("login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Safety: if popup is shown but something blocks progression (e.g. extension CSS),
  // auto-advance to login after a short timeout so the app doesn't stay a white screen.
  useEffect(() => {
    if (currentStep !== "popup") return;
    const fallback = setTimeout(() => {
      console.warn("Popup fallback: switching to login after timeout");
      setCurrentStep("login");
    }, 3000);
    return () => clearTimeout(fallback);
  }, [currentStep]);

  // Add a debugging log to check if the token is retrieved from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on page load:", token); // Debugging log
  }, []);

  const handlePopupClose = () => {
    setCurrentStep("login"); // Transition to the login step
  };

  const handleLogin = () => {
    setCurrentStep("frontendLogger"); // Transition to the FrontendLogger step (we'll render Home which shows Features by default)
  };

  const handleFrontendLoggerComplete = () => {
    // Do not transition away from the Home/Features view when the logger signals completion.
    // Previously this navigated to the separate `Logger` page. Keep the user on the
    // current view so 'Log' actions update in-place instead of navigating.
    console.log("Frontend logger completed — staying on Features/home");
  };

  const handleLogout = () => {
    setCurrentStep("popup"); // Reset to the popup step
  };

  const handleGoBack = () => {
    setCurrentStep("login"); // Navigate back to the login step
  };

  return (
    <div>
      {currentStep === "popup" && (
        <AdvertisementPopup onClose={handlePopupClose} />
      )}
      {currentStep === "login" && <Advertisement onLogin={handleLogin} />}
      {currentStep === "frontendLogger" && (
        <Home
          onComplete={handleFrontendLoggerComplete}
          onLogout={handleLogout}
          onGoBack={handleGoBack}
          loading={loading}
          userProfile={userProfile}
        />
      )}
      {currentStep === "logger" && <Logger />}
    </div>
  );
};

export default App;
