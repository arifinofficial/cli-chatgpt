#!/usr/bin/env node

require("dotenv").config();
const axios = require("axios");
const prompt = require("prompt-sync")({
  history: require("prompt-sync-history")(),
  sigint: true,
});
const marked = require("marked");
const chalk = require("chalk");
const loading = require("loading-cli");
const Box = require("cli-box");

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = process.env.OPENAI_API_URL;
const TerminalRenderer = require("marked-terminal");
marked.setOptions({
  renderer: new TerminalRenderer(),
});

if (!apiKey) {
  console.log(chalk.red("Error, Api key in env not found."));
  process.exit();
}

const ready = async () => {
  const message = prompt(chalk.cyan("Send a prompt: "));
  fetchApi(message);
};

const fetchApi = async (message) => {
  const body = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const load = loading("loading...").start();

  try {
    const response = await axios.post(apiUrl, body, { headers: headers });
    const choices = response.data.choices;
    load.stop();

    const markOpt = {
      nw: "",
      n: "-",
      ne: "",
      e: "",
      se: "",
      s: "-",
      sw: "",
      w: "",
      b: "",
    };

    choices.forEach((choice) => {
      const responseBox = Box(
        { fullscreen: true, marks: markOpt },
        "\n" +
          marked.parse(choice.message.content, {
            mangle: false,
            headerIds: false,
          })
      );
      console.log(responseBox + "\n");
    });

    ready();
  } catch (error) {
    console.log(chalk.red(error));
    load.stop();
  }
};

ready();
