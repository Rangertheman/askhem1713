import { adjustBonusText, prepareRollNewDialog, push } from "../util/roll.js";
import { YearZeroRoll } from "../lib/yzur.js";
import ChatMessageAskhem, { buildChatCard } from "../util/chat.js";

export class NpcCharacterSheet extends foundry.appv1.sheets.ActorSheet {
  dices = new YearZeroRoll();
  lastTestName = "";
  lastDamage = 0;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["askhem", "sheet", "actor"],
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
      isNpc: true
    };

    this.computeItems(context);

    context.informationHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.information || "",
      { secrets: this.actor.isOwner, rollData: context.rollData, async: true, relativeTo: this.actor }
    );

    context.noteHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.note || "",
      { secrets: this.actor.owner, async: true }
    );

    return context;
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
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.actor.limited) return;

    html.find(".item-create").click((ev) => this.onItemCreate(ev));
    html.find(".item-edit").click((ev) => this.onItemUpdate(ev));
    html.find(".item-delete").click((ev) => this.onItemDelete(ev));
    html.find(".to-chat").click((ev) => this.sendToChat(ev));

    html.find(".skill b").click((ev) => {
      const div = $(ev.currentTarget).parents(".skill");
      const skillName = div.data("key");
      this.rollSkill(skillName);
    });

    html.find(".skill-row .skill-roll").click((ev) => {
      const li = $(ev.currentTarget).parents(".skill-row");
      const itemId = li.data("itemId");
      this.rollItemSkill(itemId);
    });

    html.find(".weapon-row .weapon-roll").click((ev) => {
      const li = $(ev.currentTarget).parents(".weapon-row");
      const itemId = li.data("itemId");
      this.rollWeapon(itemId);
    });

    html.find("input").focusin((ev) => $(ev.currentTarget).select());
  }

  rollSkill(skillName) {
    if (!skillName || !this.actor.system.skill[skillName]) return;
    const skill = this.actor.system.skill[skillName];
    const testName = game.i18n.localize(skill.label);
    
    let info = [
      { name: testName, value: skill.value }
    ];
    
    prepareRollNewDialog(this, testName, info, null, null, null, null, null, null, skillName);
  }

  rollItemSkill(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const testName = item.name;
    const value = item.system.value || 0;

    let info = [
      { name: testName, value: value }
    ];

    prepareRollNewDialog(this, testName, info, null, null, null, null, null, null, null);
  }

  rollWeapon(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const bonus = Number(item.system.bonus) || 0;
    
    let skillKey = item.system.skill;
    let skillName = skillKey || "Färdighet";
    let skillValue = 0;

    if (skillKey) {
      let localizedKey = skillKey;
      if (this.actor.system.skill && this.actor.system.skill[skillKey] && this.actor.system.skill[skillKey].label) {
        localizedKey = game.i18n.localize(this.actor.system.skill[skillKey].label);
      }

      const skillItem = this.actor.items.find(i => {
        if (i.type !== "skill") return false;
        const itemName = (i.name || "").toLowerCase();
        const itemKey = (i.system?.key || "").toLowerCase();
        const target = skillKey.toLowerCase();
        const locTarget = localizedKey.toLowerCase();
        return itemName === target || itemName === locTarget || itemKey === target;
      });

      if (skillItem) {
        skillName = skillItem.name;
        skillValue = Number(skillItem.system.value) || 0;
      } else {
        skillName = localizedKey !== skillKey ? localizedKey : skillKey;
      }
    }

    const testName = `${skillName} (${item.name})`;

    let info = [
      { name: skillName, value: skillValue },
      { name: game.i18n.localize("ROLL.BONUS") || "Bonus", value: bonus, type: "skill" }
    ];

    prepareRollNewDialog(this, testName, info, item.system.damage, null, null, null, null, null, null);
  }

  async onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = foundry.utils.duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    await this.actor.createEmbeddedDocuments("Item", [data]);
  }

  onItemUpdate(event) {
    const div = $(event.currentTarget).closest(".skill-row, .weapon-row");
    const itemId = div.data("itemId") || div.attr("data-item-id");
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  async onItemDelete(event) {
    const div = $(event.currentTarget).closest(".skill-row, .weapon-row");
    const itemId = div.data("itemId") || div.attr("data-item-id");
    let item = this.actor.items.get(itemId);
    if (!item) return;
    
    const confirmed = await Dialog.confirm({
      title: "Radera föremål",
      content: "<p>Är du säker på att du vill radera detta föremål?</p>",
    });

    if (confirmed) {
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      div.slideUp(200, () => this.render(false));
    }
  }

  async sendToChat(event) {
    const div = $(event.currentTarget).closest(".skill-row, .weapon-row");
    const itemId = div.data("itemId") || div.attr("data-item-id");
    const item = this.actor.items.get(itemId);
    
    if (!item) return;

    const chatCard = await buildChatCard(item.type, item);
    ChatMessageAskhem.create(chatCard, {});
  }
}