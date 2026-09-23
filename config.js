/* ============================================================
   Haulin' Hooves — where form submissions go
   ============================================================
   Every beta signup and feedback submission (landing page forms
   and the in-app survey) is delivered by window.hhDeliver below:

   1. HH_EMAIL  — emailed to this address via FormSubmit
                  (https://formsubmit.co, free, no account). The FIRST
                  submission triggers a one-time activation email to this
                  address — click "Activate" in it once and every
                  submission after that arrives as a normal email.
   2. HH_WEBHOOK — optional: also POSTed to a webhook (e.g. the Google
                  Sheet Apps Script in SETUP.md). Leave blank to skip.
   3. A copy is always kept in the visitor's browser (localStorage) as a
      backstop.
   ============================================================ */
window.HH_EMAIL = "kimmy@karlovichrealtyllc.com";
window.HH_WEBHOOK = "";

window.hhDeliver = function (kind, data) {
  var rec = Object.assign({}, data);
  try { var k = 'hh_' + kind, a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(rec); localStorage.setItem(k, JSON.stringify(a)); } catch (e) {}

  // flatten for the email body (arrays -> "a | b | c")
  var flat = {};
  Object.keys(rec).forEach(function (key) { var v = rec[key]; flat[key] = Array.isArray(v) ? v.join(' | ') : (v == null ? '' : String(v)); });

  if (window.HH_WEBHOOK) {
    try { fetch(window.HH_WEBHOOK, { method: 'POST', mode: 'no-cors', body: JSON.stringify(Object.assign({ type: kind }, rec)) }).catch(function () {}); } catch (e) {}
  }
  if (window.HH_EMAIL) {
    var subject = kind === 'leads'
      ? "New Haulin' Hooves beta signup" + (flat.name ? ' — ' + flat.name : '')
      : "Haulin' Hooves feedback" + (flat.rating && flat.rating !== '0' ? ' — ' + flat.rating + '/5' : '');
    var body = Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, flat);
    if (flat.email) body._replyto = flat.email;   // "Reply" goes straight to the hauler
    try {
      fetch('https://formsubmit.co/ajax/' + window.HH_EMAIL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body)
      }).catch(function () {});
    } catch (e) {}
  }
};
