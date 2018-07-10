"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

const PROJECT_FOLDER = "~/Documents/GitHub";

const configWithIncludedProjects = {
  readConfig: function(setting, defaultValue) {
    return ["/path/to/project", "/path/to/another"];
  },
  writeConfig: function() {
    return true;
  }
};

const GIT_PROJECTS = {
  project1: {
    ".git": {},
    "gitFile1.txt": "contents"
  },
  project2: {
    ".git": {}
  },
  directory1: {
    project3: {
      ".git": {}
    }
  }
};

const DIRECTORY_STRUCTURE = Object.assign({}, GIT_PROJECTS, {
  other1: {
    subfolder1: {}
  },
  other2: {
    subfolder2: {}
  },
  "file1.txt": "file content here",
  "file2.txt": "file content here"
});

describe("#services/included-project-directories", function() {
  it("adds a new included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const includedProjectDirectories = sut.addIncludedProjectDirectory(
      "/path/to/project"
    );

    mockFs.restore();

    expect(includedProjectDirectories.sort()).to.be.deep.equal(
      ["/path/to/project", "/path/to/another"].sort()
    );
  });

  it("removes an included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const includedProjectDirectories = sut.removeIncludedProjectDirectory(
      "/path/to/project"
    );

    mockFs.restore();

    expect(includedProjectDirectories).to.be.deep.equal(["/path/to/another"]);
  });

  it("shows included project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const includedProjectDirectories = sut.showIncludedProjectDirectories();

    mockFs.restore();

    expect(includedProjectDirectories).to.be.deep.equal([
      "/path/to/project",
      "/path/to/another"
    ]);
  });

  it("removes all included project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const result = sut.removeAllIncludedProjectDirectories();

    mockFs.restore();
    expect(result).to.equal(true);
  });
});
