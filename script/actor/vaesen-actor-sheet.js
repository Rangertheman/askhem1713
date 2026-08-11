import { adjustBonusText, prepareRollNewDialog, push } from "../util/roll.js";
import { YearZeroRoll } from "../lib/yzur.js";
import ChatMessageVaesen, { buildChatCard } from "../util/chat.js";

export class VaesenActorSheet extends foundry.appv1.sheets.ActorSheet {
  dices = new YearZeroRoll();
  lastTestName = "";
  lastDamage = 0;

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
      ritual: actorData.system.ritual,
      type: this.actor.type,
      isCharacter: this.actor.type === "player",
      isNpc: this.actor.type === "npc",
      isVaesen: this.actor.type === "creature",
      isHeadquarter: this.actor.type === "headquarter",
      blockCondition: !this.actor.prototypeToken.actorLink && !this.actor.isToken
    };
    context.effects = this.actor.getEmbeddedCollection("ActiveEffect").contents;

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

    if (context.isNpc) {
      context.informationHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        context.system.information,
        { secrets: this.actor.isOwner, rollData: context.rollData, async: true, relativeTo: this.actor }
      );
      context.noteHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.note, {
        secrets: this.actor.owner,
        async: true,
      });
    }

    if (context.isCharacter || context.isVaesen || context.isHeadquarter) {
      context.noteHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.note, {
        secrets: this.actor.owner,
        async: true,
      });
    }

   if (!context.isVaesen && !context.isHeadquarter) {
      this.computeSkills(context);
    }
    this.computeItems(context);
    this.setPortrait(context);

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.actor.limited) return;

    html.find(".item-create").click((ev) => this.onItemCreate(ev));
    html.find(".item-edit").click((ev) => this.onItemUpdate(ev));
    html.find(".item-delete").click((ev) => this.onItemDelete(ev));
    html.find(".to-chat").click((ev) => this.sendToChat(ev));
    html.find("input").focusin((ev) => this.onFocusIn(ev));
    html.find(".roll-symptom").click((ev) => this._onRollSymptom(ev));

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
    html.find(".roll-fear").click((ev) => this.rollFear(ev.currentTarget.dataset.key));
  }

  async _onRollSymptom(event) {
    const table = game.tables.getName("Symptom");
    if (!table) return;
    
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
    const testName = game.i18n.localize(attribute.label);
    let info = [{ name: testName, value: attribute.value }];
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, attributeName);
  }

  rollSkill(skillName) {
    const skill = this.actor.system.skill[skillName];
    const attribute = this.actor.system.attribute[skill.attribute];
    const testName = game.i18n.localize(skill.label);
    let info = [
      { name: game.i18n.localize(attribute.label), value: attribute.value },
      { name: testName, value: skill.value }
    ];
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, skill.attribute, skillName);
  }

  computeSkills(context) {
    for (let [key, skill] of Object.entries(context.system.skill)) {
      skill.hasStrength = skill.attribute === "strength";
      skill.hasAgility = skill.attribute === "agility";
      skill.hasSharpness = skill.attribute === "sharpness";
      skill.hasPresence = skill.attribute === "presence";
    }
  }

  computeItems(data) {
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
    }
  }

  setPortrait(data) {
    data.portrait = game.settings.get("vaesen", "portrait");
  }

  onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = foundry.utils.duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    if (data.type == "condition") {
      var count = this.actor.items.filter(x => x.type == "condition").length;
      data["img"] = `systems/vaesen/asset/counter_tokens/${count + 1}.png`;
    }
    this.actor.createEmbeddedDocuments("Item", [data]);
  }

  onItemUpdate(event) {
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render(true);
  }

  onItemDelete(event) {
    const div = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(div.data("itemId"));
    if (!item.system.starting) {
      this.onItemDeleteAction(div, item.id);
      return;
    }
    Dialog.confirm({
      title: game.i18n.localize("STARTING_EQUIP.TITLE"),
      content: game.i18n.localize("STARTING_EQUIP.CONTENT"),
      yes: () => this.onItemDeleteAction(div, item.id),
      defaultYes: false
    });
  }

  onItemDeleteAction(div, item) {
    this.actor.deleteEmbeddedDocuments("Item", [item]);
    div.slideUp(200, () => this.render(false));
  }

  onFocusIn(event) { $(event.currentTarget).select(); }

  onArmorRoll(event) {
    const div = $(event.currentTarget).parents(".armor");
    const item = this.actor.items.get(div.data("itemId"));
    prepareRollNewDialog(this, item.name, [{ name: item.name, value: item.system.protection }]);
  }

  onWeaponRoll(event) {
    const div = $(event.currentTarget).parents(".weapon");
    this.rollWeapon(div.data("itemId"));
  }

  sendToChat(event) {
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    ChatMessageVaesen.create(buildChatCard(item.type, item), {});
  }

  rollFear(key) { }
}