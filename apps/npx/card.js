#!/usr/bin/env node

"use strict";

import boxen from "boxen";
import chalk from "chalk";
import enquirer from "enquirer";

const { Select } = enquirer;
import clear from "clear";
import open from "open";
clear();

const prompt = new Select({
  name: "action",
  message: `${chalk.bold("What you want to do?")} ${chalk.gray(
    "(Use arrow keys)"
  )}`,
  choices: [
    {
      name: `Send me an ${chalk.green.bold("email")}?`,
      value: "email",
    },
    {
      name: "Just quit.",
      value: "quit",
    },
  ],
});

const data = {
  name: chalk.bold.green("                    Saksham Gambhir"),
  handle: chalk.white("Build with Saksham"),
  work: chalk.white("Software Engineer"),
  college: chalk.hex("#2b82b2").bold("Optum Global Solutions"),
  education: chalk.white("Delhi Technological University '25"),
  github: chalk.gray("https://github.com/") + chalk.green("sakshxm08"),
  linkedin: chalk.gray("https://linkedin.com/in/") + chalk.blue("sakshxm08"),
  web: chalk.cyan("https://buildwithsaksham.in"),
  npx: chalk.red("npx") + " " + chalk.white("buildwithsaksham"),

  labelWork: chalk.white.bold("       Work:"),
  labelCollege: chalk.white.bold("    Company:"),
  labelEducation: chalk.white.bold("  Education:"),
  labelGitHub: chalk.white.bold("     GitHub:"),
  labelLinkedIn: chalk.white.bold("   LinkedIn:"),
  labelWeb: chalk.white.bold("        Web:"),
  labelCard: chalk.white.bold("       Card:"),
};

const me = boxen(
  [
    `${data.name}`,
    ``,
    `${data.labelWork}  ${data.work}`,
    ``,
    `${data.labelCollege}  ${data.college}`,
    ``,
    `${data.labelEducation}  ${data.education}`,
    ``,
    `${data.labelGitHub}  ${data.github}`,
    `${data.labelLinkedIn}  ${data.linkedin}`,
    `${data.labelWeb}  ${data.web}`,
    ``,
    `${data.labelCard}  ${data.npx}`,
    ``,
    `${chalk.italic(
      "I am currently working as a Software Engineer at Optum."
    )}`,
    `${chalk.italic("Feel free to reach out if you'd like to connect!")}`,
  ].join("\n"),
  {
    margin: 1,
    float: "center",
    padding: 1,
    borderStyle: "doubleSingle",
    borderColor: "green",
    title: data.handle,
    titleAlignment: "center",
  }
);

console.log(me);
const tip = [
  `Tip: Try ${chalk.cyanBright.bold("cmd/ctrl + click")} on the links above`,
  "",
].join("\n");
console.log(tip);

prompt
  .run()
  .then((answer) => {
    if (answer === "email") {
      open("mailto:saksham@buildwithsaksham.in");

      console.log("\nDone, see you soon at inbox.\n");
    } else {
      console.log("Hasta la vista.\n");
    }
  })
  .catch(() => {
    // Handle interruption gracefully
    process.exit(0);
  });
