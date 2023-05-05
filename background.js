function runExtension() {
  const bmHeader = document.querySelector('.slds-global-header');
  const bmBadge = document.querySelector('.slds-badge');
  const bmHeaderLogoImage = document.querySelector('.header__logo-image');
  const bmHeaderIcons = document.querySelectorAll('.slds-icon_small');
  const kbdIcon = document.querySelector('.kbdIcon');

  if (!bmHeader || !bmBadge || !bmHeaderLogoImage || !bmHeaderIcons) {
    return;
  }

  const sandboxId = window.location.hostname.split('.')[0];
  const colorKey = 'bmcc_' + sandboxId + '_color';
  function setColor() {
    if (bmHeader) {
      chrome.storage.local.get([colorKey], (data) => {
        bmHeader.classList.add(data[colorKey].bg);
        bmBadge.classList.add(data[colorKey].bg);
        bmHeaderLogoImage.classList.add('bmcc-color-filter-cloud');
        bmHeaderIcons.forEach((icon) => {
          icon.classList.add('bmcc-color-fill-' + data[colorKey].icon);
        });

        if (kbdIcon) {
          kbdIcon.classList.add('bmcc-color-filter-' + data[colorKey].icon);
        }
        console.log(kbdIcon, 'bmcc-color-filter-' + data[colorKey].icon)
        console.log('color set to: ' + data[colorKey]);
        const sandboxId = window.location.hostname.split('.')[0];
        console.log(sandboxId);
      });
    }
  }

  chrome.storage.local.get([colorKey]).then((result) => {
    console.log('Value currently is ' + result[colorKey]);
    const colorValue = result[colorKey];
    console.log(colorValue);
    if (colorValue && colorValue.bg !== 'default') {
      setColor();
    }
  });
}

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  var pattern = /^https:\/\/[a-z]+-[0-9]+\.dx\.commercecloud\.salesforce\.com\/.*/;
  if (!tab.url.match(pattern) || changeInfo.status === undefined) {
    return;
  }

  console.log('change info: ' + changeInfo.status);
  chrome.scripting.executeScript({
    target: { tabId: tabID },
    function: runExtension
  });
});
