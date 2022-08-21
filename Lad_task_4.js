var readlineSync = require("readline-sync");

const GAMEOVER_MESSAGES = {
  forcibly: "The Wizard decided not to continue fighting... The monster won!",
  wizard: "Wizarg wins",
  monster: "Monster wins",
  draw: "All dead",
};

const monster = {
  maxHealth: 10,
  currentHealth: 10,
  name: "Лютый",
  moves: [
    {
      name: "Удар когтистой лапой",
      physicalDmg: 3, // физический урон
      magicDmg: 0, // магический урон
      physicArmorPercents: 20, // физическая броня
      magicArmorPercents: 20, // магическая броня
      cooldown: 0, // ходов на восстановление
    },
    {
      name: "Огненное дыхание",
      physicalDmg: 0,
      magicDmg: 4,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 3,
    },
    {
      name: "Удар хвостом",
      physicalDmg: 2,
      magicDmg: 0,
      physicArmorPercents: 50,
      magicArmorPercents: 0,
      cooldown: 2,
    },
  ],
};

const wizard = {
  name: "Евстафий",
  maxHealth: 10,
  currentHealth: 10,
  moves: [
    {
      name: "Удар боевым кадилом",
      physicalDmg: 2,
      magicDmg: 0,
      physicArmorPercents: 0,
      magicArmorPercents: 50,
      cooldown: 0,
    },
    {
      name: "Вертушка левой пяткой",
      physicalDmg: 4,
      magicDmg: 0,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 4,
    },
    {
      name: "Каноничный фаербол",
      physicalDmg: 0,
      magicDmg: 5,
      physicArmorPercents: 0,
      magicArmorPercents: 0,
      cooldown: 3,
    },
    {
      name: "Магический блок",
      physicalDmg: 0,
      magicDmg: 0,
      physicArmorPercents: 100,
      magicArmorPercents: 100,
      cooldown: 4,
    },
  ],
};

const battle = {
  cooldownList: {
    monster: [],
    wizard: [],
  },
  difficult: {
    ease: 14,
    normal: 10,
    hard: 8,
  },
  round: 0,
  fight() {
    if (this.round === 0) this.prepare();
    console.log(`\n Начало раунда ${++this.round} \n`);
    const strikeMonster = this.сhoiceStrikeMonster();
    console.log("How will the wizard respond?....");
    const strikeWizard = this.сhoiceStrikeWizard();
    if (!strikeWizard) {
      return console.log(this.isOver(true));
    }
    this.damageCalculation(strikeMonster, strikeWizard);
    if (this.isOver()) return;
    this.updateCooldowns();
    return this.fight();
  },
  prepare() {
    const difficultTitle = Object.keys(this.difficult);
    let n = readlineSync.keyInSelect(difficultTitle, "Difficulty selection ");
    if (n === -1) n = 1;
    console.log("\n Difficulty " + difficultTitle[n]);
    wizard.maxHealth = this.difficult[difficultTitle[n]];
    monster.currentHealth = monster.maxHealth;
    wizard.currentHealth = wizard.maxHealth;
  },
  сhoiceStrikeMonster() {
    const strikeIndex = () => {
      const n = randomInteger(0, monster.moves.length - 1);
      if (this.haveCooldownMonster(n)) return strikeIndex();
      this.cooldownList.monster.push({
        index: n,
        cooldown: monster.moves[n].cooldown,
      });
      return n;
    };
    const index = strikeIndex();
    console.log("Attention!!! Monster strike : ", monster.moves[index].name);
    return monster.moves[index];
  },
  сhoiceStrikeWizard() {
    const wizardMoveNames = wizard.moves
      .filter((move, i) => !this.haveCooldownWizard(i))
      .map((move, i) => {
        console.log(`[${i + 1}] - ${move.name} `);
        return move.name;
      });

    const wizardStrikeIndex = readlineSync.keyInSelect(
      wizardMoveNames,
      "Wizard strike"
    );
    if (wizardStrikeIndex === -1) {
      return false;
    }
    console.log(
      "Wizard chooses to answer : ",
      wizard.moves[wizardStrikeIndex].name
    );
    this.cooldownList.wizard.push({
      index: wizardStrikeIndex,
      cooldown: wizard.moves[wizardStrikeIndex].cooldown,
    });
    return wizard.moves[wizardStrikeIndex];
  },
  damageCalculation(m, w) {
    monster.currentHealth -=
      w.physicalDmg * (1 - m.physicArmorPercents / 100) +
      w.magicDmg * (1 - m.magicArmorPercents / 100);
    wizard.currentHealth -=
      m.physicalDmg * (1 - w.physicArmorPercents / 100) +
      m.magicDmg * (1 - w.magicArmorPercents / 100);
    let statisctics = {
      "monster strikes": {
        "physical dmg": m.physicalDmg,
        "wizard physical block": m.physicalDmg * (w.physicArmorPercents / 100),
        "magic dmg": m.magicDmg,
        "wizard magic block": m.magicDmg * (w.magicArmorPercents / 100),
      },
      "wizard strikes": {
        "physical dmg": w.physicalDmg,
        "monster physical block": w.physicalDmg * (m.physicArmorPercents / 100),
        "magic dmg": w.magicDmg,
        "monster magic block": w.magicDmg * (m.magicArmorPercents / 100),
      },
      "current health Monster": monster.currentHealth,
      "current health Wizard": wizard.currentHealth,
    };
    console.log(statisctics);
  },
  isOver(forcibly) {
    if (forcibly) {
      return this.gameOver("forcibly");
    }
    if (monster.currentHealth <= 0 && wizard.currentHealth > 0) {
      return this.gameOver("wizard");
    } else if (wizard.currentHealth <= 0 && monster.currentHealth > 0) {
      return this.gameOver("monster");
    } else if (wizard.currentHealth <= 0 && monster.currentHealth <= 0) {
      return this.gameOver("draw");
    } else {
      return false;
    }
  },
  gameOver(winner) {
    console.log("GAME OVER");
    console.log("\n" + GAMEOVER_MESSAGES[winner]);
    return true;
  },
  haveCooldownMonster(n) {
    return !!this.cooldownList.monster.find((item) => item.index === n);
  },
  haveCooldownWizard(n) {
    return !!this.cooldownList.wizard.find((item) => item.index === n);
  },
  updateCooldowns() {
    this.cooldownList.monster = this.cooldownList.monster.filter((cd) => {
      cd.cooldown = cd.cooldown - 1;
      return cd.cooldown > 0;
    });
    this.cooldownList.wizard = this.cooldownList.wizard.filter((cd) => {
      cd.cooldown = cd.cooldown - 1;
      return cd.cooldown > 0;
    });
  },
};

function randomInteger(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

battle.fight();
