import favicons from "favicons";
import fs from "fs/promises";
import path from "path";

// Source uses the 200×200 site avatar so favicon and on-page portrait share
// the same visual identity. Swap to a higher-res source if you ever want
// crisper icons.
const SRC = "./src/assets/images/avatar.jpg";

// Output mirrors the path our webmanifest expects (per the plugin's bundled
// manifest.json.njk template). public/ is copied verbatim to dist/.
const DEST = "./public/assets/images/favicon";

// Restrict the favicons package to the icons we actually reference. By default
// it emits ~70 files including iOS startup screens — pure bloat for us.
const configuration = {
  path: "/assets/images/favicon/",
  appName: "Pierre Guilbert",
  appShortName: "Pierre Guilbert",
  appDescription: "Engineering web apps since 2011.",
  developerName: "Pierre Guilbert",
  developerURL: "https://pierreguilbert.com",
  background: "#ffffff",
  theme_color: "#ffffff",
  display: "standalone",
  icons: {
    android: ["android-chrome-192x192.png", "android-chrome-384x384.png"],
    appleIcon: ["apple-touch-icon.png"],
    appleStartup: false,
    favicons: ["favicon-16x16.png", "favicon-32x32.png", "favicon.ico"],
    windows: false,
    yandex: false,
  },
};

const response = await favicons(SRC, configuration);
await fs.mkdir(DEST, { recursive: true });

await Promise.all(
  response.images.map((image) =>
    fs.writeFile(path.join(DEST, image.name), image.contents),
  ),
);

// Also drop favicon.ico at the public root so /favicon.ico requests resolve
// without needing a <link rel="icon"> entry.
const ico = response.images.find((i) => i.name === "favicon.ico");
if (ico) {
  await fs.writeFile("./public/favicon.ico", ico.contents);
}

console.log(
  `Wrote ${response.images.length} favicon files to ${DEST} (+ /favicon.ico)`,
);
