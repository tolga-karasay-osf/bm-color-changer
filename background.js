function runExtension() {
  // if required page elements are not found, exit the function
  const bmHeader = document.querySelector('.slds-global-header');
  const bmBadge = document.querySelector('.slds-badge');
  const bmHeaderLogoImage = document.querySelector('.header__logo-image');
  const bmHeaderIcons = document.querySelectorAll('.slds-icon_small');
  if (!bmHeader || !bmBadge || !bmHeaderLogoImage || !bmHeaderIcons) {
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

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  const pattern = /^https:\/\/[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com\/.*/;
  if (!tab.url.match(pattern) || changeInfo.status === undefined) {
    return;
  }
  chrome.scripting.executeScript({
    target: { tabId: tabID },
    function: runExtension
  });
});
