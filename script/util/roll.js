import { YearZeroRoll } from "../lib/yzur.js";
import ChatMessageVaesen, { buildChatCard } from "../util/chat.js";

export function prepareRollNewDialog(
  sheet,
  testName,
  baseDiceLines = [],
  damageDefault = null,
  gearBonus = null,
  talentBonus = null,
  recoveryBonus = null,
  criticalInjuryBonus = null,
  attributeKey = null,
  skillKey = null,
  item = null,
  passedSkillKey = null
) {
  let baseLines = [];
  let baseDiceDice = 0;
  let conditionsPenalties = 0;
  let breakdown = [];

  baseDiceLines.forEach((element) => {
    if (element == null) return;
    if (element.type === "conditions" && game.settings.get("vaesen", "conditionAlternativeRule"))
      return;

    let tooltip = element.tooltip ?? "";
    baseLines.push(
      `
<div class="flex row" style="flex-basis: 35%; justify-content: space-between; width: 100%;">
<p style="text-transform: capitalize; white-space:nowrap;">` +
      element.name +
      `: </p>
<input style="text-align: center" type="text" value="` +
      element.value +
      `" readonly data-tooltip="` +
      tooltip +
      `" data-tooltip-direction="RIGHT" data-tooltip-class="vaesen-tooltip"/></div>`
    );

    baseDiceDice += parseInt(element.value, 10);
    var moreInfo = tooltip
      ? `<ul><li>${tooltip.replaceAll("<br>", "</li><li>")}</li></ul>`
      : "";
    breakdown.push(
      `${element.name}: ${adjustBonusText(element.value)}${moreInfo}`
    );
    if (element.type === "conditions")
      conditionsPenalties = parseInt(element.value, 10);
  });

  let bonusHtml = buildInputHtmlDialog(
    game.i18n.localize("ROLL.BONUS"),
    0,
    "bonus"
  );
  let damageHtml =
    damageDefault === null
      ? ""
      : buildInputHtmlDialog(
        game.i18n.localize("ROLL.DAMAGE"),
        damageDefault,
        "damage"
      );

  let gearHtml = buildGearSelectHtmlDialog(gearBonus);
  let talentHtml = buildSelectMultipleHtmlDialog(
    talentBonus,
    "TALENT.NAME",
    "talent"
  );
  let upgradeHtml = buildSelectMultipleHtmlDialog(
    recoveryBonus,
    "UPGRADE.NAME",
    "upgrade"
  );
  let criticalInjuriesHtml = buildSelectMultipleHtmlDialog(
    criticalInjuryBonus,
    "CRITICAL_INJURY.NAME",
    "criticalInjury"
  );

  let extraLines = [];
  extraLines.push(gearHtml);
  extraLines.push(talentHtml);
  extraLines.push(criticalInjuriesHtml);
  extraLines.push(upgradeHtml);
  extraLines.push(bonusHtml);
  extraLines.push(damageHtml);
  const extraLinesHtml = extraLines.join("");
  const baseLinesHtml = baseLines.join("");

  let d = new Dialog(
    {
      title: "Test : " + testName,
      content: buildDivHtmlNewDialog(
        testName,
        baseLinesHtml,
        baseDiceDice,
        extraLinesHtml
      ),
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("ROLL.ROLL"),
          callback: (html) => {
            let bonus = parseInt(html.find("#bonus")[0].value, 10);
            let gear = 0;
            var talent = 0;
            var criticalInjury = 0;
            var upgrades = 0;
            var damage = 0;
            let gearSelect = html.find("#gear")[0];
            let talentSelect = html.find("#talent")[0];
            let criticalInjurySelect = html.find("#criticalInjury")[0];
            let upgradeSelect = html.find("#upgrade")[0];
            let damageInput = html.find("#damage")[0];
            if (gearSelect) {
              if (gearSelect.value != 0) {
                breakdown.push(gearSelect.selectedOptions[0].text);
                gear = parseInt(gearSelect.value, 10);
              }
            }
            if (talentSelect) {
              let conditionsIgnored = false;
              let options = talentSelect.selectedOptions;
              Array.from(options).map(({ text, value }) => {
                let selectedTalent = talentBonus.find((x) => x.name == value);
                breakdown.push(text);
                if (
                  selectedTalent.bonusType == "skill" ||
                  selectedTalent.bonusType == "fear"
                )
                  talent += parseInt(selectedTalent.bonus, 10);
                else if (selectedTalent.bonusType === "damage")
                  damage += parseInt(selectedTalent.bonus, 10);
                else if (
                  selectedTalent.bonusType.startsWith("ignoreCondition") &&
                  !conditionsIgnored
                ) {
                  talent += -conditionsPenalties;
                  conditionsIgnored = true;
                }
              });
            }
            if (criticalInjurySelect) {
              let options = criticalInjurySelect.selectedOptions;
              Array.from(options).map(({ text, value }) => {
                let selectedCriticalInjury = criticalInjuryBonus.find((x) => x.name == value);
                breakdown.push(text);
                criticalInjury += parseInt(selectedCriticalInjury.bonus, 10);
              });
            }
            if (upgradeSelect) {
              let options = upgradeSelect.selectedOptions;
              Array.from(options).map(({ text, value }) => {
                let selectedUpgrade = recoveryBonus.find((x) => x.name == value);
                if (!selectedUpgrade)
                  return;
                breakdown.push(text);
                upgrades += parseInt(selectedUpgrade.bonus, 10);
              });
            }
            if (damageInput) damage += parseInt(damageInput.value, 10);
            if (bonus > 0)
              breakdown.push(
                `${game.i18n.localize("ROLL.BONUS")}: ${adjustBonusText(bonus)}`
              );
            roll(
              sheet,
              testName,
              baseDiceDice,
              0,
              bonus + gear + talent + upgrades + criticalInjury,
              damage,
              breakdown,
              item,
              passedSkillKey
            );
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("ROLL.CANCEL"),
          callback: () => { },
        },
      },
      default: "roll",
      close: () => { },
    },
    { width: "330" }
  );
  d.render(true);
}

