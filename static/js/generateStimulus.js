const generateStimulus = function generateStimulus(imgSrc, availableKeys, rewards=null, selectedKey=null) {
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
      <img src="${imgSrc}" style="width: 400px; height: 400px; margin-bottom: 30px;">
    </div>`;
  stimulusHTML += showAvailableKeys(availableKeys, rewards, selectedKey);
  return stimulusHTML;
}

const showAvailableKeys = function showAvailableKeys(availableKeys, rewards=null, selectedKey=null){
  
  // Rewards
  htmlString = `<div style="display: flex; justify-content: center; gap: 40px;">`
  for (let key of ["f", "g", "h", "j"]) {
    const isActive = availableKeys.includes(key);
    const opacityFactor = isActive ? 1 : 0.3;
    const opacity = rewards ? 1 * opacityFactor : 0;
    const r = rewards ? rewards[key] : 'X'
    const fontColor = r == 1 ? 'green' : 'black';

    htmlString += `
      <div style="
        text-align: center;
        font-size: 100px;
        font-weight: bold;
        color: ${fontColor};
        opacity: ${opacity};
        border: 2px solid #fff;
        border-radius: 8px;
        padding: 20px 50px;
        width: 60px;
      ">
        ${r}<br>
      </div>`;
  }
  htmlString += `</div><div style="height: 40px;"></div></div>`;

  
  for (let key of ["f", "g", "h", "j"]) {
    const isActive = availableKeys.includes(key);
    const opacity = isActive ? 1 : 0.3;
    const borderColor = isActive ? '#000' : '#999';
    const fillColor = key == selectedKey ? 'grey' : 'white'

    htmlString += `
      <div style="display: flex; justify-content: center; gap: 40px;">
      <div style="
        text-align: center;
        font-size: 24px;
        opacity: ${opacity};
        border: 2px solid ${borderColor};
        border-radius: 8px;
        padding: 20px 50px;
        width: 60px;
        background-color: ${fillColor};
        box-shadow: ${isActive ? '0 0 10px #333' : 'none'};
      ">
        ${key.toUpperCase()}<br>
      </div>`;
  }
  htmlString += `</div></div></div></div>`;

  return htmlString
}
