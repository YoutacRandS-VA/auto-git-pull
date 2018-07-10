#! /usr/bin/env node
"use strict";

const updateNotifier = require("update-notifier");
const pkg = require("./package.json");
const services = require("./services");
const { log } = require("./utils");

function showHelp() {
  log.info(`
  Fetches all repos from Git in a working folder, and optionally pulls changes if there are no conflicts.

  Available commands:
    --set-projects-directory | -spd <PATH>
    
    --fetch                  | -f
    --pull                   | -p
    --status                 | -s

    --add-include            | -ai    <PATH>
    --remove-include         | -ri    <PATH>
    --show-includes          | -i
    --remove-all-includes    | -rai

    --help                   | -h

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
      or exclude paths from the main projects directory using '--remove-include <PATH>'
`);
}

function main() {
  updateNotifier({
    pkg,
    updateCheckInterval: 0
  }).notify({
    isGlobal: true
  });

  const action = process.argv[2];
  const args = process.argv.slice(3);
  let fetchResults = [];
  switch (action.toLowerCase()) {
    case "-spd":
    case "--set-projects-directory":
      if (services.setProjectsDirectory(args[0])) {
        log.info("", "OK");
      }
      break;
    case "-f":
    case "--fetch":
      fetchResults = [...services.fetchProjectsFromGit()];
      if (fetchResults.length > 0) {
        log.info("", "OK");
      }
      break;
    case "-p":
    case "--pull":
      fetchResults = [...services.fetchProjectsFromGit()];
      if (fetchResults.length > 0) {
        const pullResults = [...services.pullProjectsFromGit()];
        if (pullResults.length > 0) {
          log.info(pullResults);
        }
      }
      break;
    case "-s":
    case "--status":
      const statusResults = [...services.runStatusOnProjects()];
      log.info(statusResults);
      break;
    case "-ai":
    case "--add-include":
      const incProjectDirs = services.addIncludedProjectDirectory(args[0]);
      if (incProjectDirs) {
        log.info("", "Included Project Directories:", "", incProjectDirs);
      }
      break;
    case "-ri":
    case "--remove-include":
      const incProjectDirs = services.removeIncludedProjectDirectory(args[0]);
      if (incProjectDirs) {
        log.info("", "Included Project Directories:", "", incProjectDirs);
      }
      break;
    case "-rai":
    case "--remove-all-includes":
      if (services.removeAllIncludedProjectDirectories()) {
        log.info("", "OK");
      }
      break;
    case "-i":
    case "--show-includes":
      const incProjectDirs = services.showIncludedProjectDirectories();
      if (incProjectDirs) {
        log.info("", "Included Project Directories:", "", incProjectDirs);
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
