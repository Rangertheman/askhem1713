import ChatMessageVaesen from "../util/chat.js";

export class vaesenItemSheet extends foundry.appv1.sheets.ItemSheet {
  constructor(...args) {
    super(...args);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 650,
      height: 'auto',
      classes: ["vaesen", "sheet", "item"],
      resizable: true,
      submitOnChange: true,
    });
  }

  get template() {
    return `systems/askhem1713/model/items/${this.item.type}.hbs`;
  }

  async getData() {
    const data = super.getData();
    data.system = this.item.system;
    data.config = CONFIG.vaesen;
    
    return data;
  }

  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    
    return this.item.update(expandedData);
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    buttons = [
      {
        label: "Display",
        class: "display-chat",
        icon: "fas fa-comment",
        onclick: (ev) => this.sendToChat(this.item),
      },
    ].concat(buttons);
    return buttons;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("input").focusin((ev) => this.onFocusIn(ev));
    html.on("click", ".roll-injury-dice", (ev) => this.onRollInjuryDice(ev));
  }

  onFocusIn(event) {
    $(event.currentTarget).select();
  }

  async onRollInjuryDice(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = $(event.currentTarget).closest("a");
    const fieldName = button.data("field");
    const rawValue = this.item.system[fieldName];

    if (!rawValue) {
      ui.notifications.warn("Hittar inga tärningskoder");
      return;
    }

    const match = rawValue.toString().trim().match(/(\d+[t|d]\d*)/i);
    if (!match) {
      ui.notifications.warn("Hittar inga tärningskoder");
      return;
    }

    let formula = match[1].replace(/t/gi, "d");
    
    if (/^\d+d$/i.test(formula)) {
      formula += "6";
    }

    let roll = new Roll(formula);
    await roll.evaluate();

    let updatedValue = rawValue.toString().replace(match[1], roll.total);

    await this.item.update({ [`system.${fieldName}`]: updatedValue });

    let title = fieldName === "timeLimit" ? "Läketid" : "Dödlig";
    let content = `<b>${this.item.name} - ${title}</b> (${rawValue} -> ${roll.total}): <span style="font-size: 1.2em; font-weight: bold;">${roll.total}</span>`;
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.item.actor }),
      content: content
    });
  }

  sendToChat(data) {
    let type = data.type;
    let chatData = ChatMessageVaesen.buildChatCard(type, data);
    ChatMessageVaesen.create(chatData, {});
  }
}