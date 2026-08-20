export function migrate() {
  if (!game.user.isGM) return;

  const currentVersion = game.settings.get("askhem1713", "systemMigrationVersion");
  const foundryVersion = game.version;

  // Trigga kontrollen för äventyrsimporten vid migrering
  checkAdventureUpdate(currentVersion);

  if (foundryVersion > 11) {
    Object.keys(migrations).forEach(function (key) {
      if (!currentVersion || foundry.utils.isNewerVersion(key, currentVersion))
        migrations[key]();
    });
  } else {
    Object.keys(migrations).forEach(function (key) {
      if (!currentVersion || isNewerVersion(key, currentVersion))
        migrations[key]();
    });
  }
}

export async function checkAdventureUpdate(lastVersion) {
  const pack = game.packs.get("askhem1713.askhem-anno-1713");
  const adventureId = "RAUmqiT1TqS3P8fR";
  const currentSystemVersion = game.system.version;

  if (pack && (!lastVersion || foundry.utils.isNewerVersion(currentSystemVersion, lastVersion))) {
    const adventure = await pack.getDocument(adventureId);
    if (adventure && adventure.sheet) {
      adventure.sheet.render(true);
    }
  }
}

export async function linkUnlinkActorData(link, type) {
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
            actor.update({ "prototypeToken.actorLink": link });
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
  "1.0.0": migrateTo1_0_0,
  "1.0.1": migrateTo1_0_1
};

async function migrateTo1_0_0() {
  const options = { permanent: true };
  ui.notifications.warn("Migrating your data to version 1.0.0. Please, wait until it finishes.", options);
  for (let actor of game.actors.contents) {
    const updateData = migrateTo1_0_Actor(actor);
    if (!foundry.utils.isEmpty(updateData)) {
      console.log("Askhem Migration", { actor: actor, changes: updateData });
      await actor.update(updateData);
    }
  }

  await game.settings.set("askhem1713", "systemMigrationVersion", "1.0.0");
  ui.notifications.info("Data migrated to version 1.0.0.", options);
}

async function migrateTo1_0_1() {
  const options = { permanent: true };
  ui.notifications.warn("Migrating your data to version 1.0.1 (Askhem Data Alignment). Please, wait...", options);

  for (let actor of game.actors.contents) {
    let actorUpdates = {};
    if (actor.type === "vaesen") {
      actorUpdates.type = "monster";
    }
    if (!foundry.utils.isEmpty(actorUpdates)) {
      await actor.update(actorUpdates);
    }
    for (let item of actor.items.contents) {
      let itemUpdates = {};
      if (!foundry.utils.isEmpty(itemUpdates)) {
        await item.update(itemUpdates);
      }
    }
  }

  for (let item of game.items.contents) {
    let itemUpdates = {};
    if (!foundry.utils.isEmpty(itemUpdates)) {
      await item.update(itemUpdates);
    }
  }

  await game.settings.set("askhem1713", "systemMigrationVersion", "1.0.1");
  ui.notifications.info("Data successfully migrated to version 1.0.1.", options);
}

function migrateTo1_0_Actor(actor) {
  let updateData = {};
  if (actor.type != "player") return updateData;

  const get = (t, path) => path.split(".").reduce((r, k) => r?.[k], t);

  const allConditions = CONFIG.askhem?.allConditions || [];
  for (var conditionKey in allConditions) {
    let condition = allConditions[conditionKey];
    if (condition.changes === undefined) continue;

    const key = condition.changes[0].key;
    const checked = get(actor, condition.changes[0].key);
    if (!checked) continue;

    const currentEffect = Array.from(actor.effects?.values()).find(it => it.icon === condition.icon);
    if (currentEffect) continue;

    updateData[key] = false;
    const statusEffect = CONFIG.statusEffects.find(it => it.id === condition.id);
    if (!statusEffect) continue;

    actor.createEmbeddedDocuments("ActiveEffect", [{
      label: statusEffect.label,
      icon: statusEffect.icon,
      changes: statusEffect.changes,
      id: actor.uuid,
      statuses: statusEffect.statuses,
      flags: { core: { statusId: condition.id } }
    }]);
  }
  const actorLink = get(actor, "prototypeToken.actorLink");
  if (!actorLink) {
    updateData["prototypeToken.actorLink"] = true;
    updateData["prototypeToken.disposition"] = 0;
  }
  return updateData;
}