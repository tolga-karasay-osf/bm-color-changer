const circles = document.querySelectorAll('.color-circle');

circles.forEach((circle, index) => {
  circle.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    var circleColor = circle.style.backgroundColor;
    var resetToDefault = index === 0 ? true : false;
    chrome.scripting.executeScript({
      args: [circleColor, resetToDefault],
      target: { tabId: tab.id },
      function: setColor
    });
  });
});

function setColor(circleColor, resetToDefault) {
  // if hostname does not match the pattern, exit the function
  const hostname = window.location.hostname;
  const pattern = /^[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com/;
  if (!hostname.match(pattern)) {
    return;
  }

  // if required page elements are not found, exit the function
  const bmHeader = document.querySelector('.slds-global-header');
  const bmBadge = document.querySelector('.slds-badge');
  const bmHeaderLogoImage = document.querySelector('.header__logo-image');
  const bmHeaderIcons = document.querySelectorAll('.slds-icon_small');
  if (!bmHeader || !bmBadge || !bmHeaderLogoImage || !bmHeaderIcons) {
    return;
  }

  // set color for the current sandbox in local storage
  // key format: bmcc_[sandboxId]_color
  // example: bmcc_abc-123_color
  const sandboxId = hostname.split('.')[0];
  const colorKey = 'bmcc_' + sandboxId + '_color';
  if (resetToDefault) {
    chrome.storage.local.set({ [colorKey]: 'default' }, () => {});
  } else {
    chrome.storage.local.set({ [colorKey]: circleColor }, () => {});
  }

  // set color theme for the current sandbox in the page
  // if resetToDefault is true, set colors to default BM theme
  // if resetToDefault is false, set colors to selected theme
  if (resetToDefault) {
    bmHeader.style.removeProperty('background-color');
    bmBadge.style.backgroundColor = 'rgb(81, 79, 77)';
    bmHeaderLogoImage.style.removeProperty('filter');
    bmHeaderIcons.forEach((icon) => {
      icon.style.removeProperty('fill');
    });
  } else {
    bmHeader.style.backgroundColor = circleColor;
    bmBadge.style.backgroundColor = circleColor;
    bmHeaderLogoImage.style.filter = 'invert(50%) brightness(2)';
    bmHeaderIcons.forEach((icon) => {
      icon.style.fill = '#555';
    });
  }

  // if optional page element is not found, exit the function
  const kbdIcon = document.querySelector('.kbdIcon');
  if (!kbdIcon) {
    return;
  }

  // set color for the optional page element in the page
  // if resetToDefault is true, set color to default BM theme
  // if resetToDefault is false, set color to selected theme
  if (resetToDefault) {
    kbdIcon.style.removeProperty('filter');
  } else {
    kbdIcon.style.filter = 'invert(50%) brightness(0.7)';
  }
}
