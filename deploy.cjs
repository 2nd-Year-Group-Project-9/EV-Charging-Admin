const ghpages = require("gh-pages");

ghpages.publish(
  "dist",
  {
    branch: "gh-pages",
    dotfiles: true,
    remove: false,
  },
  (err) => {
    if (err) console.error(err);
    else console.log("Deployed successfully!");
  }
);