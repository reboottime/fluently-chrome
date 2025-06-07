document.getElementById('save').addEventListener('click', () => {
  const toggle = document.getElementById('toggleFeature').checked;
  chrome.storage.sync.set({ featureEnabled: toggle }, () => {
    alert('Settings saved!');
  });
});
