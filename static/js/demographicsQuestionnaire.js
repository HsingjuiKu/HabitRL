/**
 * demographicsQuestionnaire.js
 *
 * Post-experiment demographics questionnaire for jsPsych 8.x (script-tag / global usage).
 * Requires:
 *   - jsPsych core (initJsPsych)
 *   - @jspsych/plugin-survey-html-form (global: jsPsychSurveyHtmlForm)
 *   - @jspsych/plugin-call-function (global: jsPsychCallFunction)
 *
 * Exposes:
 *   window.createDemographicsTimelineV8({ jsPsych, redirectUrl, buttonLabel })
 *
 * Data added:
 *   - component: "demographics"
 *   - plus the survey response fields from jsPsychSurveyHtmlForm
 */

(function () {
  function escapeAttr(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function demographicsFormHTML() {
    // Keep names stable: they become keys in data.response
    return `
      <div style="max-width: 900px; margin: 0 auto; text-align: left; line-height: 1.35;">
        <h2>Demographics</h2>
        <p>Please answer the following questions. You may skip any question you prefer not to answer.</p>

        <hr />

        <p>
          <label><strong>Age</strong> (in years)</label><br>
          <input name="age" type="number" min="18" max="120" step="1" style="width: 140px;" />
        </p>

        <p>
          <label><strong>Gender</strong></label><br>
          <select name="gender" style="width: 320px;">
            <option value="" selected>Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="self_describe">Self-describe</option>
          </select>
        </p>

        <p>
          <label><strong>If you selected self-describe, please specify</strong></label><br>
          <input name="gender_self_describe" type="text" style="width: 420px;" />
        </p>

        <p>
          <label><strong>Ethnicity / Race</strong> (optional)</label><br>
          <input name="ethnicity_race" type="text" style="width: 620px;" placeholder="Optional free response" />
        </p>

        <p>
          <label><strong>Highest education completed</strong></label><br>
          <select name="education" style="width: 420px;">
            <option value="" selected>Prefer not to say</option>
            <option value="some_hs">Some high school</option>
            <option value="hs">High school / GED</option>
            <option value="some_college">Some college</option>
            <option value="associate">Associate degree</option>
            <option value="bachelor">Bachelor's degree</option>
            <option value="master">Master's degree</option>
            <option value="doctorate">Doctorate / professional degree</option>
            <option value="other">Other</option>
          </select>
        </p>

        <p>
          <label><strong>Native / fluent English speaker?</strong></label><br>
          <label><input type="radio" name="english_fluent" value="yes"> Yes</label>
          &nbsp;&nbsp;
          <label><input type="radio" name="english_fluent" value="no"> No</label>
          &nbsp;&nbsp;
          <label><input type="radio" name="english_fluent" value="" checked> Prefer not to say</label>
        </p>

        <p>
          <label><strong>Primary language(s)</strong> (optional)</label><br>
          <input name="primary_languages" type="text" style="width: 620px;" placeholder="Optional free response" />
        </p>

        <p>
          <label><strong>Handedness</strong></label><br>
          <select name="handedness" style="width: 320px;">
            <option value="" selected>Prefer not to say</option>
            <option value="right">Right-handed</option>
            <option value="left">Left-handed</option>
            <option value="ambidextrous">Ambidextrous</option>
          </select>
        </p>

        <p>
          <label><strong>Do you have normal or corrected-to-normal vision?</strong></label><br>
          <select name="vision" style="width: 420px;">
            <option value="" selected>Prefer not to say</option>
            <option value="normal">Normal</option>
            <option value="corrected">Corrected (glasses/contacts)</option>
            <option value="not_normal">Not normal / not corrected</option>
          </select>
        </p>

        <p>
          <label><strong>Device used for this study</strong></label><br>
          <select name="device" style="width: 320px;">
            <option value="" selected>Prefer not to say</option>
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
            <option value="tablet">Tablet</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </p>

        <p>
          <label><strong>Any comments?</strong> (optional)</label><br>
          <textarea name="comments" rows="4" style="width: 90%; max-width: 820px;"></textarea>
        </p>

        <hr />

        <p style="opacity: 0.9;">
          Click "Finish" to return to Sona.
        </p>
      </div>
    `;
  }

  window.createDemographicsTimelineV8 = function createDemographicsTimelineV8(opts) {
    opts = opts || {};
    if (!opts.jsPsych) throw new Error("createDemographicsTimelineV8: opts.jsPsych is required.");

    if (typeof jsPsychSurveyHtmlForm === "undefined") {
      throw new Error(
        "createDemographicsTimelineV8: jsPsychSurveyHtmlForm not found. " +
          'Add <script src="https://unpkg.com/@jspsych/plugin-survey-html-form@2.1.0"></script> before this file.'
      );
    }
    if (typeof jsPsychCallFunction === "undefined") {
      throw new Error(
        "createDemographicsTimelineV8: jsPsychCallFunction not found. " +
          'Add <script src="https://unpkg.com/@jspsych/plugin-call-function@2.1.0"></script> before this file.'
      );
    }

    const redirectUrl = opts.redirectUrl || "";
    const buttonLabel = opts.buttonLabel || "Continue";
    const componentTag = opts.componentTag || "demographics";

    const demographicsTrial = {
      type: jsPsychSurveyHtmlForm,
      html: demographicsFormHTML(),
      button_label: buttonLabel,
      data: { component: componentTag },
      on_finish: function (data) {
        save_demo_data_csv();
      }
    };

    const redirectTrial = {
      type: jsPsychCallFunction,
      async: false,
      func: function () {
        if (redirectUrl && typeof redirectUrl === "string") {
          window.location.href = redirectUrl;
        } else {
          // If no URL provided, just end normally.
          opts.jsPsych.endExperiment("Thank you for participating.");
        }
      },
      data: { component: "redirect" }
    };

    return [demographicsTrial, redirectTrial];
  };
})();
