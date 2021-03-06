// uses globals: tmi, _ (lodash) included in index.html
const client = new tmi.Client({
  options: { debug: true },
  connection: { reconnect: true },
  channels: ["typescriptteatime"],
});
client.connect();

const say = (text) => {
  console.log(text);
  appendToDom(text);
};

let monster = null;
let users = []; // party
let timerInterval = null;
const timeTillAttackInSeconds = 20;

client.on("message", (channel, tags, message, self) => {
  if (self) return; // Ignore echoed messages.
  const username = tags.username;
  const msg = message.toLowerCase();

  logChatToPage(tags, message);

  if (msg === "!ambush") startAmbushRandomBattle();

  if (msg === "!join") joinBattle(username);

  if (msg.includes("!attack")) {
    const user = users.find((u) => u.username === username);
    const canAttack = monster && user && !user.hasAttacked;
    if (canAttack) {
      userAttack(user);
      if (monster.hp <= 0) winBattle();
    }
  }
});

function userAttack(user) {
  console.log(user.username, "attacks");
  user.hasAttacked = true;
  const damage = _.random(19) + 1;
  monster.hp -= damage;
  say(
    `🗡️ @${user.username} dealt ${damage} damage to 😈 ${monster.name}. ${monster.hp} ❤️ left.`
  );
}

function startAmbushRandomBattle() {
  monster = _.cloneDeep(monsters[_.random(monsters.length - 1)]);
  say(
    `⚔️ An ambush! You're party is in a ${monster.area}. A wild 😈 ${monster.name} appeared. Be prepared! The attack starts in ${timeTillAttackInSeconds} seconds. ❤️: ${monster.hp}`
  );
  if (!timerInterval) {
    timerInterval = window.setInterval(
      monsterAttack,
      timeTillAttackInSeconds * 1000
    );
  }
}

function winBattle() {
  window.clearInterval(timerInterval);
  say(
    `🏆🏆🏆🎉🏅 VICTORY! 😈 ${monster.name} has been struck down. @${users
      .map((u) => u.username)
      .join(", @")} earned x00 EXP.`
  );
}

function loseBattle() {
  console.log("Battle lost");
  window.clearInterval(timerInterval);
  say(
    `🔥🔥🔥🔥🔥 ⚰️⚰️⚰️⚰️ Defeat! The battle is lost. The world must rely on another group of adventurers. 😈 ${monster.name} lived happily ever after.`
  );
}

function joinBattle(username) {
  console.log(users);
  users.push({ username: username, hasAttacked: false, hp: 150 });
  say(`⚔️ ${username} joined the battle alongside you.`);
}

function monsterAttack() {
  const randomUser = users[_.random(users.length - 1)];
  const monsterTarget = randomUser;
  if (!monsterTarget) {
    loseBattle();
  }
  const damage = _.random(19) + 1;
  monsterTarget.hp -= damage;
  if (monsterTarget.hp < 0) {
    users = users.filter((u) => u.username !== monsterTarget.username);
    say(
      `⚰️⚰️⚰️ Oh no! @${monsterTarget.username} has been killed by 😈 ${monster.name}`
    );
  }

  users.forEach((user) => (user.hasAttacked = false));

  say(
    `🔥 😈 ${monster.name} dealt ${damage} damage to @${monsterTarget.username}. ${monsterTarget.username} has ${monsterTarget.hp} ❤️ left.`
  );
}

function logChatToPage(tags, message) {
  console.log(`${tags["display-name"]}: ${message}`);
  const nameAndMessage = `${tags["display-name"]}: ${message}`;
  appendToDom(nameAndMessage);
}

function appendToDom(message) {
  const messageItem = document.createElement("li");
  messageItem.innerHTML = _.escape(message);
  document.querySelector("#chat-messages").appendChild(messageItem);
}
