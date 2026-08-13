import { conditions } from "../util/conditions.js";

export class AskhemTokenHUD extends foundry.applications.hud.TokenHUD {

  constructor(...args) {
    super(...args);
  }

  _getStatusEffectChoices(params) {
    var actor = this.object.document.actor;

    if (actor.type === "player") {  
      return super._getStatusEffectChoices();
    }

    if (actor.type === "npc") {
      let statuses = super._getStatusEffectChoices();
      for (const key of Object.keys(statuses)) {
        if (key.startsWith("systems/askhem1713/asset/status/"))
          delete statuses[key];
      }
      return statuses;
    }

    if (actor.type === "monster") {
      let monsterActions = {};
      for (let item of Object.values(actor.items.contents)) {
        if (item.type !== "condition") {
          continue;
        }
        monsterActions[item.id] = {
          cssClass: item.system.active ? "active" : "",
          id: item._id,
          src: item.img,
          title: `${item.name} (${item.system.bonus})`,
          isActive: item.system.active
        };
      }
      return monsterActions;
    }
  }

  async _onToggleEffect(effect, {active, overlay=false}={}) {
    var actor = this.object.document.actor;
    let img = effect.currentTarget;
    if (actor.type !== "monster" || img.dataset.statusId == "fastAction" || img.dataset.statusId == "slowAction") {
      return super._onToggleEffect(effect, {active, overlay});
    }
    
    effect.preventDefault();
    effect.stopPropagation();
    const result = await conditions.onActorCondition(actor, img.dataset.statusId);

    if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
    return result;
  }
}