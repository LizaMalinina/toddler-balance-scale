# Malen Studio — Balance Scale (Toddler Numbers)

A minimalist, toddler-friendly web app: match the **number** on the left pan by dragging **apples/cats** onto the right pan until the scale **balances**. Built to run as a **static site** (perfect for Azure Static Web Apps).

## Features

- 🎯 **Big touch targets** — designed for ages 2–3, no reading required
- ⚖️ **Live physics** — scale tilts as counts differ, balances when matched
- 🎨 **Themes** — Apples or Cats
- 🔊 **Multilingual speech** — hear numbers in Estonian, Russian, or English (Web Speech API)
- 🐱 **Gentle celebration** — dancing cat animation on success
- 📱 **Mobile-first** — responsive design optimized for phones and tablets
- 🔇 **Optional sound** — completion sound toggle (off by default)
- ♿ **Accessible** — ARIA labels, large tap areas, minimal reading

## Local Development

Open `index.html` directly in a browser, or use a local server:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# Then visit http://localhost:8080
```

## Project Structure

```
toddler-balance-scale/
├── index.html          # Main HTML structure
├── styles.css          # All styling including responsive breakpoints
├── script.js           # Game logic, drag & drop, speech synthesis
├── assets/
│   ├── apple.svg       # Apple theme icon
│   ├── cat.svg         # Cat theme icon
│   └── success.wav     # (unused - using web URL instead)
├── staticwebapp.config.json  # Azure Static Web Apps config
└── README.md
```

## Deploy to Azure Static Web Apps

### Via Portal
1. Push the folder to a GitHub repo
2. In Azure Portal: **Create a Static Web App**
3. Source: GitHub → select repo/branch
4. Build preset: **Custom**
5. App location: `/` ; Output location: `/`
6. Azure creates a GitHub Actions workflow and deploys

### Via Azure CLI
```bash
az login
az staticwebapp create \
  --name malen-balance-scale \
  --resource-group <rg-name> \
  --source <your-github-repo-url> \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "/"
```

## Customization

- **Colors**: Edit CSS variables in `styles.css` (`:root` section)
- **Themes**: Add new SVGs in `assets/` and update theme options in `index.html` and `script.js`
- **Difficulty**: Default max number is 10; users can choose 5, 7, or 10 in the top bar
- **Languages**: Add new languages by extending the `russianNumbers`/`estonianNumbers` arrays and voice cache in `script.js`

## Browser Support

- Modern browsers with Web Speech API support (Chrome, Edge, Safari, Firefox)
- Touch and mouse input supported
- No build step required — pure HTML/CSS/JS

## License

© Malen Studio. Designed for toddlers, ad-free, privacy-friendly.

## Notes
- No external libraries. Safe for preschool use; no tracking.
- Sound can be toggled in the top bar.
