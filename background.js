function runExtension() {
  // if required page elements are not found, exit the function
  const bmHeader = document.querySelector('.slds-global-header') || document.querySelector('.slds-template_app');
  const bmBadge = document.querySelector('.slds-badge');
  const bmHeaderLogoImage = document.querySelector('.header__logo-image');
  let bmHeaderIcons = document.querySelectorAll('.slds-icon_small');
  if (bmHeaderIcons.length === 0) {
    bmHeaderIcons = document.querySelectorAll('.slds-button_icon-small');
  }
  if (!bmHeader || !bmBadge || !bmHeaderLogoImage || bmHeaderIcons.length === 0) {
    return;
  }
  // define optional page element
  const kbdIcon = document.querySelector('.kbdIcon');

  // get sandbox ID from URL and define color key
  const sandboxId = window.location.hostname.split('.')[0];
  const colorKey = 'bmcc_' + sandboxId + '_color';

  function setInitialColor(colorValue) {
    bmHeader.classList.add(colorValue.bg);
    bmBadge.classList.add(colorValue.bg);
    bmHeaderLogoImage.classList.add('bmcc-color-filter-cloud');
    bmHeaderIcons.forEach((icon) => {
      icon.classList.add('bmcc-color-fill-' + colorValue.icon);
    });
    if (kbdIcon) {
      kbdIcon.classList.add('bmcc-color-filter-' + colorValue.icon);
    }
  }

  // get colorValue from local storage and run setInitialColor function
  chrome.storage.local.get([colorKey]).then((result) => {
    const colorValue = result[colorKey];
    if (colorValue && colorValue.bg !== 'default') {
      setInitialColor(colorValue);
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(!tabId || !changeInfo || !tab){
    return;
  }

  if (changeInfo.status !== "loading" && changeInfo.status !== "complete"){
    return;
  }

  const pattern = /^https:\/\/[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com\/on\/demandware\.store\/Sites-Site.*/;
  if (!tab.url || !tab.url.match(pattern)) {
    return;
  }

  chrome.tabs.get(tabId, (currentTab) => {
    if (chrome.runtime.lastError || !currentTab) {
      return;
    }

    // Execute the script if the tab is still active
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: runExtension
    });
  });
});
