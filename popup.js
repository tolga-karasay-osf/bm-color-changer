const pattern = /^https:\/\/[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com\/on\/demandware\.store\/Sites-Site.*/;

function removeBMCCClasses(element) {
  element.classList.forEach((className) => {
    if (className.startsWith('bmcc-color-')) {
      element.classList.remove(className);
    }
  });
};

function setColorOnSelection(bgColor, iconColor, isResetButton) {
  // if required page elements are not found, exit the function
  const bmHeader = document.querySelector('.slds-global-header') || document.querySelector('.slds-template_app');
  const bmBadge = document.querySelector('.slds-badge');
  const bmHeaderLogoImage = document.querySelector('.header__logo-image');
  let bmHeaderIcons = document.querySelectorAll('.slds-icon_small');
  if (bmHeaderIcons.length === 0) {
    bmHeaderIcons = document.querySelectorAll('.slds-button_icon-small');
  }

  if (!bmHeader || !bmBadge || !bmHeaderLogoImage || !bmHeaderIcons) {
    return;
  }

  // define optional page element
  const kbdIcon = document.querySelector('.kbdIcon');

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

function initializeColorSelectionButtonsInPopup() {
  // get buttons from the popup window
  const buttons = document.querySelectorAll('.bmcc-button');
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
          function: setColorOnSelection
        });
      });
    });
  }
}

function setInitialColor() {
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

  // get colorValue from local storage and run addColorClasses function
  chrome.storage.local.get([colorKey]).then((result) => {
    const colorValue = result[colorKey];
    if (colorValue && colorValue.bg !== 'default') {
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
  });
}

// Function to send GET request to keep the session alive
function keepSessionAlive() {
  if (window.location.href.match(pattern)) {
    fetch(window.location.href, {
      method: 'GET',
      credentials: 'include' // Include cookies for the request
    })
    .then(response => {
      if (!response.ok) {
        console.log('Failed to keep session alive');
      }
    })
    .catch(error => {
      console.log('Error keeping session alive:', error);
    });
  }
}

function runExtension(){
  if (!window.location.href.match(pattern)) {
    return;
  }
  // Set initial color on page load
  setInitialColor();

  // Keep session alive every 14 minutes if modern UI is enabled
  const isModernUI = document.querySelector('ccbm.ldsbm');
  if (isModernUI) {
    setInterval(keepSessionAlive, 14 * 60 * 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeColorSelectionButtonsInPopup();
});

runExtension();
