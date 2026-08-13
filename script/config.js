export const askhem = {};

askhem.skills = {
    craft: "SKILL.CRAFT",
    force: "SKILL.FORCE",
    closeCombat: "SKILL.CLOSE_COMBAT",
    agility: "SKILL.AGILITY",
    rangedCombat: "SKILL.RANGED_COMBAT",
    stealth: "SKILL.STEALTH",
    medicine: "SKILL.MEDICINE",
    learning: "SKILL.LEARNING",
    religion: "SKILL.RELIGION",
    observation: "SKILL.OBSERVATION",
    manipulation: "SKILL.MANIPULATION",
    insight: "SKILL.DISCOVERY"
};

askhem.criticalInjuryOptions = {
    ...askhem.skills,
    "fear": "BONUS_TYPE.FEAR",
};

askhem.bonusType = {
    none: "BONUS_TYPE.NONE",
    skill: "BONUS_TYPE.SKILL",
    ignoreConditionSkill: "BONUS_TYPE.IGNORE_CONDITIONS_SKILL",
    ignoreConditionPhysical: "BONUS_TYPE.IGNORE_CONDITIONS_PHYSICAL",
    ignoreConditionMental: "BONUS_TYPE.IGNORE_CONDITIONS_MENTAL",
    damage: "BONUS_TYPE.DAMAGE",
    fear: "BONUS_TYPE.FEAR",
    bonusMentalRecovery: "BONUS_TYPE.MENTAL_RECOVERY",
    bonusPhysicalRecovery: "BONUS_TYPE.PHYSICAL_RECOVERY",
};

askhem.bonusTypeRequiresSkill = ["skill", "ignoreConditionSkill", "damage"];
askhem.bonusTypeRequiresBonus = ["skill", "damage", "fear", "bonusMentalRecovery", "bonusPhysicalRecovery"];
askhem.bonusTypeDamageSkills = ["closeCombat", "force", "rangedCombat"];

askhem.bonusTypeDamageSkillsOptions = {
    closeCombat: "SKILL.CLOSE_COMBAT",
    rangedCombat: "SKILL.RANGED_COMBAT",
    force: "SKILL.FORCE"
}

// select option set up
askhem.attackAttributeOptions = {
    strength: "ATTRIBUTE.STRENGTH_ROLL",
    agility: "ATTRIBUTE.AGILITY_ROLL",
    sharpness: "ATTRIBUTE.SHARPNESS_ROLL",
    presence: "ATTRIBUTE.PRESENCE_ROLL"
}

askhem.injuryTypeOptions = {
    physical: "CONDITION.PHYSICAL",
    mental: "CONDITION.MENTAL"
}

askhem.yesNoOptions = {
    Yes: "YES",
    No: "NO"
}

askhem.magicCategoryOptions = {
    power: "MAGIC.POWER",
    enchantment: "MAGIC.ENCHANTMENT",
    curse: "MAGIC.CURSE",
    trollcraft: "MAGIC.TROLLCRAFT"
}