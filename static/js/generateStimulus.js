const generateStimulus = function generateStimulus(imgSrc, availableKeys, value=null, color=null, fontSize=null) {

  // Construct the HTML string
  let stimulusHTML = `
    <div style="text-align: center; position: relative;">
      <img src="${imgSrc}" style="width: 400px; height: 400px; margin-bottom: 30px;">`
    
  if (value) {  // Add feedback value if required
    stimulusHTML += `<div style="color: ${color}; position: absolute; top: 41%; left: 50%; transform: translate(-50%, -50%); font-size: ${fontSize}px; line-height: 1.5; max-width: 350px; word-wrap: break-word;">${value}</div>`
  }

  stimulusHTML += `
      <div style="display: flex; justify-content: center; gap: 40px;">`;

  stimulusHTML += showAvailableKeys(availableKeys);
  return stimulusHTML;
}

const showAvailableKeys = function showAvailableKeys(availableKeys){
  
  htmlString = ``
  for (let key of ["f", "g", "h", "j"]) {
    const isActive = availableKeys.includes(key);
    const opacity = isActive ? 1 : 0.3;
    const borderColor = isActive ? '#000' : '#999';

    htmlString += `
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
      </div>`;
  }
  htmlString += `</div></div>`;
  return htmlString
}
