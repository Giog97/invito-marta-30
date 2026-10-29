# Marta 30 - birthday invitation

One-page invitation for Marta's 30th birthday: invitation card, "then & now"
photos, party programme with venue and map, and an RSVP form that emails the
replies. Plain HTML, CSS and JavaScript: no build step, ready for GitHub Pages.

## Structure

```
index.html              page content (texts, date, address)
assets/css/style.css    styles
assets/js/config.js     settings: RSVP email, optional Web3Forms key, event times
assets/js/main.js       animations, countdown, calendar links, logo, RSVP
assets/img/             favicon and the two photos
.nojekyll               tells GitHub Pages to serve the files as they are
```

## 1. Add the photos

Save the two pictures with exactly these names:

- `assets/img/marta-piccola.jpg` - Marta as a child (left, "Ieri")
- `assets/img/marta-oggi.jpg` - Marta today (right, "Oggi")

The frames are square and the photo is cropped to fill them. Until a file
exists the page shows a placeholder. Keep each photo around 1000 x 1000 px and
under 300 KB so the page loads fast on mobile data.

## 2. Set up the RSVP email

Open `assets/js/config.js` and write the address that must receive the replies:

```js
rsvpEmail: 'nome.cognome@gmail.com',
```

That is enough for the site to work: when a guest presses "Invia la risposta",
their mail app opens with the reply already written (name, yes/no, vegetarian
menu, allergies, message) and they only have to press "Send".

### Optional: automatic sending with Web3Forms

To receive the replies without the guest's mail app opening:

1. Go to https://web3forms.com, enter the same address and create an access key
   (it arrives by email).
2. Paste it in `config.js`:

   ```js
   web3formsKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
   ```

Replies are then emailed by Web3Forms to the address linked to the key. If the
service fails, the page falls back to the mail app using `rsvpEmail`. Check the
current free-plan limits on their site before the invitations go out.

Note: the replies (including allergies) pass through Web3Forms, a third-party
service. The access key is public by design and safe to commit.

### Test before sharing

Open the published site, send a test reply and check that the email arrives.
When the page runs locally (`localhost` or opened from disk) with no email set,
the form only simulates sending and prints the reply in the browser console.

## 3. Change date, time or address

The values appear in more than one place: update all of them.

- `index.html`: invitation card, venue box, map link and iframe, meta description
  and `og:description`, confirmation message ("il 23 gennaio").
- `assets/js/config.js`: `eventStart`, `eventEnd` (countdown and calendar links)
  and `venueAddress`.

`eventEnd` is an indicative end time used only by the "add to calendar" links.
The countdown hides itself once the start time has passed.

## 4. Publish on GitHub Pages

1. Create a new repository on GitHub (for example `marta-30`).
2. Upload the **contents** of this folder to the repository root, so that
   `index.html` sits at the top level (Add file > Upload files, then commit).
3. Settings > Pages > Build and deployment: Source "Deploy from a branch",
   Branch `main`, folder `/ (root)`, Save.
4. After a minute or two the site is online at
   `https://<your-username>.github.io/<repository-name>/`.

A public repository is required for GitHub Pages on a free account, so anyone
with the repository link can read the files, including `config.js`.

## Optional: link preview image

WhatsApp and other apps show a preview image only when `og:image` uses an
absolute URL. Once the site is online, add an image (for example
`assets/img/anteprima.jpg`, 1200 x 630 px) and uncomment the `og:image` line in
`index.html` with the full address.

## Local preview

Double-click `index.html`, or serve the folder to test it like the real site:

```bash
python -m http.server 8000
```

then open http://localhost:8000.
