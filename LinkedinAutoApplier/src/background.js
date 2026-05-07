// Background script for LinkedIn Auto Applier
// This will handle background tasks like keeping the extension alive or managing cross-origin requests if needed in the future.

chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Auto Applier Pro installed.");
});
