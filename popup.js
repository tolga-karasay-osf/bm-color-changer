// get buttons from the popup window
const buttons = document.querySelectorAll('.bmcc-button');
const pattern = /^https:\/\/[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com\/on\/demandware\.store\/Sites-Site\/default\/.*/;

// add click event listener to each button
if (buttons) {
  buttons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.match(pattern)) {
        return;
      }
      const bgColor = button.classList[0];
      const iconColor = button.dataset.iconcolor;
      const isResetButton = index === 0 ? true : false;
      chrome.scripting.executeScript({
        args: [bgColor, iconColor, isResetButton],
        target: { tabId: tab.id },
        function: setColor
      });
    });
  });
}

function setColor(bgColor, iconColor, isResetButton) {
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

  // Define the function to remove previously assigned BMCC Classes
  const removeBMCCClasses = (element) => {
    element.classList.forEach((className) => {
      if (className.startsWith('bmcc-color-')) {
        element.classList.remove(className);
      }
    });
  };

  // Remove previously assigned BMCC Classes
  removeBMCCClasses(bmHeader);
  removeBMCCClasses(bmBadge);
  removeBMCCClasses(bmHeaderLogoImage);
  bmHeaderIcons.forEach((icon) => {
    removeBMCCClasses(icon);
  });
  if (kbdIcon) {
    removeBMCCClasses(kbdIcon);
  }

  // set color for the current sandbox in local storage
  // key format: bmcc_[sandboxId]_color
  // example: bmcc_abc-123_color
  const hostname = window.location.hostname;
  const sandboxId = hostname.split('.')[0];
  const colorKey = 'bmcc_' + sandboxId + '_color';
  if (isResetButton) {
    chrome.storage.local.set({ [colorKey]: { bg: 'default', icon: 'default' } }, () => {});
    return;
  } else {
    chrome.storage.local.set({ [colorKey]: { bg: bgColor, icon: iconColor } }, () => {});
  }

  // Set color for the page
  bmHeader.classList.add(bgColor);
  bmBadge.classList.add(bgColor);
  bmHeaderLogoImage.classList.add('bmcc-color-filter-cloud');
  bmHeaderIcons.forEach((icon) => {
    icon.classList.add('bmcc-color-fill-' + iconColor);
  });
  if (kbdIcon) {
    kbdIcon.classList.add('bmcc-color-filter-' + iconColor);
  }
}
