const generateStimulus = function generateStimulus(imgSrc, activeKeys) {
  const allKeys = ["f", "g", "h", "j"];
  const keyLabels = {
    "f": "A1",
    "g": "A2",
    "h": "A3",
    "j": "A4"
  };

  // Construct the HTML string
  let stimulusHTML = `
    <div style="text-align: center;">
      <img src="${imgSrc}" style="width: 200px; height: 200px; margin-bottom: 30px;">
      <div style="display: flex; justify-content: center; gap: 40px;">
  `;

  for (let key of allKeys) {
    const isActive = activeKeys.includes(key);
    const opacity = isActive ? 1 : 0.3;
    const borderColor = isActive ? '#000' : '#999';

    stimulusHTML += `
      <div style="
        text-align: center;
        font-size: 24px;
        opacity: ${opacity};
        border: 2px solid ${borderColor};
        border-radius: 8px;
        padding: 20px 15px;
        width: 60px;
        box-shadow: ${isActive ? '0 0 10px #333' : 'none'};
      ">
        ${key.toUpperCase()}<br>
      </div>
    `;
  }

  stimulusHTML += `</div></div>`;
  return stimulusHTML;
}
