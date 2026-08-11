export const vaesen = {};

vaesen.skills = {
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

vaesen.criticalInjuryOptions = {
    ...vaesen.skills,
    "fear": "BONUS_TYPE.FEAR",
};

vaesen.bonusType = {
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

vaesen.bonusTypeRequiresSkill = ["skill", "ignoreConditionSkill", "damage"];
vaesen.bonusTypeRequiresBonus = ["skill", "damage", "fear", "bonusMentalRecovery", "bonusPhysicalRecovery"];
vaesen.bonusTypeDamageSkills = ["closeCombat", "force", "rangedCombat"];

vaesen.bonusTypeDamageSkillsOptions = {
    closeCombat: "SKILL.CLOSE_COMBAT",
    rangedCombat: "SKILL.RANGED_COMBAT",
    force: "SKILL.FORCE"
}

// select option set up
vaesen.attackAttributeOptions = {
    strength: "ATTRIBUTE.STRENGTH_ROLL",
    agility: "ATTRIBUTE.AGILITY_ROLL",
    sharpness: "ATTRIBUTE.SHARPNESS_ROLL",
    presence: "ATTRIBUTE.PRESENCE_ROLL"
}

vaesen.injuryTypeOptions = {
    physical: "CONDITION.PHYSICAL",
    mental: "CONDITION.MENTAL"
}

vaesen.yesNoOptions = {
    Yes: "YES",
    No: "NO"
}

vaesen.magicCategoryOptions = {
    power: "MAGIC.POWER",
    enchantment: "MAGIC.ENCHANTMENT",
    curse: "MAGIC.CURSE",
    trollcraft: "MAGIC.TROLLCRAFT"
}