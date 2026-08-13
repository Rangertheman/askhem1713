import { push } from "./roll.js";

export default class ChatMessageAskhem extends ChatMessage {
  prepareData() {
    super.prepareData();
    this._shimFlags();
    if (!this.flags.askhem?.item?.data && this.flags.askhem?.item?.id) {
      const itemData = this.getFlag("askhem", "use.consumed.deleted")?.find(
        (i) => i._id === this.flags.askhem.item.id
      );
      if (itemData)
        Object.defineProperty(this.flags.askhem.item, "data", {
          value: itemData,
        });
    }
  }

  /**
   * Moderniserad för Foundry V13/V14+ för att undvika varningar kring renderChatMessage.
   * Tar emot antingen ett HTML-element eller jQuery-objekt beroende på kontext.
   */
  static activateListeners(html) {
    const container = html instanceof HTMLElement ? html : (html[0] ?? html);
    if (!container || typeof container.querySelectorAll !== "function") return;

    const buttons = container.querySelectorAll(".dice-button.push, .push, button[data-action=\"push\"]");
    for (let i = 0; i < buttons.length; i++) {
      if (!buttons[i]._askhemListenerAdded) {
        buttons[i].addEventListener('click', _onPush);
        buttons[i]._askhemListenerAdded = true;
      }
    }
  }

  hideChatActionButtons(message, html, data) {
    const elements = html instanceof HTMLElement ? [html] : html;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.classList && el.classList.contains("askhem.chat-card")) {
        let user = game.actors.get(el.getAttribute("data-owner-id"));
        const buttons = el.querySelectorAll(".push");
        if (user && !user.isOwner) {
          buttons.forEach((btn) => {
            btn.style.display = "none";
          });
        }
      }
    }
  }

  _shimFlags() {
    console.log("Shimming flags");
  }
}

