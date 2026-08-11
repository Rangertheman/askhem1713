import { adjustBonusText, prepareRollNewDialog, push } from "../util/roll.js";
import { YearZeroRoll } from "../lib/yzur.js";
import ChatMessageVaesen, { buildChatCard } from "../util/chat.js";

export class VaesenCharacterSheet extends foundry.appv1.sheets.ActorSheet {
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

  activateListeners(html) {
    super.activateListeners(html);
    if (this.actor.limited) return;

    html.find(".item-create").click((ev) => this.onItemCreate(ev));
    html.find(".item-edit").click((ev) => this.onItemUpdate(ev));
    html.find(".item-delete").click((ev) => this.onItemDelete(ev));
    html.find(".to-chat").click((ev) => this.sendToChat(ev));

    html.find(".monster-attack-btn").click((ev) => this._onMonsterAttack(ev));
    html.find(".monster-attack-btn").contextmenu((ev) => {
      ev.preventDefault();
      const table = this.actor.system.attackTable ? fromUuidSync(this.actor.system.attackTable) : null;
      if (table) table.sheet.render(true);
    });

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

    html.find("input").focusin((ev) => $(ev.currentTarget).select());
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    if (!data || data.type !== "RollTable") return super._onDrop(event);

    if (this.actor.isOwner) {
      const table = await fromUuid(data.uuid);
      if (table) {
        await this.actor.update({ "system.attackTable": table.uuid });
        ui.notifications.info(`Monsterattacktabell uppdaterad för ${this.actor.name}`);
        return table;
      }
    }
    return super._onDrop(event);
  }

  async _onMonsterAttack(event) {
    if (!this.actor.isOwner) return;
    event.preventDefault();

    const table = this.actor.system.attackTable ? fromUuidSync(this.actor.system.attackTable) : null;
    if (!table) {
      ui.notifications.warn("Ingen attacktabell är kopplad till detta monster. Dra och släpp en tabell på formuläret.");
      return;
    }

    let skipDialog = event.shiftKey || event.ctrlKey;
    if (skipDialog) {
      return this._executeMonsterAttack(table);
    }

    let dialogData = { attacks: [] };
    for (let result of table.results) {
      let attack = { name: "", description: "", index: result.range[0] };
      attack.description = result.text || result.description || "";
      attack.description = await TextEditor.enrichHTML(attack.description, { async: true });

      if (result.name && result.name.trim() !== "") {
        const prefix = table.name + " - ";
        if (result.name.startsWith(prefix)) {
          attack.name = result.name.substring(prefix.length);
        } else {
          attack.name = result.name;
        }
      } else {
        const match = attack.description.match(/<(b|strong)>(.*?)<\/\1>(.*)/);
        if (match) {
          attack.name = match[2];
          attack.description = match[3];
        } else {
          attack.name = String(attack.index);
        }
      }
      dialogData.attacks.push(attack);
    }

    let optionsHtml = `<select name="selectMonsterAttack" class="selectMonsterAttack" style="width: 100%; height: 38px; padding: 6px; line-height: 24px; box-sizing: border-box; font-family: Lin, sans-serif; font-size: 1.1em; background: #ffffff; border: 1px solid #846758; color: #412017;"><option value="0" selected>&lt Slumpmässig attack &gt</option>`;
    for (let att of dialogData.attacks) {
      optionsHtml += `<option value="${att.index}">${att.name}</option>`;
    }
    optionsHtml += `</select>`;

    let content = `
      <div class="heavy-border" style="padding: 12px; background: #fdfaf7; color: #412017;">
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 4px; font-family: Berolina, serif; font-size: 1.2em; font-weight: bold;">Välj attack:</label>
          ${optionsHtml}
        </div>
        <div class="monster-attack-description" style="padding: 8px; background: #ffffff; border: 1px solid #846758; min-height: 60px; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;"></div>
      </div>`;

    new Dialog({
      title: `Monsterattack: ${this.actor.name}`,
      content: content,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "Utför attack",
          callback: async (html) => {
            const selected = Number(html.find("select[name='selectMonsterAttack']").val());
            if (selected > 0) {
              const tableResult = table.results.find(r => r.range[0] === selected);
              return this._executeMonsterAttack(table, tableResult);
            } else {
              return this._executeMonsterAttack(table);
            }
          }
        },
        cancel: {
          label: "Avbryt"
        }
      },
      default: "ok",
      render: (html) => {
        const selectEl = html.find("select[name='selectMonsterAttack']");
        const descEl = html.find(".monster-attack-description");
        selectEl.on("change", async () => {
          const val = Number(selectEl.val());
          if (val === 0) {
            descEl.html("<em>Slumpar fram en attack från tabellen.</em>");
          } else {
            const found = dialogData.attacks.find(a => a.index === val);
            descEl.html(found ? found.description : "");
          }
        });
        selectEl.trigger("change");
      }
    }).render(true);
  }

  async _executeMonsterAttack(table, specificResult = null) {
    let result = specificResult;
    if (!result) {
      const roll = new Roll("1d6");
      await roll.evaluate();
      const rollTotal = roll.total;
      result = table.results.find(r => rollTotal >= r.range[0] && rollTotal <= r.range[1]) || table.results[0];
    }

    let attackName = "";
    if (result.name && result.name.trim() !== "") {
      const prefix = table.name + " - ";
      if (result.name.startsWith(prefix)) {
        attackName = result.name.substring(prefix.length);
      } else {
        attackName = result.name;
      }
    } else {
      let rawDesc = result.text || result.description || "";
      const match = rawDesc.match(/<(b|strong)>(.*?)<\/\1>/);
      if (match) {
        attackName = match[2];
      } else {
        attackName = `Resultat ${result.range[0]}`;
      }
    }

    let token = this.actor.prototypeToken?.texture?.src || this.actor.img || "systems/askhem1713/asset/unkown_roller.svg";

    const content = `
      <div class="card-holder">
        <img src="${token}" width="45" height="45" class="roll-token" />
        <div class="vaesen chat-card" data-owner-id="${this.actor.id}">
          <div class="card-content borderimg">
            <div class="dice-roll flexcol">
              <div class="dice-flavor" style="text-transform: uppercase; text-align: left !important;">${attackName}</div>
              <div class="dice-result" style="text-align: left; padding: 5px 0; font-family: Lin, sans-serif; font-size: 1.1em; line-height: 1.4em;">
                ${result.text || result.description}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content,
      user: game.user.id
    });
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

  async onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = foundry.utils.duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    await this.actor.createEmbeddedDocuments("Item", [data]);
  }

  onItemUpdate(event) {
    const div = $(event.currentTarget).closest(".skill-row");
    const item = this.actor.items.get(div.data("itemId"));
    if (item) item.sheet.render(true);
  }

  async onItemDelete(event) {
    const div = $(event.currentTarget).closest(".skill-row");
    let item = this.actor.items.get(div.data("itemId"));
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
    const div = $(event.currentTarget).closest(".skill-row");
    const itemId = div.data("itemId");
    const item = this.actor.items.get(itemId);
    
    if (!item) return;

    const chatCard = await buildChatCard(item.type, item);
    ChatMessageVaesen.create(chatCard, {});
  }
}