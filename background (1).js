powerBILinks = {
  "sales revenue dashboard":
    "https://app.powerbi.com/groups/me/reports/07353a90-7b2a-44fe-92d3-d6b8565fa43e/ReportSection8da7d6bdc07307d92cd8?experience=power-bi",
  "production dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSection0b965e5f0ff4c1d12917?experience=power-bi",
  "cost analysis dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSection76e661661e1efa82616c?experience=power-bi",
  "raw material dashboard":
    "https://app.powerbi.com/groups/me/reports/b5d3ec85-a88d-4241-8dca-61c3852e3f66/ReportSectionfbdc3e3fdaae956b9024?experience=power-bi",
};

const filterKeywords = {
  "raw material dashboard": ["Plant"],
  "sales revenue dashboard": ["Company", "Segment", "Sales Group", "Year"],
};

const filterValues = {
  "raw material dashboard": {
    plant: [
      "Anara",
      "BBSR",
      "Bhurwal",
      "BLSPR CP",
      "BLSPR LL",
      "Gaya",
      "Hubli",
      "Mirza",
      "Pathri",
      "Sholaka",
      "TMQ",
      "Udvada",
      "Wadiyaram",
    ],
  },
  "sales revenue dashboard": {
    company: ["DEW", "ICON", "PRIL"],
    segment: ["Select all", "Other Sales", "Sleeper"],
    "sales group": [
      "Asset Sales",
      "Scrap Sales",
      "Sleeper Sales",
      "Sleeper Transportation Income",
      "Traded Goods Sales",
    ],
    year: ["2022", "2023"],
  },
};

const getPowerBILinks = (name) => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes("sales revenue dashboard")) {
    return `${powerBILinks["sales revenue dashboard"]}`;
  } else if (lowerCaseName.includes("production dashboard")) {
    return `${powerBILinks["production dashboard"]}`;
  } else if (lowerCaseName.includes("cost analysis dashboard")) {
    return `${powerBILinks["cost analysis dashboard"]}`;
  } else if (lowerCaseName.includes("raw material dashboard")) {
    return `${powerBILinks["raw material dashboard"]}`;
  } else {
    return null;
  }
};

const tableNames = {
  "raw material dashboard": "RM_x0020_Price",
  "sales revenue dashboard": "PRILFY2023",
};

const getFilters = (name, filterText) => {
  let filtersToReturn = [];
  const availableFilters = filterKeywords[name].map((filter) =>
    filter.toLowerCase(),
  );
  for (let i = 0; i < availableFilters.length; i++) {
    if (filterText.toLowerCase().includes(availableFilters[i].toLowerCase())) {
      filtersToReturn.push(filterKeywords[name][i]);
    }
  }
  return filtersToReturn;
};

const getFilterValues = (name, filterName, filterText) => {
  const filterValuesToReturn = [];
  const availableFilterValues = filterValues[name][
    filterName.toLowerCase()
  ].map((filterValue) => filterValue.toLowerCase());
  for (let i = 0; i < availableFilterValues.length; i++) {
    if (filterText.toLowerCase().includes(availableFilterValues[i])) {
      filterValuesToReturn.push(filterValues[name][filterName.toLowerCase()][i]);
    }
  }
  return filterValuesToReturn;
};

const addSingleFilter = (link, tableName, filterName, filterValue) => {
  const filter = `&filter=${tableName}/${filterName} eq '${filterValue}'`;
  return `${link}${filter}`;
};

const addMultipleFilter = (link, tableName, filterName, filterValues) => {
  let filter = `&filter=${tableName}/${filterName} in `;
  filter += "(";
  filter += filterValues.map((filterValue) => `'${filterValue}'`).join(",");
  filter += ")";
  return `${link}${filter}`;
};

const addFilters = (link, tableName, filterName, filterValues) => {
  if (filterValues.length <= 1) {
    return addSingleFilter(link, tableName, filterName, filterValues[0]);
  } else {
    return addMultipleFilter(link, tableName, filterName, filterValues);
  }
};

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes("https://mspl-1-c9455971.deta.app")) {
    chrome.tabs.create({ url: "https://mspl-1-c9455971.deta.app" });
    chrome.tts.speak("Click on the extension icon to get started");
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      files: ["content.js"],
    });
  });
});

//?filter=Store/Territory eq 'NC' and Store/Chain eq 'Fashions Direct'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let link;
  if (request && request.text && request.text.includes("filter")) {
    const reportName = request.text
      .slice(5)
      .toLowerCase()
      .split("filter")[0]
      .split("with")[0]
      .trim();
    const reportLink = getPowerBILinks(reportName);
    const filterText = request.text
      .slice(5)
      .toLowerCase()
      .split("filter")[1]
      .trim();
    const tableName = tableNames[reportName];
    const filterName = getFilters(reportName, filterText)[0];
    const filterValues = getFilterValues(reportName, filterName, filterText);
    const newLink = addFilters(reportLink, tableName, filterName, filterValues);
    console.log(reportName);
    console.log(reportLink);
    console.log(tableName);
    console.log(filterName);
    console.log(filterValues);
    console.log(newLink);
    if (newLink) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        if (currentTab.url.includes("https://mspl-1-c9455971.deta.app")) {
          chrome.tabs.create({ url: newLink });
        } else {
          chrome.tabs.update(currentTab.id, { url: newLink });
        }
      });
      link = `Opening ${reportName} with filter ${filterName} as ${filterValues}`;
    } else {
      link = "Sorry, I didn't get that";
    }
  } else if (request && request.text) {
    link = getPowerBILinks(request.text.toLowerCase().slice(5));
    if (link) {
      chrome.tabs.create({ url: link });
      link = `Opening ${request.text.toLowerCase().slice(5)}`;
    } else {
      link = "Sorry, I didn't get that";
    }
  }
  sendResponse({ message: link });
  return true;
});
