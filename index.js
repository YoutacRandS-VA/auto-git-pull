#! /usr/bin/env node
"use strict";

const updateNotifier = require("update-notifier");
const pkg = require("./package.json");
const git = require("./services/git");
const includedProjectDirectories = require("./services/included-project-directories");
const excludedProjectDirectories = require("./services/excluded-project-directories");
const projectDirectory = require("./services/project-directory");
const scheduler = require("./modules/scheduler");
const { log } = require("./utils");
const { EOL } = require("os");
const { writeFileSync } = require("fs");

function showHelp() {
  log.info(`
  Fetches all repos from Git in a working folder, and optionally pulls changes if there are no conflicts.

  Available commands:

    --set-projects-directory  | -spd    <PATH>
    
    --fetch                   | -f
    --pull                    | -p
    --pull-silent             | -ps
    --status                  | -s

    --schedule-task           | -t

    --add-include             | -ai     <PATH>
    --remove-include          | -ri     <PATH>
    --show-includes           | -si
    --clear-includes          | -ci

    --add-exclude             | -ax     <PATH>
    --remove-exclude          | -rx     <PATH>
    --show-excludes           | -sx
    --clear-excludes          | -cx

    --help                    | -h

  Example usage:
    $ git-autofetch -spd /Users/you/Documents/GitHub
    $ git-autofetch -f
    $ git-autofetch -p

  Notes:
    * You must set a projects directory before fetching or pulling.
      This should be the root folder of you Git projects.
    * The 'Pull' command performs a fetch & pull.
    * 'Pull' will only attempt to pull changes if there are conflicts or changes to the local tree.
    * The more out of date a repo is, the longer it will take to fetch and pull.
    
    * To fetch from only a subset of projects, 
      either add each project using '--add-include <PATH>' 
        (which means the main projects directory will be ignored), 
      or exclude paths from the main projects directory using '--add-exclude <PATH>'

    * To automate the process, use '-t' to schedule a recurring task every 2 minutes.
`);
}

function main() {
  updateNotifier({
    pkg,
    updateCheckInterval: 0
  }).notify({
    isGlobal: true
  });

  const logLocation = `${__dirname}/logs`;
  writeFileSync(
    `${__dirname}/node_modules/logger-rotate/logger-rotate.config.json`,
    `{"LOG_FOLDER":"${logLocation}"}`
  );

  let action = process.argv[2];
  action = action || "";
  const args = process.argv.slice(3);
  let fetchResults = [];
  let incProjectDirs;
  let excProjectDirs;

  switch (action.toLowerCase()) {
    case "-spd":
    case "--set-projects-directory":
      if (projectDirectory.setProjectsDirectory(args[0])) {
        log.info(EOL, "OK");
      }
      break;
    case "-f":
    case "--fetch":
      fetchResults = [...git.fetchProjectsFromGit()];
      if (fetchResults.length > 0) {
        log.info(EOL, "OK");
      }
      break;
    case "-p":
    case "--pull":
      fetchResults = [...git.fetchProjectsFromGit(false)];
      if (fetchResults.length > 0) {
        const pullResults = [...git.pullProjectsFromGit(false)];
        if (pullResults.length > 0) {
          log.info(EOL, pullResults.join(EOL + EOL + " "));
        }
      }
      break;
    case "-ps":
    case "--pull-silent":
      fetchResults = [...git.fetchProjectsFromGit(true)];
      if (fetchResults.length > 0) {
        const pullResults = [...git.pullProjectsFromGit(true)];
        if (pullResults.length > 0) {
          log.infoSilent(EOL, pullResults.join(EOL + EOL + " "));
        }
      }
      break;
    case "-s":
    case "--status":
      const statusResults = [...git.runStatusOnProjects()];
      log.info(EOL, statusResults.join(EOL + " "));
      break;
    case "-ai":
    case "--add-include":
      incProjectDirs = includedProjectDirectories.addIncludedProjectDirectory(
        args[0]
      );
      if (incProjectDirs) {
        log.info(
          EOL,
          "Included Project Directories:",
          EOL,
          incProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "-ri":
    case "--remove-include":
      incProjectDirs = includedProjectDirectories.removeIncludedProjectDirectory(
        args[0]
      );
      if (incProjectDirs) {
        log.info(
          EOL,
          "Included Project Directories:",
          EOL,
          incProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "-ci":
    case "--clear-includes":
      if (includedProjectDirectories.removeAllIncludedProjectDirectories()) {
        log.info(EOL, "OK");
      }
      break;
    case "-si":
    case "--show-includes":
      incProjectDirs = includedProjectDirectories.showIncludedProjectDirectories();
      if (incProjectDirs) {
        log.info(
          EOL,
          "Included Project Directories:",
          EOL,
          incProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "-ax":
    case "--add-exclude":
      excProjectDirs = excludedProjectDirectories.addExcludedProjectDirectory(
        args[0]
      );
      if (excProjectDirs) {
        log.info(
          EOL,
          "Excluded Project Directories:",
          EOL,
          excProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "-rx":
    case "--remove-exclude":
      excProjectDirs = excludedProjectDirectories.removeExcludedProjectDirectory(
        args[0]
      );
      if (excProjectDirs) {
        log.info(
          EOL,
          "Excluded Project Directories:",
          EOL,
          excProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "-cx":
    case "--clear-excludes":
      if (excludedProjectDirectories.removeAllExcludedProjectDirectories()) {
        log.info(EOL, "OK");
      }
      break;
    case "-sx":
    case "--show-excludes":
      excProjectDirs = excludedProjectDirectories.showExcludedProjectDirectories();
      if (excProjectDirs) {
        log.info(
          EOL,
          "Excluded Project Directories:",
          EOL,
          excProjectDirs.join(EOL + " ")
        );
      }
      break;
    case "--schedule-task":
    case "-t":
      if (scheduler.schedulePull()) {
        log.info(EOL, "OK");
      }
      break;
    case "-h":
    case "--help":
    case "":
    case undefined:
    default:
      showHelp();
      break;
  }
}

main();
