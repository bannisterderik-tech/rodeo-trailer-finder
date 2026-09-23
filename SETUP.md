# Where beta signups &amp; feedback go

Every submission — the landing page's beta form and quick-feedback form, and
the in-app feedback survey — is delivered by `window.hhDeliver` in
**`config.js`**:

```js
window.HH_EMAIL   = "kimmy@karlovichrealtyllc.com";   // emailed here
window.HH_WEBHOOK = "";                               // optional: also POST to a webhook
```

## 1. Email delivery (on by default)

Submissions are emailed to `HH_EMAIL` through [FormSubmit](https://formsubmit.co)
— free, no account, no server. Each email arrives as a table of the fields
(name, email, phone, rating, feature requests, message…) with **Reply-To** set
to the hauler's own email, so replying goes straight to them.

**One-time activation (required):** the very first submission makes FormSubmit
send an *"Activate your form"* email to `kimmy@karlovichrealtyllc.com`. Click
the activation link once. Until that click, submissions are held (not
forwarded); after it, every submission arrives normally.

> To trigger the activation email yourself: open the live site, fill in the
> beta form with your own details and submit. Check the inbox (and spam) for
> the FormSubmit activation message, click **Activate**, then submit once more
> to confirm it lands.

To change the recipient later, edit `HH_EMAIL` in `config.js` and push — the
new address gets its own activation email on its first submission.

Subject lines: `New Haulin' Hooves beta signup — <name>` and
`Haulin' Hooves feedback — <rating>/5`.

## 2. Optional: also collect in a Google Sheet

If you also want a spreadsheet of everything, set `HH_WEBHOOK` to a Google
Apps Script Web App URL. ~5 minutes:

1. Go to <https://sheets.new>, name it e.g. *Haulin' Hooves — Submissions*.
2. **Extensions → Apps Script**, replace the starter code with the script
   below, save.
3. **Deploy → New deployment → ⚙️ → Web app**; *Execute as: Me*, *Who has
   access: Anyone*; **Deploy** and authorize.
4. Copy the Web App URL (`https://script.google.com/macros/s/…/exec`) into
   `config.js` as `HH_WEBHOOK`, commit and push.

Payloads carry a `type` (`leads` or `feedback`) and a `source` (`landing` or
`app`); the script drops each type onto its own tab.

```js
function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) {}
  try {
    var data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }
    var type = (data.type || 'misc').toString().replace(/[^\w-]/g, '').slice(0, 40) || 'misc';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(type) || ss.insertSheet(type);
    var cols = {
      leads:    ['received_at', 'name', 'email', 'phone', 'source', 'consentAt'],
      feedback: ['received_at', 'rating', 'wouldUse', 'mostUseful', 'needsWork', 'wouldPay', 'features', 'message', 'email', 'source', 'at']
    };
    var header = cols[type] || ['received_at', 'payload'];
    if (sheet.getLastRow() === 0) sheet.appendRow(header);
    sheet.appendRow(header.map(function (key) {
      if (key === 'received_at') return new Date();
      if (key === 'payload') return JSON.stringify(data);
      var v = data[key]; return Array.isArray(v) ? v.join(' | ') : (v == null ? '' : v);
    }));
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally { try { lock.releaseLock(); } catch (e2) {} }
}
function doGet() { return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'haulin-hooves' })).setMimeType(ContentService.MimeType.JSON); }
```

## Notes

- A copy of every submission is also kept in the visitor's browser
  (`localStorage`) as a backstop; it never leaves their device.
- Submissions transit FormSubmit's servers to reach the inbox — fine for a
  beta, but mention it in the Privacy Policy before a public launch.
- The legal pages still carry placeholder contacts (`hello@haulinhooves.com`)
  and a `[your state]` governing-law slot — swap those before launch.