export function roll(
  sheet,
  testName,
  attribute,
  skill,
  bonus,
  damage,
  breakdown,
  item = null,
  skillKey = null
) {
  sheet.dices = new YearZeroRoll();
  sheet.lastTestName = testName;
  sheet.lastDamage = damage;
  let numberOfDice = attribute + skill + bonus;

  rollDice(sheet, numberOfDice, breakdown, item, skillKey);
}

export async function push(sheet, message = null) {
  if (!sheet.dices) {
    return;
  }
  
  let roll = sheet.dices;

  if (!roll.pushable) return;
  
  await roll.push();

  let actor = game.actors.get(sheet.object._id);
  let onesCount = 0;
  let currentMiasma = 0;

  if (actor) {
    onesCount = roll.baneCount || roll.count('skill', 1);
    currentMiasma = foundry.utils.getProperty(actor, "system.miasma") || 0;
  }

  sheet.dices = roll;

  if (actor && onesCount > 0) {
    let table = game.tables.getName("Missödestabell");
    if (table) {
      let rollFormula = `1d6*10 + 1d6 + ${currentMiasma}`;
      let t66Roll = new Roll(rollFormula);
      await t66Roll.evaluate();
      
      let totalResult = t66Roll.total;
      let extraMiasmaToAdd = 0;
      let targetRollForTable = totalResult;

      if (totalResult >= 41 && totalResult <= 51) {
        let miseryItem = actor.items.find(i => i.type === "misery");
        if (miseryItem) {
          let currentSymptom = parseInt(miseryItem.system.symptom) || 0;
          
          if (currentSymptom === 0) {
            await miseryItem.update({
              "system.symptom": -1,
              "system.symptomName": "Svåra symptom (-1)"
            });
          } else if (currentSymptom === -1) {
            await miseryItem.update({
              "system.symptom": -2,
              "system.symptomName": "Outhärdliga symptom (-2)"
            });
          } else if (currentSymptom <= -2) {
            targetRollForTable = 58;
            totalResult = 58;
          }
        }
      } else if (totalResult >= 26 && totalResult <= 40) {
        extraMiasmaToAdd = 1;
      }

      let exactRoll = new Roll(String(targetRollForTable));
      await exactRoll.evaluate();
      let drawn = await table.draw({ roll: exactRoll, displayChat: false });
      
      if (drawn && drawn.results) {
        let resultText = drawn.results.map(r => r.text).join("<br>");
        let token = actor.prototypeToken?.texture?.src || actor.img || "systems/askhem1713/asset/unkown_roller.svg";
        
        let content = `
          <div class="card-holder">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class="vaesen chat-card" data-owner-id="${actor.id}">
              <div class="card-content borderimg">
                <div class="dice-roll flexcol">
                  <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">MISSÖDESTABELL (${totalResult})</div>
                  <div class="dice-result" style="text-align: left; padding: 5px 0; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                    ${resultText}
                  </div>
                </div>
              </div>
            </div>
          </div>`;
          
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          content: content,
          user: game.user.id
        });

        if (extraMiasmaToAdd > 0) {
          onesCount += extraMiasmaToAdd;
        }
      }
    } else {
      ui.notifications.warn("Ingen tabell med namnet 'Missödestabell' hittades.");
    }

    let newMiasma = currentMiasma + onesCount;
    await actor.update({ "system.miasma": newMiasma });
  }

  let pressFlavor = "PRESSAT SLAG";
  let token = actor ? actor.prototypeToken?.texture?.src : null;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor, token: token }),
    flavor: pressFlavor
  }, {
    rollMode: game.settings.get("core", "rollMode")
  });

  if (message) {
    await message.delete();
  }
}

