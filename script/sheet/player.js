import { adjustBonusText, prepareRollNewDialog, push } from "../util/roll.js";
import { YearZeroRoll } from "../lib/yzur.js";
import ChatMessageVaesen, { buildChatCard } from "../util/chat.js";

export class PlayerCharacterSheet extends foundry.appv1.sheets.ActorSheet {
  dices = new YearZeroRoll();
  lastTestName = "";
  lastDamage = 0;
  isOpeningCreationDialog = false;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["vaesen", "sheet", "actor"],
      width: 750,
      height: "auto",
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  get template() {
    const path = `systems/askhem1713/model/${this.actor.type}.hbs`;
    if (!game.user.isGM && this.actor.limited)
      return `systems/askhem1713/model/limited-sheet.hbs`;
    return path;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if (this.actor.isOwner) {
      buttons = [
        {
          label: game.i18n.localize("ROLL.ROLL"),
          class: "custom-roll",
          icon: "fas fa-dice",
          onclick: (ev) =>
            prepareRollNewDialog(this, game.i18n.localize("ROLL.ROLL")),
        },
        {
          label: game.i18n.localize("ROLL.PUSH"),
          class: "push-roll",
          icon: "fas fa-skull",
          onclick: (ev) => push(this),
        },
      ].concat(buttons);
    }
    return buttons;
  }

  async getData() {
    const source = this.actor.toObject();
    const actorData = this.actor.toObject(false);

    const context = {
      actor: actorData,
      source: source.system,
      system: actorData.system,
      items: actorData.items,
      effects: actorData.effects,
      owner: this.actor.isOwner,
      limited: this.actor.limited,
      options: this.options,
      editable: this.isEditable,
      type: this.actor.type,
      isCharacter: this.actor.type === "player",
    };
    
    context.system.hasSotmagi = actorData.items.some(i => 
        i.type === "talent" && i.name && i.name.trim().toLowerCase() === "sotmagiker"
    );

    context.miseryItems = actorData.items.filter(i => i.type === "misery").map(item => {
        const attrKey = item.system.attribute ? item.system.attribute.toUpperCase() : "UNKNOWN";
        item.localizedAttribute = game.i18n.localize("ATTRIBUTE." + attrKey);
        return item;
    });
    context.miseryCount = context.miseryItems.length;

    const sortedSkills = Object.entries(context.system.skill).sort((a, b) => {
      return game.i18n.localize(a[1].label).localeCompare(game.i18n.localize(b[1].label), 'sv');
    });
    context.system.skill = Object.fromEntries(sortedSkills);

    context.noteHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.note, {
        secrets: this.actor.owner,
        async: true,
    });

