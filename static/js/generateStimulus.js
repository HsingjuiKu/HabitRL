const generateStimulus = function generateStimulus(imgSrc, availableKeys, rewards=null, selectedKey=null, complete_reward=true) {

  // Construct the HTML string
  let stimulusHTML = `
    <div style="text-align: center;">
      <img src="${imgSrc}" style="width: 400px; height: 400px; margin-bottom: 30px;">
    </div>`;
  stimulusHTML += showAvailableKeys(availableKeys, rewards, selectedKey, complete_reward);
  return stimulusHTML;
}

const showAvailableKeys = function showAvailableKeys(availableKeys, rewards=null, selectedKey=null, complete_reward=true){
  
  // Rewards
  htmlString = `<div style="display: flex; justify-content: center; gap: 40px;">`
  for (let key of ["f", "g", "h"]) {
    const isActive = availableKeys.includes(key);
    const opacityFactor = isActive ? 1 : 0.3;
    const r = rewards ? rewards[key] : 'X'

    let opacity;
    if (complete_reward || key === selectedKey) {
      opacity = rewards ? 1 * opacityFactor : 0;
    } else {
      opacity = 0;
    }

    htmlString += `
      <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 70px;
      font-weight: bold;
      opacity: ${opacity};
      border: 2px solid #fff;
      border-radius: 8px;
      padding: 20px 50px;
      width: 60px;
      ">
      ${r}
      </div>`;
  }
  htmlString += `</div><div style="height: 40px;"></div></div>`;

  
  for (let key of ["f", "g", "h"]) {
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