async function rollDice(sheet, numberOfDice, breakdown, item = null, skillKey = null) {
  let actor = game.actors.get(sheet.object._id);
  let token = actor.prototypeToken.texture.src;

  if (numberOfDice <= 0) {
    numberOfDice = 1;
  }

  let isNpc = actor.type === "npc";
  let isMagic = item && item.type === "magic";
  let maxPushValue = (isNpc || isMagic) ? 0 : 1;

  let dice = {
    term: "s",
    number: numberOfDice,
  };

  let options = {
    name: sheet.lastTestName,
    token: token,
    damage: sheet.lastDamage,
    breakdown: breakdown,
    maxPush: maxPushValue,
    yzGame: "vae",
  };

  let r = YearZeroRoll.forge(
    dice,
    {
      owner: actor.id,
      token: token,
      name: sheet.lastTestName,
      damage: sheet.lastDamage,
      maxPush: maxPushValue,
      yzGame: "vae",
    },
    options
  );

  await r.evaluate();

  await r.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor, token: token }),
  });

  sheet.dices = r;

  if (skillKey === "learning" && r.successCount === 0 && actor) {
    let hasLearningTalent = actor.items.some(i => i.type === "talent" && i.name.trim().toLowerCase() === "lärd");
    if (hasLearningTalent) {
      let gmUsers = game.users.filter(u => u.isGM && u.active).map(u => u.id);
      if (gmUsers.length > 0) {
        let content = `
          <div class="card-holder">
            <div class="vaesen chat-card">
              <div class="card-content borderimg" style="padding: 8px;">
                <p><b>${actor.name}</b> misslyckades med ett Lärdomsslag, men har talangen <b>Lärd</b>.</p>
                <p>Ligger ämnet inom rollpersonens kunskapsområde?</p>
                <div style="display: flex; gap: 8px; margin-top: 8px; justify-content: center;">
                  <button class="learn-talent-btn" data-action="yes" data-actor-id="${actor.id}" style="flex: 2; padding: 4px 6px; cursor: pointer; white-space: nowrap; font-size: 0.9em;">Ja (Skapa framgång)</button>
                  <button class="learn-talent-btn" data-action="no" style="flex: 1; padding: 4px 6px; cursor: pointer; white-space: nowrap; font-size: 0.9em;">Nej</button>
                </div>
              </div>
            </div>
          </div>`;

        await ChatMessage.create({
          content: content,
          whisper: gmUsers,
          speaker: ChatMessage.getSpeaker({ actor: actor, token: token })
        });
      }
    }
  }

  if (item && r.successCount > 0) {
    let description = item.system.description || "";

    let content = `
      <div class="card-holder">
        <img src="${token}" width="45" height="45" class="roll-token" />
        <div class="vaesen chat-card" data-owner-id="${actor.id}">
          <div class="card-content borderimg">
            <div class="dice-roll flexcol">
              <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">${item.name}</div>
              <div class="dice-result" style="text-align: left; padding: 5px 0; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                ${description}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor, token: token }),
      content: content,
      user: game.user.id
    });
  }
}

function printDices(sheet) {
  let message = "";
  sheet.dices.forEach((dice) => {
    message =
      message +
      "<img width='25px' height='25px' style='border:none;margin-right:2px;margin-top:2px' src='systems/vaesen/asset/dice-" +
      dice +
      ".png'/>";
  });
  return message;
}

function buildInputHtmlDialog(diceName, diceValue, type) {
  return (
    `
    <div class="flex row" style="flex-basis: 35%; justify-content: space-between; width: 100%;">
    <p style="text-transform: capitalize; white-space:nowrap;">` +
    diceName +
    `: </p>
    <input id="` +
    type +
    `" style="text-align: center" type="text" value="` +
    diceValue +
    `"/></div>`
  );
}

