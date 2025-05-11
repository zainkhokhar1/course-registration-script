const { ipcRenderer } = require('electron');

document.getElementById('completeRegistration').addEventListener('click', async () => {
  const misId = document.getElementById('misId').value;
  const password = document.getElementById('password').value;

  console.log("🔘 Button Clicked");
  console.log("MIS ID:", misId, "Password:", password);

  if (misId && password) {
    try {
      const result = await ipcRenderer.invoke('start-registration', misId, password);
      console.log("📥 Received result from main process:", result);
      alert(result.message);
    } catch (error) {
      console.error("❌ Renderer Error:", error);
      alert('An error occurred: ' + error.message);
    }
  } else {
    alert('Please enter both MIS ID and Password.');
  }
});
