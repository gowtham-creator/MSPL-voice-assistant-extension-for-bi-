links = {
  "sales revenue dashboard":
    "https://app.powerbi.com/groups/me/reports/07353a90-7b2a-44fe-92d3-d6b8565fa43e/ReportSection8da7d6bdc07307d92cd8?experience=power-bi",
  "production dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSection0b965e5f0ff4c1d12917?experience=power-bi",
  "cost analysis dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSection76e661661e1efa82616c?experience=power-bi",
  "raw material dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSectionfbdc3e3fdaae956b9024?experience=power-bi",
};

function getLinks(name) {
  if (name.includes("sales revenue dashboard")) {
    return `${links["sales revenue dashboard"]}`;
  } else if (name.includes("production dashboard")) {
    return `${links["production dashboard"]}`;
  } else if (name.includes("cost analysis dashboard")) {
    return `${links["cost analysis dashboard"]}`;
  } else if (name.includes("raw material dashboard")) {
    return `${links["raw material dashboard"]}`;
  } else {
    return null;
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("chrome://")) {
    chrome.tabs.create({ url: "https://mspl-1-c9455971.deta.app" });
    chrome.tts.speak("Click on the extension icon to get started");
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let link = "";

  if (request && request.text) {
    link = getLinks(request.text.toLowerCase());
    if (link) {
      chrome.tabs.create({ url: link });
      link = `Opening ${request.text}`;
    } else {
      link = "Sorry, I didn't get that";
    }
  }
  sendResponse({ message: link });
  return true;
});
