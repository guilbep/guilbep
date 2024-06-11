
import favicons from "favicons";
import fs from "fs/promises";
import path from "path";

// const source = '../public/assets/pgu.jpeg'; // Replace with the path to your source image
// const outputDir = '../public/assets/'; // Replace with your desired output directory


const src = "./public/assets/pgu.jpeg"; // Icon source file path.
const dest = "./public/assets/favicons"; // Output directory path.
const htmlBasename = "index.html"; // HTML file basename.

// Configuration (see above in the README file).
const configuration = {
  path: "./assets/favicons/", // Path for overriding default icons path. `string`
  appName: "Pierre Guilbert", // Your application's name. `string`
  appShortName: "pierre guilbert", // Your application's short name. `string`
  appDescription: "Personal home page", // Your application's description. `string`
  developerName: "Pierre Guilbert", // Your (or your developer's) name. `string`
  developerURL: "https://pierreguilbert.com", // Your (or your developer's) URL. `string`
  background: "#ffffff", // Background color for flattened icons. `string`
  theme_color: "#ffffff", // Theme color for browser chrome. `string`
  display: "standalone", // Android display: "browser" or "standalone". `string`
  // Extra options...
};

// Below is the processing.
const response = await favicons(src, configuration);
await fs.mkdir(dest, { recursive: true });
await Promise.all(
  response.images.map(
    async (image) =>
      await fs.writeFile(path.join(dest, image.name), image.contents),
  ),
);
await Promise.all(
  response.files.map(
    async (file) =>
      await fs.writeFile(path.join(dest, file.name), file.contents),
  ),
);
await fs.writeFile(path.join(dest, htmlBasename), response.html.join("\n"));