# manavahir.me — portfolio site

Plain HTML/CSS/JS, no build step. 3D hero visual via three.js (loaded from CDN at runtime, so no `npm install` needed).

## Deploy on GitHub Pages

1. Create a new **public** GitHub repo, e.g. `manavahir902/manavahir.me` (any name works).
2. Push everything in this folder to the repo root (`index.html` must sit at the repo root, not in a subfolder):
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source = "Deploy from a branch"**, branch `main`, folder `/ (root)`. Save.
4. GitHub will publish to `https://<your-username>.github.io/<repo>/` within a minute or two — confirm it works before moving to the custom domain.

## Point manavahir.me at it (Namecheap)

The `CNAME` file in this repo already contains `manavahir.me` — that's what tells GitHub Pages which custom domain to answer for. You still need to point DNS at GitHub from Namecheap's side:

1. Namecheap → **Domain List → Manage** on `manavahir.me` → **Advanced DNS**.
2. Add these records (delete any conflicting default "Parking Page" A/CNAME records first):

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A | @ | 185.199.108.153 | Automatic |
   | A | @ | 185.199.109.153 | Automatic |
   | A | @ | 185.199.110.153 | Automatic |
   | A | @ | 185.199.111.153 | Automatic |
   | CNAME | www | `<your-username>.github.io.` | Automatic |

3. Back in GitHub → **Settings → Pages**, under "Custom domain" enter `manavahir.me` and save (this re-writes the CNAME file for you if it's missing). Wait for the DNS check to go green, then tick **Enforce HTTPS**.
4. DNS propagation can take anywhere from a few minutes to ~24 hours.

## Notes

- All content is pulled from your resume — update `index.html` directly to edit copy (search for the section you want, e.g. `id="experience"`).
- Colors and type live in `style.css` under `:root` at the top if you want to retheme later.
- The hero network visual is in `script.js` — the node/edge layout is a wireframe icosahedron with animated "packets" traveling along the edges.
