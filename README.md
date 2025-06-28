# README

## Contents

- [Overview](#overview)
- [1. How to Run the Experiment](#1-how-to-run-the-experiment)
- [2. Project Structure and Flow](#2-project-structure-and-flow)
- [3. Paradigm Design Details](#3-paradigm-design-details)
- [4. How to Customize](#4-how-to-customize)
- [5. Notes](#5-notes)
- [Contact](#contact)

---

## Overview

This project implements a full browser-based cognitive experiment using **jsPsych v8**. It includes training and testing phases with dynamic stimulus display, response tracking, reward mechanisms, and tab-switch monitoring.

You can launch the experiment locally by serving the files with a simple HTTP server.

---

## 1. How to Run the Experiment

### Prerequisites

Modern browser (preferably Chrome).

### Running Locally

Due to browser security restrictions (e.g., CORS), you must run this project on a local server.

#### Using Python (recommended)

Navigate to the project folder and run:

```bash
# For Python 3.x
python -m http.server 8000
```

Then open the experiment in your browser at:

```
http://localhost:8000/index.html
```

You can also use other local server tools such as Node.js, Live Server (VSCode), or `http-server`.

---

## 2. Project Structure and Flow

### Key Files and Modules


| File/Folder                        | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `index.html`                       | Entry point that loads all scripts and initiates the experiment |
| `static/js/createTimeLine.js`      | Generates the jsPsych timeline, handles all experiment phases   |
| `static/js/getTrainingBlockDef.js` | Defines how the training blocks are constructed                 |
| `static/js/generateStimulus.js`    | Defines the HTML used to render each stimulus                   |
| `static/js/endExperimentNow.js`    | Define the function to terminate the experiment early           |
| `static/images/`                   | Folder storing stimulus images                                  |
| `static/images/images.json`        | JSON array listing all image filenames to preload               |

### Flow

1. Images are loaded from `images.json`
2. Timeline is generated using `createTimeLine(imageList)`
3. The timeline includes:
   - Fullscreen and survey intro
   - 8 training blocks (4 per condition)
   - Test block
   - Final save + exit

### Data Saving

At the end, participant data is saved as a CSV file named by ID and date, e.g., `101-20250617.csv`

---

## 3. Paradigm Design Details

### General

- **Actions**: A1, A2, A3, A4
- **Keys**: f, g, h, j (varied via Latin square)
- **Reward Probabilities**:
  - A1: 0.8, A2: 0.2, A3: 0.5, A4: 0.1

### Training Phase

- 8 blocks total
  - 4 blocks: **Condition 1** (low-reward actions require more trials)
  - 4 blocks: **Condition 2** (equal trials per action)
- Each block includes:
  - Forced-choice trials (each action shown 5 times)
  - Two sub-blocks of free choice with action pairings
- Sub-block order and pairings are pseudo-random

### Test Phase

- Each trained image shown multiple times
- Free choice between all actions
- No feedback is given

---

## 4. How to Customize

### Customize Block Design

Search for `REPLACEME` in the source code (e.g., in `getTrainingBlockDef.js`) to find where to modify:

- Reward probabilities
- Action-key mappings
- Sub-block structure

### Customize Stimulus Display

Edit `generateStimulus.js` to:

- Change image presentation
- Highlight available keys
- Adjust styles or layout

### Add More Images

1. Add images to `static/images/`
2. Update `images.json` with new filenames

---

## 5. Notes

- The experiment will automatically exit if the participant switches tabs more than 3 times.
- The cursor is hidden during the task.
- Works only in fullscreen mode for best participant control.

---

## Contact

For questions or collaboration, contact the project maintainer.