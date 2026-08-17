import { linkUnlinkActorData } from "./migrator.js";

export const registerSystemSettings = function () {
    game.settings.register("askhem1713", "initiativeDeck", {
        name: "SETTINGS.INITIATIVE_DECK",
        hint: "SETTINGS.INITIATIVE_DECK_HINT",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register("askhem1713", "systemMigrationVersion", {
        config: false,
        scope: "world",
        type: String,
        default: ""
    });
    
    game.settings.register("askhem1713", "npcLink", {
        name: "SETTINGS.NPC_LINK_NAME",
        hint: "SETTINGS.NPC_LINK",
        scope: "world",
        config: true,
        restricted: true,
        default: false,
        type: Boolean,
        onChange: value => linkUnlinkActorData(value, "NPC")
    });
    
    game.settings.register("askhem1713", "monsterLink", {
        name: "SETTINGS.MONSTER_LINK_NAME",
        hint: "SETTINGS.MONSTER_LINK",
        scope: "world",
        config: true,
        restricted: true,
        default: false,
        type: Boolean,
        onChange: value => linkUnlinkActorData(value, "Monster")
    });
}