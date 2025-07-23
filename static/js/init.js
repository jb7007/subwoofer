/**
 * Application Initialization Script for Practice Tracker
 *
 * This is the main initialization file that runs on all application pages.
 * It sets up global functionality including modal systems, form handlers,
 * and event listeners that should be available throughout the application.
 *
 * Key Responsibilities:
 * - Initialize modal system for user interactions
 * - Set up form handlers for authentication and logging
 * - Establish global event listeners
 * - Ensure consistent functionality across all pages
 *
 * This script is loaded and executed on every page to provide a consistent
 * base layer of functionality for the entire application.
 */

// Import core setup functions for modals and forms
import {
	setupSignupForm, // Initialize user registration form
	setupLoginForm, // Initialize user authentication form
	setupLogForm, // Initialize practice log entry form
	setupModalListeners, // Initialize modal open/close functionality
} from "./modals/modal-setup.js";

/**
 * Initialize application when DOM is fully loaded.
 *
 * This function runs on every page load and sets up the core functionality
 * that should be available throughout the application. It safely attempts
 * to initialize forms and modals, gracefully handling cases where certain
 * elements may not exist on the current page.
 */
document.addEventListener("DOMContentLoaded", () => {
	// Always set up modal button listeners (signup, login, practice log modals)
	// These buttons may appear on any page, so we always initialize them
	setupModalListeners();

	// Attempt to wire up forms if they exist on the current page
	// These functions will safely do nothing if the forms aren't present

	setupSignupForm(); // Initialize signup form if present (home page)
	setupLoginForm(); // Initialize login form if present (home page)
	setupLogForm(); // Initialize practice log form if present (log page)
});