function buildGearSelectHtmlDialog(options) {
  if (options == null || options.length == 0) return "";

  var html = [];
  html.push(
    `<div class="flex row" style="flex-basis: 35%; justify-content: space-between;">`
  );
  html.push(
    `<p style="text-transform: capitalize; white-space:nowrap; margin-top: 4px;">` +
    game.i18n.localize("GEAR.NAME") +
    `: </p></div>`
  );
  html.push(`<div class="flex row" style="width: 100%;">`);
  html.push(`<select id="gear" style="width: 100%;" data-tooltip-direction="RIGHT" data-tooltip-class="vaesen-tooltip">`);
  html.push(`<option value="0">None (0)</option>`);
  options.forEach((element) => {
    let bonusValue = adjustBonusText(element.bonus);
    var descriptionWithoutTags = $("<p>").html(element.description).text();
    html.push(
      `<option value="` +
      element.bonus +
      `" data-tooltip="` +
      descriptionWithoutTags +
      `">` +
      element.name +
      ` (` +
      bonusValue +
      `)` +
      `</option>`
    );
  });
  html.push(`</select></div>`);
  return html.join("");
}

function buildSelectMultipleHtmlDialog(options, name, id) {

  if (options == null || options.length == 0) return "";

  let html = [];
  html.push(
    `<div class="flex row" style="flex-basis: 35%; justify-content: space-between;">`
  );
  html.push(
    `<p style="text-transform: capitalize; white-space:nowrap; margin-top: 4px;">${game.i18n.localize(name)}: </p></div>`
  );
  html.push(`<div class="flex row" style="width: 100%;">`);
  html.push(`<select id="${id}" style="width: 100%;" multiple data-tooltip-direction="RIGHT" data-tooltip-class="vaesen-tooltip">`);
  options.forEach((element) => {
    let descriptionWithoutTags = $("<p>").html(element.description).text();
    let requiresBonus =
      CONFIG.vaesen.bonusTypeRequiresBonus.indexOf(element.bonusType) > -1;
    let bonusValue = requiresBonus ? parseInt(element.bonus, 10) : null;
    if (bonusValue) bonusValue = `: ${adjustBonusText(bonusValue)}`;
    let bonusInfo =
      (element.bonusType
        ? game.i18n.localize(CONFIG.vaesen.bonusType[element.bonusType])
        : "") + (bonusValue ?? "");
    const fullDescription = `${element.name}<br>${bonusInfo}<br>${element.description}`;
    html.push(
      `<option value="${element.name}" data-tooltip="${fullDescription}">${element.name} (${bonusInfo})</option>`
    );
  });
  html.push(`</select></div>`);
  return html.join("");
}

