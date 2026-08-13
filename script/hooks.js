import { AskhemActor } from "./actor/askhem-actor.js";
import { PlayerCharacterSheet } from "./sheet/player.js";
import { NpcCharacterSheet } from "./sheet/npc.js";
import { AskhemMonsterSheet } from "./sheet/monster.js";
import {
  prepareRollNewDialog,
  push,
  registerGearSelectTooltip,
  totalRoll as totalRoll,
} from "./util/roll.js";
import { registerSystemSettings } from "./util/settings.js";
import { askhem } from "./config.js";
import { conditions } from "./util/conditions.js";
import { YearZeroRollManager } from "./lib/yzur.js";
import { AskhemItemSheet } from "./sheet/itemSheet.js";
import { migrate } from "./util/migrator.js";
import { AskhemTokenHUD } from "./util/token.js";
import ChatMessageAskhem from "./util/chat.js";
import { registerDefaultFonts } from "./fonts.js";
import { ArchetypeSheet } from "./sheet/archetypeSheet.js";
import { AskhemCharacterWizard } from "../apps/character-wizard.js";

Hooks.on("renderChatMessageHTML", (app, html, data) => {
  ChatMessageAskhem.activateListeners(html);
});

Hooks.once("init", async () => {
 registerDefaultFonts();
  CONFIG.askhem = askhem;
  CONFIG.Combat.initiative = { formula: "1d10", decimals: 0 };
  CONFIG.Actor.documentClass = AskhemActor;
  CONFIG.ChatMessage.documentClass = ChatMessageAskhem;
  CONFIG.anonymousSheet = {};
  CONFIG.roll = prepareRollNewDialog;
  CONFIG.push = push;
  CONFIG.Cards.presets = {
    initiative: {
      label: "Askhem initiativkortlek",
      src: "systems/askhem1713/asset/cards/askhem-initiative-deck.json",
      type: "deck",
    },
  };
  CONFIG.hasYZECombatActive = game.modules.get("yze-combat")?.active;

  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      pattern: /@RAW\[(.+?)\]/gm,
      enricher: async (match, options) => {
        const myData = await $.ajax({
          url: match[1],
          type: "GET",
        });
        const doc = document.createElement("span");
        doc.innerHTML = myData;
        return doc;
      },
    },
  ]);

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

  foundry.documents.collections.Actors.registerSheet("askhem", PlayerCharacterSheet, {
    types: ["player"],
    makeDefault: true,
  });
  foundry.documents.collections.Actors.registerSheet("askhem", NpcCharacterSheet, {
    types: ["npc"],
    makeDefault: true,
  });
  // Uppdaterad registrering till "askhem" för monsterbladet
  foundry.documents.collections.Actors.registerSheet("askhem", AskhemMonsterSheet, {
    types: ["monster"],
    makeDefault: true,
  });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
 foundry.documents.collections.Items.registerSheet("askhem", AskhemItemSheet, { 
    types: ["criticalInjury", "weapon", "armor", "talent", "gear", "magic", "misery", "archetype", "skill"],
    makeDefault: true 
  });
  foundry.documents.collections.Items.registerSheet("askhem", ArchetypeSheet, {
    types: ["archetype"],
    makeDefault: true
  });

  registerSystemSettings();
  await preloadHandlebarsTemplates();

  Handlebars.registerHelper("enrichHtmlHelper", function (rawText) {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(rawText, { async: false });
  });

  Handlebars.registerHelper("ifIn", function (elem, list, options) {
    if (list && list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  YearZeroRollManager.register("vae", {
    "ROLL.baseTemplate": "systems/askhem1713/model/templates/dice/broll.hbs",
    "ROLL.chatTemplate": "systems/askhem1713/model/templates/dice/roll.hbs",
    "ROLL.tooltipTemplate": "systems/askhem1713/model/templates/dice/tooltip.hbs",
    "ROLL.infosTemplate": "systems/askhem1713/model/templates/dice/infos.hbs",
  });
});

Hooks.once("ready", async function () {
  setupCards();
  conditions.onReady();
  Hooks.on("hotbarDrop", (bar, data, slot) => createRollMacro(data, slot));
  Hooks.on("chatMessage", (_, messageText, chatData) =>
    totalRoll(messageText, chatData)
  );
  migrate();
  registerGearSelectTooltip();

  $(document).on("click", ".learn-talent-btn", async (event) => {
    event.preventDefault();
    const button = $(event.currentTarget);
    const action = button.data("action");
    const card = button.closest(".chat-card");
    const messageLi = button.closest(".message");
    const messageId = messageLi.data("messageId");
    
    if (!game.user.isGM) return;

    let actor = null;
    let message = game.messages.get(messageId);
    if (message && message.speaker && message.speaker.actor) {
      actor = game.actors.get(message.speaker.actor);
    }

    if (action === "yes") {
      card.find("div").first().append("<p style='color: green; font-weight: bold; margin-top: 5px;'>Spelledaren godkände: Slaget räknas som en framgång!</p>");
      
      if (actor) {
        await ChatMessage.create({
          content: `<p><b>${actor.name}</b> får en automatisk framgång på Lärdomsslaget tack vare talangen Lärd.</p>`,
          speaker: ChatMessage.getSpeaker({ actor: actor })
        }, { rollMode: "publicroll" });
      }
    } else {
      card.find("div").first().append("<p style='color: red; font-weight: bold; margin-top: 5px;'>Spelledaren avböjde: Resultatet förblir oförändrat.</p>");
      
      if (actor) {
        let whisperTargets = game.users.filter(u => !u.isGM && (actor.testUserPermission(u, "OWNER") || actor.ownership[u.id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)).map(u => u.id);
        if (whisperTargets.length === 0) {
          whisperTargets = game.users.filter(u => !u.isGM && u.active).map(u => u.id);
        }
        
        await ChatMessage.create({
          content: `<p style="color: red;">Spelledaren bedömde att ämnet föll utanför <b>${actor.name}s</b> kunskapsområde för talangen Lärd. Resultatet kvarstår.</p>`,
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          whisper: whisperTargets
        });
      }
    }
    
    card.find(".learn-talent-btn").prop("disabled", true).css("opacity", "0.6");
  });

  game.socket.on("system.askhem1713", async (data) => {
    if (data.type === "requestSymptomRoll") {
      const ownedActors = game.actors.filter(a => a.type === "player" && a.isOwner);
      for (let actor of ownedActors) {
        new Dialog({
          title: "En ny dag har grytt",
          content: `<p>Slå för symptom för <b>${actor.name}</b>.</p>`,
          buttons: {
            roll: {
              label: "Slå för Symptom",
              callback: async () => {
                if (actor.sheet) await actor.sheet._onRollSymptom();
              }
            }
          }
        }).render(true);
      }
    }
  });

  if (typeof SimpleCalendar !== "undefined" && SimpleCalendar.Hooks?.DateTimeChange) {
    Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async (data) => {
      if (!game.user.isGM) return;

      for (let actor of game.actors.filter(a => a.type === "player")) {
        let injuryUpdates = [];
        let injuryDeletes = [];

        for (let item of actor.items.filter(i => i.type === "criticalInjury")) {
          const timeLimitStr = item.system.timeLimit ? item.system.timeLimit.toString() : "";
          const match = timeLimitStr.match(/(\d+)(.*)/);
          if (match) {
            let currentVal = parseInt(match[1]) || 0;

            if (currentVal > 1) {
              let newVal = currentVal - 1;
              let newSuffix = (newVal === 1) ? " dag" : " dagar";
              injuryUpdates.push({
                _id: item.id,
                "system.timeLimit": newVal + newSuffix
              });
            } else if (currentVal === 1) {
              injuryDeletes.push(item.id);
            }
          }
        }

        if (injuryUpdates.length > 0) {
          await actor.updateEmbeddedDocuments("Item", injuryUpdates);
        }
        if (injuryDeletes.length > 0) {
          await actor.deleteEmbeddedDocuments("Item", injuryDeletes);
        }
      }

      game.socket.emit("system.askhem1713", { type: "requestSymptomRoll" });
    });
  }

  let allMonsters = game.actors.filter((it) => it.type == "monster");

  allMonsters.forEach((monster) => {
    let conditions = monster.items.filter((c) => c.type == "condition");
    let count = 0;
    conditions.forEach((condition) => {
      count++;
      const img = "systems/askhem1713/asset/counter_tokens/" + count + ".png";
      condition.update({ img: img });
    });
  });
});

Hooks.on("canvasReady", () => {
  canvas.hud.token = new AskhemTokenHUD();
});

Hooks.on("updateActor", (actor, changes, diff, userId) => {
  if (!game.scenes.current || !actor.isOwner || changes.name == undefined)
    return;
  game.scenes.current.tokens.forEach((x) => {
    if (x.actorId !== actor._id) return;

    actor.update({ "token.name": actor.name });
    x.update({ name: actor.name });
  });
});

Hooks.on("yze-combat.fast-action-button-clicked", async function (data) {
  await conditions.onActionCondition(data);
});

Hooks.on("yze-combat.slow-action-button-clicked", async function (data) {
  await conditions.onActionCondition(data);
});

Hooks.on("updateCombat", async function (e) {
  if (!game.user.isGM) return;
  await conditions.onActionUpdate(e.current.tokenId, e.combatant, e.turn);
});

Hooks.on("deleteCombat", async function (e) {
  if (!game.user.isGM) return;
  await conditions.onCombatStartEnd(e);
});

Hooks.on("combatStart", async function (e) {
  if (!game.user.isGM) return;
  await conditions.onCombatStartEnd(e);
});

Hooks.on("combatRound", async function (e) {
  if (!game.user.isGM) return;
  await conditions.onCombatStartEnd(e);
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem({ id: "askhem1713", name: "Askhem" }, "true");
  dice3d.addColorset({
    name: "askhem1713",
    description: "Akhem-tärningar",
    category: "Askhem",
    foreground: "#2D1A00",
    background: "#e2c8b6",
    outline: "#402117",
    material: "wood",
    default: true,
  });
  dice3d.addDicePreset({
    type: "d6",
    labels: [
      "systems/askhem1713/asset/dsn/dsn-d6-1.png",
      "systems/askhem1713/asset/dsn/dsn-d6-2.png",
      "systems/askhem1713/asset/dsn/dsn-d6-3.png",
      "systems/askhem1713/asset/dsn/dsn-d6-4.png",
      "systems/askhem1713/asset/dsn/dsn-d6-5.png",
      "systems/askhem1713/asset/dsn/dsn-d6-6.png",
    ],
    bumpMaps: [
      "systems/askhem1713/asset/dsn/dsn-d6-1-bump.png",
      "systems/askhem1713/asset/dsn/dsn-d6-2-bump.png",
      "systems/askhem1713/asset/dsn/dsn-d6-3-bump.png",
      "systems/askhem1713/asset/dsn/dsn-d6-4-bump.png",
      "systems/askhem1713/asset/dsn/dsn-d6-5-bump.png",
      "systems/askhem1713/asset/dsn/dsn-d6-6-bump.png",
    ],
    colorset: "askhem1713",
    system: "askhem1713",
  });
  dice3d.addDicePreset(
    {
      name: "ds",
      type: "ds",
      labels: [
        "systems/askhem1713/asset/dsn/dsn-d6-1.png",
        "systems/askhem1713/asset/dsn/dsn-d6-2.png",
        "systems/askhem1713/asset/dsn/dsn-d6-3.png",
        "systems/askhem1713/asset/dsn/dsn-d6-4.png",
        "systems/askhem1713/asset/dsn/dsn-d6-5.png",
        "systems/askhem1713/asset/dsn/dsn-d6-6.png",
      ],
      bumpMaps: [
        "systems/askhem1713/asset/dsn/dsn-d6-1-bump.png",
        "systems/askhem1713/asset/dsn/dsn-d6-2-bump.png",
        "systems/askhem1713/asset/dsn/dsn-d6-3-bump.png",
        "systems/askhem1713/asset/dsn/dsn-d6-4-bump.png",
        "systems/askhem1713/asset/dsn/dsn-d6-5-bump.png",
        "systems/askhem1713/asset/dsn/dsn-d6-6-bump.png",
      ],
      colorset: "askhem1713",
      system: "askhem1713",
    },
    "d6"
  );
});

async function setupCards() {
  const initiativeDeckId = game.settings.get("askhem1713", "initiativeDeck");
  const initiativeDeck = game.cards?.get(initiativeDeckId);
  if (initiativeDeckId && initiativeDeck) return;
  ui.notifications.info("UI.NoInitiativeDeckFound", { localize: true });
  const preset = CONFIG.Cards.presets.initiative;
  const data = await foundry.utils.fetchJsonWithTimeout(preset.src);
  const cardsCls = getDocumentClass("Cards");
  const newDeck = await cardsCls.create(data);
  await game.settings.set("askhem1713", "initiativeDeck", newDeck?.id);
  await newDeck?.shuffle({ chatNotification: false });
}

function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/askhem1713/model/player.hbs",
    "systems/askhem1713/model/tab/player-main.hbs",
    "systems/askhem1713/model/tab/player-combat.hbs",
    "systems/askhem1713/model/tab/player-favorites.hbs",
    "systems/askhem1713/model/tab/player-talent.hbs",
    "systems/askhem1713/model/tab/player-gear.hbs",
    "systems/askhem1713/model/tab/player-magic.hbs",
    "systems/askhem1713/model/tab/player-note.hbs",
    "systems/askhem1713/model/npc.hbs",
    "systems/askhem1713/model/tab/npc-main.hbs",
    "systems/askhem1713/model/tab/npc-note.hbs",
    "systems/askhem1713/model/monster.hbs",
    "systems/askhem1713/model/tab/monster-main.hbs",
    "systems/askhem1713/model/tab/monster-note.hbs",
    "systems/askhem1713/model/character-creation-dialog.hbs",
    "systems/askhem1713/model/character-advancement-dialog.hbs",
    "systems/askhem1713/model/items/criticalInjury.hbs",
    "systems/askhem1713/model/items/weapon.hbs",
    "systems/askhem1713/model/items/armor.hbs",
    "systems/askhem1713/model/items/talent.hbs",
    "systems/askhem1713/model/items/gear.hbs",
    "systems/askhem1713/model/items/magic.hbs",
    "systems/askhem1713/model/items/misery.hbs",
    "systems/askhem1713/model/items/archetype.hbs",
    "systems/askhem1713/model/items/skill.hbs",
    "systems/askhem1713/model/tab/changelog.hbs",
  ];
  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

