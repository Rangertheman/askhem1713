import { vaesenItemSheet } from "./itemSheet.js";

export class ArchetypeSheet extends vaesenItemSheet {
  
  get template() {
    return `systems/askhem1713/model/items/archetype.hbs`;
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Registrera drop-event explicit på sheet-elementet
    html[0].addEventListener("drop", this._onDrop.bind(this));
  }

  async _onDrop(event) {
    // Använd den nya sökvägen för TextEditor i V14
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (data.type !== "Item") return;
    const item = await Item.implementation.fromDropData(data);
    
    if (item.type !== "talent") return;

    await this.item.update({
      "system.talent": {
        id: item.id,
        name: item.name
      }
    });
  }
}