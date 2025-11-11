import React, { useState, useEffect } from "react";
import { validateToken, saveUserProfile } from "./utils/userProfileUtils";
import Advertisement from "./components/Advertisement";
import AdvertisementPopup from "./components/AdvertisementPopup";
import FrontendLogger from "./components/FrontendLogger";
import Logger from "./components/Logger";
import Home from "./components/Home";

const App = () => {
  const [currentStep, setCurrentStep] = useState("popup"); // Manage the current step in the flow

  useEffect(() => {
    console.log("Current step:", currentStep); // Debug log for state transitions
  }, [currentStep]);

  // Update currentStep after token validation
  useEffect(() => {
    const checkToken = async () => {
      const isValid = await validateToken();
      if (isValid) {
        setCurrentStep("frontendLogger"); // Transition to the next step if the token is valid
      } else {
        // If we're deployed to Netlify (or the admin enabled the force flag),
        // load a safe demo user so the site shows a working demo without auth.
        const forceDemo = process.env.REACT_APP_FORCE_DEFAULT_USER === "true";
        const onNetlify = typeof window !== "undefined" && window.location.hostname.includes("netlify.app");
        if (forceDemo || onNetlify) {
          const demo = {
            username: "demo",
            weight: 70,
            height: 170,
            bmi: (70 / ((1.7 * 1.7))).toFixed(2),
          };
          try {
            // store demo profile and a placeholder token so other code can operate
            saveUserProfile(demo);
            localStorage.setItem("token", "__demo__");
          } catch (e) {
            console.warn("Could not save demo profile to localStorage", e);
          }
          setCurrentStep("frontendLogger");
        } else {
          setCurrentStep("login"); // Redirect to login if the token is invalid
        }
      }
    };

    checkToken();
  }, []);

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
        />
      )}
      {currentStep === "logger" && <Logger />}
    </div>
  );
};

export default App;