function buildHtmlDialog(diceName, diceValue, type) {
  if (diceName === "") return ``;

  return (
    `
    <div class="flex row" style="flex-basis: 35%; justify-content: space-between;">
    <p style="text-transform: capitalize; white-space:nowrap;">` +
    diceName +
    `: </p>
    <input id="` +
    type +
    `" style="text-align: center" type="text" value="` +
    diceValue +
    `" readonly/></div>`
  );
}

function buildDivHtmlDialog(divContent) {
  return "<div class='vaesen roll-dialog '>" + divContent + "</div>";
}

function buildDivHtmlNewDialog(
  testName,
  baseDiceHtml,
  baseDiceValue,
  extraLinesHtml
) {
  let dialogHtmlContent = [];
  dialogHtmlContent.push("<div class='vaesen roll-dialog'>");
  dialogHtmlContent.push(`<div class="roll-fields">`);
  dialogHtmlContent.push(
    `<h2 class="title" style="width: 97%; margin: auto;"> ` +
    game.i18n.localize("ROLL.TEST") +
    `: ` +
    testName +
    `</h2>`
  );
  dialogHtmlContent.push(
    `<div class="flex column grow align-center heavy-border" style="width:300px;">` +
    baseDiceHtml +
    ` 
<div align-center style="flex-basis:33%;"> <strong>` +
    game.i18n.localize("ROLL.BASE.POOL") +
    `:</strong> ` +
    baseDiceValue +
    `</div></div>`
  );
  dialogHtmlContent.push(
    `<div class="flex column grow align-center light-border" style="width:300px; margin:auto; padding:5px; margin-bottom: 3px;">` +
    extraLinesHtml +
    `</div></div>`
  );
  dialogHtmlContent.push("</div></div>");
  return dialogHtmlContent.join("");
}

export function adjustBonusText(bonus) {
  bonus = parseInt(bonus, 10);
  return bonus > 0 ? "+" + bonus : bonus;
}

export function totalRoll(messageText, chatData) {
  const pattern = /^\/r ((\d*)d(\d+).*$)/g;
  const matches = [...messageText.toLowerCase().matchAll(pattern)];
  const customRolls = {
    "66": "1d6*10+1d6",
    "666": "1d6*100+1d6*10+1d6",
    "6666": "1d6*1000+1d6*100+1d6*10+1d6"
  };
  if (matches.length == 0)
    return true;

  let actor = undefined;
  if (chatData.speaker.actor)
    actor = game.actors.get(chatData.speaker.actor);

  const diceTerm = matches[0][3];
  const formula = customRolls[diceTerm];
  const numberDice = parseInt(matches[0][2] ? matches[0][2] : "1");

  if (Object.keys(customRolls).indexOf(diceTerm) == -1) {
    return true;
  }

  for (let index = 0; index < numberDice; index++) {
    createCustomRoll(actor, customRolls[diceTerm], `D${diceTerm}`);
  }
  return false;
}

async function createCustomRoll(actor, formula, name) {
  let options = {
    token: actor?.img,
    type: "total"
  };

  let templateData = {
    flavor: `${name} ${game.i18n.localize("ROLL.ROLL")}`,
    type: "total"
  };

  const roll = Roll.create(formula, options);

  let messageData = {
    content: await roll.render(templateData),
  };
  let rollMode = game.settings.get("core", "rollMode");

  await roll.toMessage(messageData, { rollMode });
}

export function registerGearSelectTooltip() {
  $("body").on("change", "#gear", function (e) {
    var optionSelected = $("option:selected", this);
    var tooltip = optionSelected.attr("data-tooltip") ?? "";
    $(this).attr("data-tooltip", tooltip);
  });
}