export async function buildChatCard(type, data) {
  let message = "";
  let chatData = {};
  let token = "";
  const actor = game.actors.get(ChatMessage.getSpeaker().actor);
  if (actor) {
    token = actor.img;
  } else {
    token = "systems/askhem1713/asset/info.png";
  }
  switch (type) {
    case "armor":
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <div><b>` + game.i18n.localize("ARMOR.PROTECTION") + `: </b>` + data.system.protection + `</div>
                  <div><b>` + game.i18n.localize("ARMOR.AGILITY") + `: </b>` + data.system.agility + `</div>
                  <div><b>` + game.i18n.localize("ARMOR.AVAILABILITY") + `: </b>` + data.system.availability + `</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        token: token,
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "attack":
      let desc = "";
      let attr = data.system.attribute;
      let label = "";
      if (attr == "bodyControl") {
        label = "ATTRIBUTE.BODY_CONTROL_ROLL";
      } else {
        label = "ATTRIBUTE." + attr.toUpperCase() + "_ROLL";
      }
      let testName = game.i18n.localize(label);
      if (data.system.description != "") {
        desc = data.system.description + "</br>";
      }
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("ATTACK.ATTRIBUTE") + `: </b>` + testName + `</br>
                  <b>` + game.i18n.localize("ATTACK.DAMAGE") + `: </b>` + data.system.damage + `</br>
                  <b>` + game.i18n.localize("ATTACK.RANGE") + `: </b>` + data.system.range + `</br>
                  ` + desc + `
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "condition":
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("CONDITION.BONUS") + `: </b>` + data.system.bonus + `</br>
                  ` + data.system.description + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "criticalInjury":
      let timeLimit = "";
      if (data.system.timeLimit != "") {
        timeLimit =
          "<b>" +
          game.i18n.localize("CRITICAL_INJURY.TIME_LIMIT") +
          ": </b>" +
          data.system.timeLimit +
          "</br>";
      }

      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + game.i18n.localize("CRITICAL_INJURY.NAME") + `: ` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("CRITICAL_INJURY.TYPE") + `: </b><span class="title-case">` + data.system.type + `</span></br>
                  <b>` + game.i18n.localize("CRITICAL_INJURY.FATAL") + `: </b>` + data.system.fatal + `</br>
                  ` + timeLimit + `
                  ` + data.system.effect + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "gear":
      let description = "";
      let risk = "";

      if (data.system.description != "") {
        description = data.system.description + "</br>";
      }
      if (data.system.risk != "") {
        risk =
          "<b>" +
          game.i18n.localize("GEAR.RISK") +
          ": </b>" +
          data.system.risk +
          "</br>";
      }

      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("GEAR.BONUS") + `: </b>` + data.system.bonus + `</br>
                  <b>` + game.i18n.localize("GEAR.AVAILABILITY") + `: </b>` + data.system.availability + `</br>
                  <b>` + game.i18n.localize("GEAR.EFFECT") + `: </b>` + data.system.effect + `</br>
                  ` + description + `
                  ` + risk + `
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "magic":
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("MAGIC.CATEGORY") + `: </b>` + data.system.category + `</br>
                  ` + data.system.description + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "talent":
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  ` + data.system.description + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "upgrade":
      let prereq = "";
      let asset = "";
      if (data.system.prerequisite != "") {
        prereq =
          "<b>" +
          game.i18n.localize("UPGRADE.PREREQUISITE") +
          ": </b>" +
          data.system.prerequisite +
          "</br>";
      }
      if (data.system.asset != "") {
        asset =
          "<b>" +
          game.i18n.localize("UPGRADE.ASSET") +
          ": </b>" +
          data.system.asset +
          "</br>";
      }

      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("UPGRADE.COST") + `: </b>` + data.system.cost + `</br>
                  ` + prereq + `
                  <b>` + game.i18n.localize("UPGRADE.FUNCTION") + `: </b>` + data.system.function + `</br>
                  ` + asset + `
                  ` + data.system.description + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "weapon":
      let skill = "";
      if (data.system.skill == "closeCombat") {
        skill = game.i18n.localize("SKILL.CLOSE_COMBAT");
      } else if (data.system.skill == "rangedCombat") {
        skill = game.i18n.localize("SKILL.RANGED_COMBAT");
      } else {
        skill = game.i18n.localize("SKILL.FORCE");
      }
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("WEAPON.DAMAGE") + `: </b>` + data.system.damage + `</br>
                  <b>` + game.i18n.localize("WEAPON.RANGE") + `: </b>` + data.system.range + `</br>
                  <b>` + game.i18n.localize("WEAPON.BONUS") + `: </b>` + data.system.bonus + `</br>
                  <b>` + game.i18n.localize("WEAPON.AVAILABILITY") + `: </b>` + data.system.availability + `</br>
                  <b>` + game.i18n.localize("WEAPON.SKILL") + `: </b>` + skill + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "relationship":
      message =
        `<div class="card-holder">
          <img src="` + token + `" width="45" height="45" class="roll-token" />
          <div class="askhem chat-card">
            <div class="card-content borderimg">
              <div class="dice-roll flexcol">
                <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">` + data.name.toUpperCase() + `</div>
                <div class="askhem-roll-divider"></div>
                <div class="chat-item-info column" style="text-align: left; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                  <b>` + game.i18n.localize("BIO.RELATIONSHIP") + `: </b>` + data.system.description + `</br>
                  <b>` + game.i18n.localize("NOTES") + `: </b>` + data.system.notes + `</br>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
  }

  return chatData;
}

async function _onPush(event) {
  event.preventDefault();
  console.log("Askhem | _onPush klickades!", event);

  let chatCard = event.currentTarget.closest(".chat-message") || event.currentTarget.closest(".message");
  if (!chatCard) {
    console.log("Askhem | Hittade inget .chat-message eller .message element.");
    return;
  }
  
  let messageId = chatCard.dataset.messageId || chatCard.getAttribute("data-message-id");
  if (!messageId) {
    console.log("Askhem | Hittade inget meddelande-ID på elementet.");
    return;
  }

  let message = game.messages.get(messageId);
  if (!message) {
    console.log("Askhem | Hittade inget meddelande med ID:", messageId);
    return;
  }

  let actor = ChatMessage.getSpeakerActor(message.speaker);
  if (!actor) {
    console.log("Askhem | Kunde inte hitta aktör från meddelandets speaker.");
    return;
  }

  if (!actor.sheet || !actor.sheet.dices) {
    console.log("Askhem | Aktörens sheet eller sheet.dices saknas.", actor);
    return;
  }

  console.log("Askhem | Anropar push med sheet för aktör:", actor.name);
  await push(actor.sheet, message);
}