    this.computeSkills(context);
    this.computeItems(context);

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.actor.limited) return;

    html.find(".item-create").click((ev) => this.onItemCreate(ev));
    html.find(".item-edit").click((ev) => this.onItemUpdate(ev));
    html.find(".item-delete").click((ev) => this.onItemDelete(ev));
    html.find(".fav-togle").click((ev) => this.onToggleFavorite(ev));
    html.find(".roll-symptom").click((ev) => this._onRollSymptom(ev));
    
    html.find(".talent-name").click((ev) => this.onUseTalent(ev));
    html.find(".open-advancement").click((ev) => this._onOpenAdvancement(ev));

    html.find(".attribute b").click((ev) => {
      const div = $(ev.currentTarget).parents(".attribute");
      const attributeName = div.data("key");
      this.rollAttribute(attributeName);
    });
    html.find(".skill b").click((ev) => {
      const div = $(ev.currentTarget).parents(".skill");
      const skillName = div.data("key");
      this.rollSkill(skillName);
    });
    html.find(".armor-roll").click((ev) => this.onArmorRoll(ev));
    html.find(".weapon-roll").click((ev) => this.onWeaponRoll(ev));
    html.find(".magic-roll").click((ev) => this.onMagicRoll(ev));
    html.find(".roll-fear").click((ev) => this.rollFear(ev.currentTarget.dataset.key));
    html.find(".to-chat").click((ev) => this.sendToChat(ev));
    html.find("input").focusin((ev) => this.onFocusIn(ev));
    
    html.find("input[name='system.damageValue']").change((ev) => this._onDamageChange(ev));
  }

  async _onOpenAdvancement(event) {
    event.preventDefault();
    let currentExp = parseInt(this.actor.system.experience) || 0;
    let skillValues = foundry.utils.duplicate(this.actor.system.skill);
    
    let originalSkills = {};
    for (let [key, val] of Object.entries(this.actor.system.skill)) {
      originalSkills[key] = val.value;
    }

    let newTalents = [];

    const templateData = {
      system: {
        skill: skillValues
      },
      experience: currentExp
    };

    const htmlContent = await foundry.applications.handlebars.renderTemplate("systems/askhem1713/model/character-advancement-dialog.hbs", templateData);

    let hasUpdated = false;

    const dialogInstance = new Dialog({
      title: "Förbättra karaktär",
      content: htmlContent,
      buttons: {
        save: {
          label: "Klar",
          callback: async (html, event) => {
            if (hasUpdated) return;
            hasUpdated = true;

            if (event) event.preventDefault();
            dialogInstance.close();

            let updatePayload = { "system.experience": currentExp };
            for (let [key, val] of Object.entries(skillValues)) {
              updatePayload[`system.skill.${key}.value`] = val.value;
            }
            await this.actor.update(updatePayload);
            if (newTalents.length > 0) {
              await this.actor.createEmbeddedDocuments("Item", newTalents);
            }
          }
        }
      },
      render: (html) => {
        for (let key of Object.keys(skillValues)) {
          const currentLevel = skillValues[key].value;
          html.find(`.skill[data-key="${key}"]`).find(`#cost-${key}`).text((currentLevel + 1) * 3);
        }

        html.find(".adv-skill-btn").click((ev) => {
          const key = $(ev.currentTarget).data("key");
          const currentLevel = skillValues[key].value;
          const cost = (currentLevel + 1) * 3;

          if (currentExp >= cost) {
            currentExp -= cost;
            skillValues[key].value++;
            
            html.find(`#advancement-exp`).text(currentExp);
            html.find(`#val-skill-${key}`).text(skillValues[key].value);
            html.find(`.skill[data-key="${key}"]`).find(`#cost-${key}`).text((skillValues[key].value + 1) * 3);
            
            if (skillValues[key].value > originalSkills[key]) {
              html.find(`.skill[data-key="${key}"]`).find(".adv-skill-undo").show();
            }
          }
        });

        html.find(".adv-skill-undo").click((ev) => {
          const key = $(ev.currentTarget).data("key");
          const currentLevel = skillValues[key].value;

          if (currentLevel > originalSkills[key]) {
            const refundedCost = currentLevel * 3;
            currentExp += refundedCost;
            skillValues[key].value--;

            html.find(`#advancement-exp`).text(currentExp);
            html.find(`#val-skill-${key}`).text(skillValues[key].value);
            html.find(`.skill[data-key="${key}"]`).find(`#cost-${key}`).text((skillValues[key].value + 1) * 3);

            if (skillValues[key].value === originalSkills[key]) {
              $(ev.currentTarget).hide();
            }
          }
        });

        html.find(".drop-zone").on("drop", async (ev) => {
          const data = JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain"));
          if (data.type !== "Item") return;
          const item = await Item.implementation.fromDropData(data);
          
          if (item.type === "talent" && currentExp >= 8) {
            currentExp -= 8;
            const tempId = foundry.utils.randomID();
            newTalents.push({ ...item.toObject(), _id: tempId });

            html.find("#advancement-exp").text(currentExp);
            html.find("#talent-list").append(`
              <div class="talent-row flex row align-center" data-temp-id="${tempId}" style="justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="${item.img}" width="28" height="28" style="border: 1px solid white; border-radius: 3px; object-fit: cover;"/>
                  <b>${item.name}</b>
                </div>
                <a class="item-control remove-temp-talent" data-temp-id="${tempId}" title="Radera" style="cursor: pointer;"><i class="fas fa-trash"></i></a>
              </div>
            `);
          }
        });

        html.on("click", ".remove-temp-talent", (ev) => {
          const tempId = $(ev.currentTarget).data("tempId");
          const index = newTalents.findIndex(t => t._id === tempId);
          if (index !== -1) {
            newTalents.splice(index, 1);
            currentExp += 8;
            html.find("#advancement-exp").text(currentExp);
            html.find(`[data-temp-id="${tempId}"]`).remove();
          }
        });
      }
    });
    dialogInstance.render(true);
  }

  async _onDamageChange(event) {
    const newDamage = parseInt(event.currentTarget.value) || 0;
    const baseStrength = parseInt(this.actor.system.attribute?.strength?.value) || 1;
    
    let seglivadCount = 0;
    this.actor.items.forEach(item => {
      if (item.type === "talent" && item.name && item.name.trim().toLowerCase() === "seglivad") {
        seglivadCount++;
      }
    });
    if (seglivadCount > 3) seglivadCount = 3;

    const maxStrength = baseStrength + seglivadCount;

    if (newDamage >= maxStrength) {
      const table = game.tables.getName("Kritisk skada");
      if (!table) {
        ui.notifications.warn("Ingen tabell med namnet 'Kritisk skada' hittades.");
        return;
      }

      const draw = await table.draw({ displayChat: true });
      if (!draw || !draw.results || draw.results.length === 0) return;

      const result = draw.results[0];
      let referencedDoc = null;
      if (result.documentId) {
        referencedDoc = await fromUuid(result.documentId) || game.items.get(result.documentId);
      }
      if (!referencedDoc && result.text) {
        referencedDoc = game.items.getName(result.text);
      }

      if (!referencedDoc) {
        ui.notifications.warn("Det dragna tabellresultatet kunde inte hittas som ett föremål.");
        return;
      }

      let injuryData = referencedDoc.toObject();

      for (const field of ["timeLimit", "fatal"]) {
        let rawValue = injuryData.system[field];
        if (rawValue && typeof rawValue === "string") {
          const matchDice = rawValue.trim().match(/(\d+[t|d]\d*)/i);
          if (matchDice) {
            let formula = matchDice[1].replace(/t/gi, "d");
            if (/^\d+d$/i.test(formula)) {
              formula += "6";
            }
            try {
              let roll = new Roll(formula);
              await roll.evaluate();
              
              let updatedValue = rawValue.replace(matchDice[1], roll.total);
              
              if (field === "timeLimit" && roll.total === 1) {
                updatedValue = updatedValue.replace(/dagar/gi, "dag");
              }

              injuryData.system[field] = updatedValue;
            } catch (err) {
              console.error("Kunde inte utvärdera tärningsformel:", formula, err);
            }
          }
        }
      }

      await new Promise((resolve) => {
        new Dialog({
          title: "Kritisk skada",
          content: `<p><b>${this.actor.name}</b> har blivit bruten och har ådragit sig en kritisk skada: <b>${injuryData.name}</b>!</p>`,
          buttons: {
            ok: {
              label: "OK",
              callback: () => resolve()
            }
          },
          default: "ok"
        }).render(true);
      });

      await this.actor.createEmbeddedDocuments("Item", [injuryData]);
    }
  }

  async onToggleFavorite(event) {
    event.preventDefault();
    const div = $(event.currentTarget).closest("[data-item-id]");
    const itemId = div.data("itemId") || div.attr("data-item-id");
    const item = this.actor.items.get(itemId);
    if (!item) return;

    await item.update({ "system.isFav": !item.system.isFav });
  }

  async onUseTalent(event) {
      const div = $(event.currentTarget).closest(".talent-row");
      const itemId = div.data("itemId") || div.attr("data-item-id");
      const talent = this.actor.items.get(itemId);
      
      if (!talent) return;

      if (talent.system.bonusType !== "skill") {
          const chatCard = await buildChatCard(talent.type, talent);
          ChatMessageVaesen.create(chatCard, {});
          return;
      }

      const skills = talent.system.skill.filter(s => s !== "none");
      if (skills.length === 0) return;

      if (skills.length === 1) {
          this._executeTalentRoll(talent, skills[0]);
      } else {
          let buttons = {};
          skills.forEach(s => {
              buttons[s] = { 
                  label: game.i18n.localize(this.actor.system.skill[s].label), 
                  callback: () => this._executeTalentRoll(talent, s) 
              };
          });
          new Dialog({ title: "Välj färdighet", content: "<p>Vilken färdighet vill du använda talangen med?</p>", buttons: buttons }).render(true);
      }
  }

  _executeTalentRoll(talent, skillKey) {
      const skill = this.actor.system.skill[skillKey];
      const attribute = this.actor.system.attribute[skill.attribute];
      const talentBonus = parseInt(talent.system.bonus) || 0;

      let info = [
          { name: game.i18n.localize(attribute.label), value: attribute.value },
          { name: game.i18n.localize(skill.label), value: skill.value }
      ];

      if (talent.system.bonusType === "skill") {
          info.push({ name: game.i18n.localize("TALENT.DICE_BONUS"), value: talentBonus, type: "skill" });
      } else if (talent.system.bonusType === "damage") {
          this.lastDamageBonus = talentBonus;
      }

      prepareRollNewDialog(this, game.i18n.localize(skill.label), info, null, null, null, null, null, skill.attribute, skillKey);
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    
    if (item.type === "misery") {
        const existingMisery = this.actor.itemTypes.misery;
        if (existingMisery.length > 0) {
            const idsToDelete = existingMisery.map(i => i.id);
            await this.actor.deleteEmbeddedDocuments("Item", idsToDelete);
        }
    }

    if (item.type === "archetype") {
      const archetypeData = item.system || {};
      
      const oldTalents = this.actor.items.filter(i => {
        return i.type === "talent" && (i.getFlag("askhem1713", "isArchetypeTalent") || true);
      });
      if (oldTalents.length > 0) {
        await this.actor.deleteEmbeddedDocuments("Item", oldTalents.map(t => t.id));
      }

      let socialStatus = "";
      const rawStatus = archetypeData.socialStatus || "";
      if (rawStatus.includes(",")) {
        const statuses = rawStatus.split(",").map(s => s.trim()).filter(Boolean);
        let buttons = statuses.map(status => ({
          action: status,
          label: status,
          callback: () => status
        }));
        socialStatus = await foundry.applications.api.DialogV2.wait({
          window: { title: "Välj samhällsstånd" },
          content: "<p>Arketypen har flera tillgängliga samhällsstånd. Välj ett:</p>",
          buttons: buttons
        });
      } else if (rawStatus) {
        socialStatus = rawStatus.trim();
      }

      let updateData = {
        "system.bio.archetype": item.name,
        "system.bio.primaryAttribute": archetypeData.primaryAttribute || "",
        "system.bio.primarySkills": archetypeData.skills || "",
        "system.bio.social_status": socialStatus
      };

      await this.actor.update(updateData);

      if (archetypeData.talent && archetypeData.talent.name) {
        let talentItem = game.items.find(i => i.type === "talent" && i.name.toLowerCase() === archetypeData.talent.name.toLowerCase());
        if (!talentItem) {
          talentItem = game.packs.get(archetypeData.talent.pack)?.get(archetypeData.talent.id);
        }
        if (talentItem) {
          let talentData = talentItem.toObject();
          talentData.flags = talentData.flags || {};
          talentData.flags.askhem1713 = talentData.flags.askhem1713 || {};
          talentData.flags.askhem1713.isArchetypeTalent = true;

          await this.actor.createEmbeddedDocuments("Item", [talentData]);
        }
      }

      return;
    }

    return super._onDropItem(event, data);
  }

  async _onRollSymptom(event) {
    const table = game.tables.getName("Symptom");
    if (!table) return ui.notifications.warn("Ingen tabell med namnet 'Symptom' hittades.");
    
    const draw = await table.draw();
    if (!draw || !draw.results || draw.results.length === 0) return;
    
    const resultName = draw.results[0].name;
    
    const miseryItem = this.actor.items.find(i => i.type === "misery");
    if (!miseryItem) return;

    const match = resultName.match(/\((-?\d+)\)/);
    const symptomValue = match ? parseInt(match[1]) : 0;

    await miseryItem.update({
        "system.symptomName": resultName,
        "system.symptom": symptomValue
    });
  }

  rollAttribute(attributeName) {
    const attribute = this.actor.system.attribute[attributeName];
    const misery = this.actor.itemTypes.misery[0];
    const modifier = (misery && misery.system.attribute === attributeName) ? misery.system.symptom : 0;
    
    const testName = game.i18n.localize(attribute.label);
    
    let info = [
      { name: testName, value: attribute.value }
    ];
    
    if (modifier !== 0) {
        info.push({ name: "Avdrag symptom", value: modifier });
    }
    
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, attributeName);
  }

  rollSkill(skillName) {
    const skill = this.actor.system.skill[skillName];
    const attribute = this.actor.system.attribute[skill.attribute];
    
    const misery = this.actor.itemTypes.misery[0];
    const miseryModifier = (misery && misery.system.attribute === skill.attribute) ? (misery.system.symptom || 0) : 0;
    
    let injuryModifier = 0;
    const criticalInjuries = this.actor.items.filter(i => i.type === "criticalInjury");
    criticalInjuries.forEach(injury => {
      if (injury.system.skill && injury.system.skill.includes(skillName)) {
        const effectVal = parseInt(injury.system.effect, 10);
        if (!isNaN(effectVal)) {
          injuryModifier += effectVal;
        }
      }
    });

    const testName = game.i18n.localize(skill.label);
    
    let info = [
      { name: game.i18n.localize(attribute.label), value: attribute.value },
      { name: testName, value: skill.value }
    ];

    if (miseryModifier !== 0) {
        info.push({ name: "Avdrag symptom", value: miseryModifier });
    }

    if (injuryModifier !== 0) {
        info.push({ name: "Avdrag kritisk skada", value: injuryModifier });
    }
    
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, skill.attribute, skillName, null, skillName);
  }

  onMagicRoll(event) {
    const div = $(event.currentTarget).parents(".magic");
    const itemId = div.data("itemId");
    const item = this.actor.items.get(itemId);
    if (!item) return;

    const cost = parseInt(item.system.cost) || 0;
    const currentMiasma = parseInt(this.actor.system.miasma) || 0;

    if (currentMiasma < cost) {
      ui.notifications.warn("Inte tillräckligt med miasma för att kasta besvärjelsen.");
      return;
    }

    const skillKey = "insight";
    const skill = this.actor.system.skill[skillKey];
    if (!skill) {
      ui.notifications.warn("Färdigheten Genomskåda hittades inte.");
      return;
    }

    const attribute = this.actor.system.attribute[skill.attribute];

    const newMiasma = Math.max(0, currentMiasma - cost);
    this.actor.update({ "system.miasma": newMiasma });

    let info = [
      { name: game.i18n.localize(attribute.label), value: attribute.value },
      { name: game.i18n.localize(skill.label), value: skill.value }
    ];

    const testName = item.name;
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, skill.attribute, skillKey, item);
  }

  computeSkills(context) {
    const primaryAttr = context.system.bio?.primaryAttribute || "";
    const primarySkillsStr = (context.system.bio?.primarySkills || "").toLowerCase();
    const primarySkillsList = primarySkillsStr.split(",").map(s => s.trim()).filter(Boolean);

    for (let [key, attribute] of Object.entries(context.system.attribute)) {
      attribute.isPrimary = (key === primaryAttr);
    }

    for (let [key, skill] of Object.entries(context.system.skill)) {
      skill.hasStrength = skill.attribute === "strength";
      skill.hasAgility = skill.attribute === "agility";
      skill.hasSharpness = skill.attribute === "sharpness";
      skill.hasPresence = skill.attribute === "presence";
      
      const localizedLabel = game.i18n.localize(skill.label).toLowerCase();
      skill.isPrimary = primarySkillsList.includes(key.toLowerCase()) || primarySkillsList.includes(localizedLabel);
    }
  }

  computeItems(data) {
    const talentMap = new Map();

    for (let item of Object.values(data.items)) {
      item.isCriticalInjury = item.type === "criticalInjury";
      item.isTalent = item.type === "talent";
      item.isWeapon = item.type === "weapon";
      item.isCondition = item.type === "condition";
      item.isMagic = item.type === "magic";
      item.isArmor = item.type === "armor";
      item.isAttack = item.type === "attack";
      item.isGear = item.type === "gear";
      item.isFacility = item.type === "upgrade" && item.system.category === "facility";
      item.isContact = item.type === "upgrade" && item.system.category === "contact";
      item.isPersonnel = item.type === "upgrade" && item.system.category === "personnel";

      if (item.isTalent) {
        const nameKey = item.name ? item.name.trim().toLowerCase() : "";
        if (talentMap.has(nameKey)) {
          const existing = talentMap.get(nameKey);
          existing.count = (existing.count || 1) + 1;
          existing.item.count = existing.count;
          existing.item.displayName = `${existing.item.name} x${existing.count}`;
          item.shouldHide = true;
        } else {
          item.count = 1;
          item.displayName = item.name;
          talentMap.set(nameKey, { item, count: 1 });
        }
      }
    }

    for (const [nameKey, entry] of talentMap.entries()) {
      if (entry.count > 1) {
        entry.item.displayName = `${entry.item.name} x${entry.count}`;
      } else {
        entry.item.displayName = entry.item.name;
      }
    }
  }

  async onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = foundry.utils.duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    await this.actor.createEmbeddedDocuments("Item", [data]);
  }

  onItemUpdate(event) {
    const div = $(event.currentTarget).closest(".talent-row, .weapon-row, .armor-row, .gear-row, .critical-injury-row, .magic-row");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render(true);
  }

  async onItemDelete(event) {
    const div = $(event.currentTarget).closest(".talent-row, .weapon-row, .armor-row, .gear-row, .critical-injury-row, .magic-row");
    let item = this.actor.items.get(div.data("itemId"));
    
    const confirmed = await Dialog.confirm({
      title: "Radera föremål",
      content: "<p>Är du säker på att du vill radera detta föremål?</p>",
    });

    if (confirmed) {
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      div.slideUp(200, () => this.render(false));
    }
  }

  onFocusIn(event) { $(event.currentTarget).select(); }

  onArmorRoll(event) {
    const div = $(event.currentTarget).parents(".armor");
    const item = this.actor.items.get(div.data("itemId"));
    prepareRollNewDialog(this, item.name, [{ name: item.name, value: item.system.protection }]);
  }

  onWeaponRoll(event) {
    const div = $(event.currentTarget).parents(".weapon");
    const item = this.actor.items.get(div.data("itemId"));
    this.rollWeapon(item.id);
  }
  
  rollWeapon(itemId) {
    const item = this.actor.items.get(itemId);
    const skillKey = item.system.skill;
    const skill = this.actor.system.skill[skillKey];
    const attribute = this.actor.system.attribute[skill.attribute];
    
    let info = [
      { name: game.i18n.localize(attribute.label), value: attribute.value },
      { name: game.i18n.localize(skill.label), value: skill.value },
      { name: game.i18n.localize("WEAPON.BONUS"), value: item.system.bonus, type: "skill" }
    ];
    
    const testName = game.i18n.localize(skill.label) + " (" + item.name + ")";
    
    prepareRollNewDialog(this, testName, info, item.system.damage, null, null, null, null, skill.attribute);
  }

  async sendToChat(event) {
    const div = $(event.currentTarget).closest(".talent-row, .weapon-row, .armor-row, .gear-row, .critical-injury-row, .magic-row");
    const itemId = div.data("itemId");
    const item = this.actor.items.get(itemId);
    
    if (!item) return;

    const chatCard = await buildChatCard(item.type, item);
    ChatMessageVaesen.create(chatCard, {});
  }

  rollFear(key) { }
}