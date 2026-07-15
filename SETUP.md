# Collecting leads &amp; feedback in a Google Sheet

Both the landing page (`index.html`) and the in-app feedback survey (`app.html`)
POST every submission to a single webhook URL defined in **`config.js`**:

```js
window.HH_WEBHOOK = "";   // ← paste your webhook URL here
```

Until you set it, submissions are just saved in each visitor's browser
(`localStorage`) so nothing is lost during the demo — but you can't see them.
The easiest zero-cost way to actually collect them is a **Google Apps Script Web
App** that appends rows to a Google Sheet you own. Setup takes ~5 minutes.

## What lands in the sheet

Each submission is a JSON payload with a `type` field:

- `type: "leads"` — beta signups: `name`, `email`, `phone`, `consentAt`, `source`
- `type: "feedback"` — survey: `rating`, `features` (array), `message`, `email`,
  plus the in-app quiz answers (`wouldUse`, `mostUseful`, `needsWork`, `wouldPay`)
- `source` is `"landing"` or `"app"` so you know where it came from.

The script below drops **leads** and **feedback** onto their own tabs
automatically.

## Steps

1. **Create the sheet.** Go to <https://sheets.new>, name it e.g.
   *Haulin' Hooves — Submissions*.
2. **Open the script editor.** In the sheet: **Extensions → Apps Script**.
3. **Paste the script.** Delete the starter `myFunction` and paste everything
   from the code block below. Save (💾).
4. **Deploy as a Web App.** Click **Deploy → New deployment → ⚙️ → Web app**.
   Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
   Authorize when prompted (it's your own script).
5. **Copy the Web App URL** (looks like
   `https://script.google.com/macros/s/AKfy…/exec`) and paste it into
   `config.js`:
   ```js
   window.HH_WEBHOOK = "https://script.google.com/macros/s/AKfy…/exec";
   ```
   Commit &amp; push. Done — new signups and feedback now flow into your sheet.

> To test: submit the beta form on the site, then refresh the sheet — a new row
> should appear on the **leads** tab within a second or two.

## The Apps Script

```js
// Haulin' Hooves — receives lead + feedback submissions and appends them to
// per-type tabs in this spreadsheet. Deploy as a Web App (Execute as: Me,
// Access: Anyone). No secrets required.
function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) {}
  try {
    var data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }

    var type = (data.type || 'misc').toString().replace(/[^\w-]/g, '').slice(0, 40) || 'misc';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(type) || ss.insertSheet(type);

    // Column order per type; unknown keys get appended as JSON.
    var cols = {
      leads:    ['received_at', 'name', 'email', 'phone', 'source', 'consentAt'],
      feedback: ['received_at', 'rating', 'wouldUse', 'mostUseful', 'needsWork', 'wouldPay', 'features', 'message', 'email', 'source', 'at']
    };
    var header = cols[type] || ['received_at', 'payload'];

    if (sheet.getLastRow() === 0) sheet.appendRow(header);

    var row = header.map(function (key) {
      if (key === 'received_at') return new Date();
      if (key === 'payload') return JSON.stringify(data);
      var v = data[key];
      if (Array.isArray(v)) return v.join(' | ');
      return (v === undefined || v === null) ? '' : v;
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'haulin-hooves' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Notes

- The site sends submissions with `mode: "no-cors"`, so the browser never needs
  a CORS response — Apps Script works out of the box. The page can't read the
  reply, so it always shows a friendly success message and also keeps a copy in
  `localStorage` as a backstop.
- Want email alerts too? Add
  `MailApp.sendEmail('you@example.com', 'New ' + type, JSON.stringify(data, null, 2));`
  inside `doPost`, before the `return`.
- Prefer a hosted form service instead? Any endpoint that accepts a POST body
  works — just put its URL in `config.js` (e.g. Formspree, Getform, Basin, a
  Google Form's `formResponse` URL, or a Supabase edge function).
- Legal pages (`privacy.html`, `terms.html`, `do-not-sell.html`) still have
  placeholder contact addresses (`hello@haulinhooves.com`) and a `[your state]`
  governing-law slot — swap those for real details before any public launch.
