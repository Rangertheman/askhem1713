export function migrate(){
  if (!game.user.isGM)
    return;
  
  const currentVersion = game.settings.get("askhem1713", "systemMigrationVersion");
  const foundryVersion = game.version;
  if (foundryVersion > 11){
    Object.keys(migrations).forEach(function(key) {
      if (!currentVersion || foundry.utils.isNewerVersion(key, currentVersion))
        migrations[key]();
    });
    
  } else {
  Object.keys(migrations).forEach(function(key) {
    if (!currentVersion || isNewerVersion(key, currentVersion))
      migrations[key]();
  });
}
}

export async function linkUnlinkActorData(link, type){
  new Dialog({
    title: `Link/Unlink ${type}`,
    content: `<p>${game.i18n.localize(link ? "MIGRATOR.LINK_ACTOR" : "MIGRATOR.UNLINK_ACTOR")}<strong>${type}</strong></p><p>${game.i18n.localize("MIGRATOR.LINK_ACTOR_CONFIRMATION")}</p>`,
    buttons: {
      update: {
       icon: '<i class="fas fa-check"></i>',
       label: "Update",
       callback: () => {
        var actors = game.actors.contents.filter(x => x.type == type.toLowerCase());
        for (let actor of actors) {
          actor.update({"prototypeToken.actorLink": link});
          console.log("Askhem | Link/Unlink", actor);
        }
       }
      },
      cancel: {
       icon: '<i class="fas fa-ban"></i>',
       label: "Cancel"
      }
     },
  }).render(true);
}

const migrations = {
  "1.0.0" : migrateTo1_0_0
}

async function migrateTo1_0_0() {
  const options = {permanent: true};
  ui.notifications.warn("Migrating your data to version 1.0.0. Please, wait until it finishes.", options);
  for (let actor of game.actors.contents) {
    const updateData = migrateTo1_0_Actor(actor);
    if (!foundry.utils.isEmpty(updateData)) {
      console.log("Askhem Migration",{actor: actor, changes: updateData});
      await actor.update(updateData);
    }
  }

  await game.settings.set("askhem1713", "systemMigrationVersion", game.system.version);
  ui.notifications.info("Data migrated to version 1.0.0. If you have players' tokens, please, remove them from the scene and drag them to the scene back from the Actor's tab.", options);
}

function migrateTo1_0_Actor(actor){
  let updateData = {};

  if (actor.type != "player")
    return updateData;

  const get = (t, path) => path.split(".").reduce((r, k) => r?.[k], t);
  for (var conditionKey in CONFIG.vaesen.allConditions) {
    let condition = CONFIG.vaesen.allConditions[conditionKey];
    if (condition.changes === undefined)
      continue;

    const key = condition.changes[0].key;
    const checked = get(actor, condition.changes[0].key);
    if (!checked)
      continue;

    const currentEffect = Array.from(actor.effects?.values()).find(it => it.icon === condition.icon);
    if (currentEffect)
      continue;

    updateData[key] = false;
    const statusEffect = CONFIG.statusEffects.find(it => it.id === condition.id);
    console.log(statusEffect);
    actor.createEmbeddedDocuments("ActiveEffect", [{
      label: statusEffect.label,
      icon: statusEffect.icon,
      changes: statusEffect.changes,
      id: actor.uuid,
      statuses: statusEffect.statuses,
      flags: {
        core: {
          statusId: condition.id
        }
      }
    }]);
  }
  const actorLink = get(actor, "prototypeToken.actorLink");
  if (!actorLink) {
    updateData["prototypeToken.actorLink"] = true;
    updateData["prototypeToken.disposition"] = 0;
  }
  return updateData;
}