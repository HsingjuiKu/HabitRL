/**
 * consent_collins_behavior_v8_global.js
 *
 * For jsPsych 8.x loaded via <script src="https://unpkg.com/jspsych@8.2.1"></script>
 * Uses the global plugin: jsPsychHtmlButtonResponse
 *
 * Adds data:
 *   - consent_given: boolean
 *   - consent_choice: "agree" | "decline"
 *
 * If declined: ends the experiment.
 */

(function () {
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function consentHtml(opts) {
    const studyTitle = escapeHtml(opts.studyTitle);
    const piName = escapeHtml(opts.piName);
    const institution = escapeHtml(opts.institution);

    // Based on the provided consent form PDF. :contentReference[oaicite:0]{index=0}
    return `
      <div style="max-width: 900px; margin: 0 auto; text-align: left; line-height: 1.35;">
        <h2 style="margin-bottom: 0.25rem;">CONSENT TO PARTICIPATE IN RESEARCH</h2>
        <div style="margin-top: 0; opacity: 0.85;">
          <div><strong>${studyTitle}</strong></div>
          <div>${institution}</div>
        </div>

        <hr />

        <div style="border: 1px solid #ddd; border-radius: 10px; padding: 12px; background: #fafafa;">
          <h3 style="margin-top: 0;">Key Information</h3>
          <ul>
            <li>You are being invited to participate in a research study. Participation is completely voluntary.</li>
            <li>The purpose of this research is to study your performance on computerized tasks that investigate learning and goal-oriented behavior.</li>
            <li>The study will take a total of about 1 hour. You will be asked to play computerized tasks and complete a short online questionnaire.</li>
            <li>There are no direct benefits to you, but results may help researchers better understand mechanisms underlying learning and decision-making.</li>
          </ul>
        </div>

        <h3>Introduction</h3>
        <p>My name is ${piName}. I am planning to conduct a research study, and I invite you to take part in it.</p>

        <h3>Purpose</h3>
        <p>
          The purpose of this research project is to study your performance on a series of computerized tasks
          that investigate learning and goal-oriented behavior. Participation is your choice, and you may withdraw at any point.
        </p>

        <h3>Eligibility</h3>
        <p>
          To participate, you must be a native or fluent English speaker, between the ages of 18 and 40,
          and have no medical history of brain injury, mental/psychiatric illness (e.g., Parkinson's Disease,
          Obsessive Compulsive Disorder, Schizophrenia, Depression, or ADD/ADHD), and no drug or alcohol abuse.
        </p>

        <h3>Procedures</h3>
        <ul>
          <li>You will complete a short online questionnaire about yourself. You may be asked for personal information such as ethnicity. You may skip any questions you do not wish to answer.</li>
          <li>You will complete several computerized tasks where you make decisions in response to images on the screen, depending on task instructions.</li>
          <li>After the session, you will receive a debriefing describing research procedures and contact information, and you may ask questions.</li>
        </ul>

        <h3>Study Time</h3>
        <p>Participation involves a maximum of 60 minutes of your time.</p>

        <h3>Benefits</h3>
        <p>
          There are no direct benefits to you. Potential benefits to society include greater understanding of cognitive processes
          involved in learning and decision-making, with possible impacts for understanding mental/psychiatric disorders,
          education and development, and everyday economic decision-making.
        </p>

        <h3>Risks / Discomforts</h3>
        <ul>
          <li>There are no known risks associated with the behavioral measures used in this study.</li>
          <li>You are free to decline to answer any questions you don't wish to, or to stop the study at any time.</li>
          <li>Breach of confidentiality: As with all research, there is a chance that confidentiality could be compromised; precautions are taken to minimize this risk.</li>
        </ul>

        <h3>Confidentiality</h3>
        <p>
          Your study data will be handled as confidentially as possible. If results are published or presented,
          your name and other personally identifiable information will not be used.
        </p>
        <ul>
          <li>Identifiable information is maintained separately and securely. You are assigned a number so your name and data are not linked on study forms.</li>
          <li>Research records (computer-based data, questionnaire answers, demographic information) are stored securely (locked cabinet for physical records; encrypted/password-protected for electronic data).</li>
          <li>Your personal information may be disclosed if required by law.</li>
        </ul>

        <h3>Certificate of Confidentiality</h3>
        <p>
          To help protect your privacy, the researchers have obtained a Certificate of Confidentiality from the National Institutes of Health (NIH).
          With this Certificate, researchers generally cannot be forced to disclose information that may identify you, even by court subpoena,
          in federal, state, or local proceedings.
        </p>
        <p>
          <strong>Exceptions:</strong> The Certificate does not prevent voluntary disclosure for legal or ethical reasons (e.g., reporting child abuse,
          elder abuse, or intent to hurt yourself or others). If you consent in writing to share information with an insurer/employer/other party,
          the Certificate cannot be used to withhold that information. The Certificate also may not be used to withhold information needed by the
          federal government for auditing/evaluation of federally funded projects or by the FDA for quality assurance/data analysis.
        </p>

        <h3>Authorized Review</h3>
        <p>
          Authorized representatives from organizations (including representatives of the University of California, and the FDA/other government agencies
          involved in keeping research safe for people) may review research records for research, quality assurance, and data analysis.
        </p>

        <h3>Future Use of Study Data</h3>
        <p>
          Research data may be maintained indefinitely for possible future research use by the investigator or others working on the study.
          Identifiers (like your name) will be removed. After removal, the information could be used for future studies or shared with other investigators
          without additional informed consent.
        </p>

        <h3>Alternatives to Participation</h3>
        <p>
          As an alternative, you may choose to participate in another RPP study or request a non-RPP alternative research assignment from your course instructor.
          Alternative assignments are estimated to be equivalent in time and effort.
        </p>

        <h3>Compensation / Payment</h3>
        <p>You will receive <strong>0.5 RPP credits</strong> for participating in this online study.</p>

        <h3>Costs</h3>
        <p>Aside from your time, there are no costs for taking part in the study.</p>

        <h3>Rights</h3>
        <p>
          Participation is completely voluntary. You have the right to decline to participate or to withdraw at any point without penalty
          or loss of benefits to which you are otherwise entitled.
        </p>

        <h3>Questions</h3>
        <p>
          If you have questions or concerns about this study, you may contact the Principal Investigator:
          <br />
          <strong>Anne Collins, PhD</strong>: (510) 664-7146 (office), (510) 642-0158 (lab), annecollins@berkeley.edu
        </p>
        <p>
          If you have questions or concerns about your rights and treatment as a research subject, you may contact:
          <br />
          <strong>UC Berkeley Committee for the Protection of Human Subjects</strong>: 510-642-7461, subjects@berkeley.edu
          <br />
          Web: cphs.berkeley.edu (or ophs@berkeley.edu)
        </p>

        <hr />

        <p><strong>Consent</strong></p>
        <p>
          You may print this page or save it as a PDF for your records.
          Please click below to indicate whether you agree or disagree to participate.
        </p>
      </div>
    `;
  }

  /**
   * Global factory. Call this after you have `jsPsych = initJsPsych(...)`.
   *
   * Example:
   *   const jsPsych = initJsPsych();
   *   const timeline = [];
   *   timeline.push(...createConsentTimelineV8({ jsPsych }));
   */
  window.createConsentTimelineV8 = function createConsentTimelineV8(userOpts) {
    const opts = Object.assign(
      {
        jsPsych: null,
        studyTitle: "Reinforcement learning, working memory and decision making (RPP Subjects)",
        piName: "Professor Anne Collins, PhD",
        institution: "University of California, Berkeley; Department of Psychology",
        consentDataTag: "consent",
        requireScroll: true
      },
      userOpts || {}
    );

    if (!opts.jsPsych) throw new Error("createConsentTimelineV8: opts.jsPsych is required.");
    if (typeof jsPsychHtmlButtonResponse === "undefined") {
      throw new Error(
        "createConsentTimelineV8: jsPsychHtmlButtonResponse not found. " +
          "Add <script src=\"https://unpkg.com/@jspsych/plugin-html-button-response@2.1.0\"></script> before this file."
      );
    }

    const scrollGateScript = opts.requireScroll
      ? `
        <script>
          (function(){
            const container = document.getElementById("consent-scrollbox");
            const buttons = document.querySelectorAll(".jspsych-btn");
            function setDisabled(disabled){ buttons.forEach(b => b.disabled = disabled); }
            setDisabled(true);
            if(!container){ setDisabled(false); return; }
            container.addEventListener("scroll", function(){
              const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
              if(atBottom) setDisabled(false);
            });
          })();
        </script>
      `
      : "";

    const consentTrial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div style="max-width: 920px; margin: 0 auto;">
          ${
            opts.requireScroll
              ? `<div style="margin-bottom: 10px; font-size: 0.95rem; opacity: 0.85;">
                   Please scroll to the bottom to enable the consent buttons.
                 </div>`
              : ""
          }
          <div id="consent-scrollbox"
               style="max-height: 70vh; overflow-y: auto; padding: 12px; border: 1px solid #ccc; border-radius: 12px;">
            ${consentHtml(opts)}
          </div>
          ${scrollGateScript}
        </div>
      `,
      choices: ["I agree to participate", "I do not agree to participate"],
      data: { component: opts.consentDataTag },
      on_finish: function (data) {
        const idx = data.response;
        data.consent_given = idx === 0;
        data.consent_choice = idx === 0 ? "agree" : "decline";
      }
    };

    const declineScreen = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div style="max-width: 820px; margin: 0 auto; text-align: left; line-height: 1.35;">
          <h2>Thank you for your time.</h2>
          <p>
            You indicated that you do not agree to participate in this study.
            The study will now end. You may close this window.
          </p>
        </div>
      `,
      choices: ["End"],
      data: { component: "consent_declined" },
      on_finish: function () {
        opts.jsPsych.endExperiment("Participant declined consent.");
      }
    };

    const conditionalDeclineNode = {
      timeline: [declineScreen],
      conditional_function: function () {
        const last = opts.jsPsych.data.get().last(1).values()[0];
        return last && last.consent_given === false;
      }
    };

    return [consentTrial, conditionalDeclineNode];
  };
})();
