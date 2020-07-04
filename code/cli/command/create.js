const Command = require("common-bin");
const inquirer = require("inquirer");
const shelljs = require("shelljs");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const { execSync } = require("child_process");
const options = {
  name: {
    type: "string",
    description: "please input project name",
  },
};

// 文件列表
const files = ["README.md", "code/app.js", "notes/学习笔记.md"];
// 获取命令行输入名称
const getName = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        validate: (res) => !!res,
        message: options.name.description,
      },
    ])
    .then((res) => res.name);
};

class CurrentCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.options = options;
  }

  *run({ argv }) {
    if (!argv.name) {
      let name = yield getName();
      argv.name = name;
    }
    let name = argv.name;
    if (fs.existsSync(argv.name)) {
      let flag = yield inquirer
        .prompt([
          {
            type: "confirm",
            name: "flag",
            message: `${name} already exists. Do you want to override it ? `,
          },
        ])
        .then((res) => res.flag);
      if (!flag) return;
    } else {
      shelljs.mkdir(name);
    }
    files.forEach((file) => {
      let objFile = `${name}/${file}`;
      let dir = path.dirname(objFile);
      if (!fs.existsSync(dir)) {
        shelljs.mkdir("-p", dir);
      }
      shelljs.touch(objFile);
    });
    shelljs.cd(name);
    execSync("npm init -y");
    console.log(`${chalk.yellow(`${name} project initialization complete`)}`);
  }

  get description() {
    return "create a project";
  }
}

module.exports = CurrentCommand;
