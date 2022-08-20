const readlineSync = require("readline-sync");

function getHiddenSequence() {
  let sequence = "";
  function randomInteger(min, max) {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  const nChars = randomInteger(3, 6);

  for (let i = 0; i < nChars; i++) {
    let char = () => {
      const n = "" + randomInteger(0, 9);
      if (sequence.includes(n)) {
        return char();
      }
      return n;
    };
    sequence += char();
  }

  return sequence;
}

function checkUniqSequence(str) {
  const setFromStr = new Set(str.split(""));
  return str.length === setFromStr.size;
}

const game = {
  hiddenSequence: "",
  lengthSequence: 0,
  charsPlace: [],
  charsIncludes: [],
  tryLimit: 10,
  tryCount: 0,
  start() {
    console.log("Start. Bulls and cows");
    this.hiddenSequence = getHiddenSequence();
    return this.try();
  },
  try() {
    this.lengthSequence = this.hiddenSequence.length;
    const input = readlineSync.question(
      `\n Enter your ${this.lengthSequence} digit sequence : `
    );
    let userInput = input.trim().toLowerCase();
    if (userInput.length !== this.lengthSequence) {
      console.log(`Alert!  Input ${this.lengthSequence} chars`);
      return this.try();
    }
    if (!checkUniqSequence(userInput)) {
      console.log(`Alert!  You need to enter unique numbers`);
      return this.try();
    }

    this.userInput = userInput;
    this.charsPlace = [];
    this.charsIncludes = [];
    for (let i = 0; i < this.lengthSequence; i++) {
      if (userInput[i] === this.hiddenSequence[i]) {
        this.charsPlace.push(userInput[i]);
      } else if (this.hiddenSequence.includes(userInput[i])) {
        this.charsIncludes.push(userInput[i]);
      }
    }
    if (this.charsPlace.length === this.lengthSequence) {
      return `You won! The hidden number ${this.hiddenSequence}`;
    }
    this.tryCount += 1;
    if (this.tryCount >= this.tryLimit) return "Game over, you lost";
    console.log(
      `Matched numbers are not in their places - ${
        this.charsIncludes.length
      } (${this.charsIncludes.join(" ")}), numbers in place - ${
        this.charsPlace.length
      } (${this.charsPlace.join(" ")}), attempts left ${
        this.tryLimit - this.tryCount
      }`
    );
    return this.try();
  },
};

console.log(game.start());