async function createRollMacro(data, slot) {
  let command = "";
  if (data.type === "skill") {
    command = `
if (actor == null || actor.type !== "player")
  return;
   
actor.sheet.rollSkill("${data.skillKey}");`;
  } else if (data.type === "attribute") {
    command = `
if (actor == null || actor.type !== "player")
  return;
   
actor.sheet.rollAttribute("${data.attributeKey}");`;
  } else if (data.type === "fear") {
    command = `
if (actor == null || actor.type !== "player")
  return;
   
actor.sheet.rollFear("${data.attributeKey}");`;
  } else if (data.type === "weapon") {
    command = `
if (actor == null || actor.id != "${data.actorId}")
  return;
   
actor.sheet.rollWeapon("${data.itemId}");`;
  }

  if (command === "") return;

  let macro = game.macros.find((m) => m.name === data.text);
  if (!macro) {
    macro = await Macro.create({
      name: data.text,
      type: "script",
      img: data.img,
      command: command,
      flags: { "askhem.skillRoll": true },
    });
  }

  game.user.assignHotbarMacro(macro, slot);
  return false;
}
Hooks.on("renderActorDirectory", (app, html) => {
  const sidebar = document.getElementById("actors");
  if (!sidebar) return;

  game.actors.forEach(actor => {
    if (actor.getFlag("askhem1713", "isCreating")) {
      const element = sidebar.querySelector(`.directory-item[data-document-id="${actor.id}"]`);
      if (element) {
        element.style.display = "none";
      }
    }
  });

  if (sidebar.querySelector(".askhem-create-character-btn")) return;

  const footer = sidebar.querySelector(".directory-footer");
  if (!footer) return;

  const button = document.createElement("button");
  button.classList.add("askhem-create-character-btn");
  button.innerHTML = `<i class="fa-solid fa-user-plus"></i> Skapa rollperson (Guide)`;
  
  button.addEventListener("click", (event) => {
    event.preventDefault();
    new AskhemCharacterWizard().render(true);
  });

  footer.appendChild(button);
});