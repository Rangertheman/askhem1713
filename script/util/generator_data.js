export class generator_data {
  static startingResources = {
    "Poor": 1,
    "Worker": 2,
    "Burgher": 3,
    "Aristocrat": 5,
  };

  static attributeList = [
    "strength",
    "agility",
    "sharpness",
    "presence"
  ];

  static changeList = {
    "Poor": {
      "Sickly": {
        "system.attribute.strength.value": 2,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.force.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.agility.value": 1,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.medicine.value": 1,
        "system.skill.learning.value": 1,
        "system.skill.religion.value": 2,
        "system.skill.observation.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Gang Member": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 1,
        "system.skill.close_combat.value": 2,
        "system.skill.force.value": 1,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 2,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Hard Work": {
        "system.attribute.strength.value": 5,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 2,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 2,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Servant": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 2,
      },
      "Crofter": {
        "system.attribute.strength.value": 5,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 1,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 2,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Underground": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 5,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 2,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 1,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 2,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
    },
    "Worker": {
      "Sickly": {
        "system.attribute.strength.value": 2,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 1,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 2,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Sent Away": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 3,
        "system.skill.craft.value": 1,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 1,
        "system.skill.discovery.value": 1,
      },
      "Bookish": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 1,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 2,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "In the Factory": {
        "system.attribute.strength.value": 5,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 2,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 2,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Religious": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 5,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 1,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 1,
        "system.skill.discovery.value": 2,
      },
      "Underground": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 5,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 2,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 1,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 0,
        "system.skill.observation.value": 2,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
    },
    "Burgher": {
      "Sickly": {
        "system.attribute.strength.value": 2,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 1,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Boarding School": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 1,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 1,
      },
      "Upstart": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 3,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 1,
      },
      "In Father's/Mother's Footsteps": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 1,
      },
      "Party Animal": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 5,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 1,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 1,
      },
      "In Corridors of Power": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 1,
      },
    },
    "Aristocrat": {
      "Sickly": {
        "system.attribute.strength.value": 2,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 5,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 1,
      },
      "Dreamer": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 5,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 1,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 1,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 1,
      },
      "Rebel": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 3,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 1,
        "system.skill.observation.value": 2,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 1,
        "system.skill.discovery.value": 2,
      },
      "Spoiled": {
        "system.attribute.strength.value": 4,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 3,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 1,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 2,
        "system.skill.discovery.value": 0,
      },
      "Ruined": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 4,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 4,
        "system.skill.craft.value": 0,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 1,
        "system.skill.stealth.value": 1,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 2,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 0,
        "system.skill.discovery.value": 0,
      },
      "Traveled Europe": {
        "system.attribute.strength.value": 3,
        "system.attribute.agility.value": 3,
        "system.attribute.sharpness.value": 4,
        "system.attribute.presence.value": 5,
        "system.skill.craft.value": 1,
        "system.skill.close_combat.value": 0,
        "system.skill.force.value": 0,
        "system.skill.medicine.value": 0,
        "system.skill.ranged_combat.value": 0,
        "system.skill.stealth.value": 0,
        "system.skill.religion.value": 0,
        "system.skill.learning.value": 2,
        "system.skill.observation.value": 0,
        "system.skill.agility.value": 0,
        "system.skill.manipulation.value": 1,
        "system.skill.discovery.value": 1,
      }
    },
  };

  static professionsList = {
    Vagabond: {
      archetype: "Vagabond",
      resources: 0
    },
    Thief: {
      archetype: "Vagabond",
      resources: 1
    },
    Enforcer: {
      archetype: "Servant",
      resources: 2
    },
    Magician: {
      archetype: "Occultist",
      resources: 1
    },
    "Day Laborer": {
      archetype: "Vagabond",
      resources: 1
    },
    Sailor: {
      archetype: "Officer",
      resources: 2
    },
    Preacher: {
      archetype: "Priest",
      resources: 1
    },
    Soldier: {
      archetype: "Officer",
      resources: 2
    },
    Butler: {
      archetype: "Servant",
      resources: 2
    },
    Chef: {
      archetype: "Servant",
      resources: 2
    },
    Psychic: {
      archetype: "Occultist",
      resources: 2
    },
    "Police Officer": {
      archetype: "Private Detective",
      resources: 2
    },
    Hunter: {
      archetype: "Hunter",
      resources: 2
    },
    "Forest Ranger": {
      archetype: "Hunter",
      resources: 2
    },
    Explorer: {
      archetype: "Hunter",
      resources: 3
    },
    Illusionist: {
      archetype: "Occultist",
      resources: 2
    },
    Surgeon: {
      archetype: "Doctor",
      resources: 2
    },
    Vicar: {
      archetype: "Priest",
      resources: 2
    },
    Detective: {
      archetype: "Private Detective",
      resources: 2
    },
    Lawyer: {
      archetype: "Private Detective",
      resources: 3
    },
    Author: {
      archetype: "Writer",
      resources: 1
    },
    Journalist: {
      archetype: "Writer",
      resources: 2
    },
    Poet: {
      archetype: "Writer",
      resources: 1
    },
    Psychiatrist: {
      archetype: "Doctor",
      resources: 2
    },
    Academic: {
      archetype: "Academic",
      resources: 3
    },
    "Public Servant": {
      archetype: "Academic",
      resources: 3
    },
    Doctor: {
      archetype: "Doctor",
      resources: 3
    },
    Bohemian: {
      archetype: "Academic",
      resources: 1
    },
    Dean: {
      archetype: "Priest",
      resources: 3
    },
    "Military Officer": {
      archetype: "Officer",
      resources: 3
    },
  };

  static professionTable = {
    "Poor": [
      "Vagabond",
      "Vagabond",
      "Vagabond",
      "Vagabond",
      "Vagabond",
      "Vagabond",
      "Thief",
      "Thief",
      "Thief",
      "Thief",
      "Enforcer",
      "Enforcer",
      "Enforcer",
      "Enforcer",
      "Magician",
      "Magician",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Sailor",
      "Sailor",
      "Sailor",
      "Preacher",
      "Preacher",
      "Soldier",
      "Soldier",
      "Soldier",
      "Soldier",
      "Butler",
      "Butler",
      "Chef",
      "Psychic",
      "Hunter",
      "Hunter",
    ],
    "Worker": [
      "Thief",
      "Enforcer",
      "Enforcer",
      "Enforcer",
      "Enforcer",
      "Enforcer",
      "Magician",
      "Magician",
      "Magician",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Day Laborer",
      "Sailor",
      "Sailor",
      "Sailor",
      "Preacher",
      "Preacher",
      "Soldier",
      "Soldier",
      "Soldier",
      "Butler",
      "Butler",
      "Chef",
      "Chef",
      "Chef",
      "Psychic",
      "Psychic",
      "Psychic",
      "Police Officer",
      "Police Officer",
      "Hunter",
      "Hunter",
      "Forest Ranger",
      "Forest Ranger",
    ],
    "Burgher": [
      "Soldier",
      "Soldier",
      "Police Officer",
      "Police Officer",
      "Forest Ranger",
      "Explorer",
      "Explorer",
      "Illusionist",
      "Surgeon",
      "Surgeon",
      "Vicar",
      "Vicar",
      "Detective",
      "Detective",
      "Lawyer",
      "Lawyer",
      "Author",
      "Author",
      "Journalist",
      "Journalist",
      "Poet",
      "Psychiatrist",
      "Academic",
      "Academic",
      "Public Servant",
      "Public Servant",
      "Public Servant",
      "Public Servant",
      "Doctor",
      "Doctor",
      "Doctor",
      "Doctor",
      "Bohemian",
      "Bohemian",
      "Military Officer",
      "Military Officer",
    ],
    "Aristocrat": [
      "Explorer",
      "Explorer",
      "Explorer",
      "Explorer",
      "Illusionist",
      "Illusionist",
      "Author",
      "Author",
      "Author",
      "Author",
      "Author",
      "Poet",
      "Poet",
      "Academic",
      "Academic",
      "Public Servant",
      "Public Servant",
      "Public Servant",
      "Doctor",
      "Doctor",
      "Doctor",
      "Bohemian",
      "Bohemian",
      "Bohemian",
      "Bohemian",
      "Bohemian",
      "Dean",
      "Dean",
      "Dean",
      "Military Officer",
      "Military Officer",
      "Military Officer",
      "Military Officer",
      "Military Officer",
      "Military Officer",
      "Military Officer",
    ]
  };

  static ageInfo = [
    {
      min: 17,
      max: 25,
      name: "Young",
      events: 1,
      reducedAttribute: 0
    },
    {
      min: 26,
      max: 50,
      name: "Middle Age",
      events: 2,
      reducedAttribute: 1
    },
    {
      min: 51,
      max: 70,
      name: "Old",
      events: 3,
      reducedAttribute: 2
    },
  ];

  static archetypeInfo = {
    Vagabond: {
      motivation: [
        "Avenging my family",
        "Exposing supernatural secrets",
        "Being liked",
      ],
      trauma: [
        "Saw a revenant rise from its grave",
        "Forever in love with a wood wife",
        "Survived a week inside a troll bag",
      ],
      darkSecret: [
        "Stolen identity",
        "Terminal illness",
        "A vaesen kills anyone I love",
      ],
      talents: [
        "Hobo Tricks",
        "Suspicious",
        "Well-traveled"
      ],
      equipment: [
        "Quarterstaff",
        "Knife or Dagger",
        "Crowbar",
        "Liquor",
        "Pet dog"
      ],
      events: [
        {
          eventName: "Prison",
          skills: {
            "system.skill.close_combat.value": 1,
            "system.skill.force.value": 1,
          },
          item: "Lockpicks"
        },
        {
          eventName: "Hard Work",
          skills: {
            "system.skill.force.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Axe"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Knuckle duster"
        },
        {
          eventName: "Accident",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.learning.value": 1,
          },
          item: "Simple bandages"
        },
        {
          eventName: "Forbidden Love",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Writing utensils and paper"
        },
        {
          eventName: "Four-legged friend",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Guard dog"
        }
      ]
    },
    Servant: {
      motivation: [
        "Protecting my master",
        "Curiosity",
        "An urge to help humans and vaesen alike",
      ],
      trauma: [
        "Bitten by a brook horse",
        "Lost a master to the alluring song of the Neck",
        "Served a household plagued by a changeling",
      ],
      darkSecret: [
        "I murdered someone",
        "Persecuted for my religion",
        "Spying for a foreign power",
      ],
      talents: [
        "Loyal",
        "Robust",
        "Tough as Nails"
      ],
      equipment: [
        "Pistol or Revolver",
        "Hurricane lamp",
        "Make-up",
        "Field kitchen",
        "Simple bandages"
      ],
      events: [
        {
          eventName: "Accused",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Aquavit"
        },
        {
          eventName: "Important Service",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Disguise"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Strong poison"
        },
        {
          eventName: "Accomplishment",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Fine wines"
        },
        {
          eventName: "Secret relationship",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Opera glasses"
        },
        {
          eventName: "Self-employed",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Slide Rule"
        }
      ]
    },
    Hunter: {
      motivation: [
        "The thing that attacked my family must be destroyed",
        "Live in tune with nature",
        "Wants to bag some fantastic game",
      ],
      trauma: [
        "Attacked by the branches of an ash tree wife",
        "Broke your leg in the forest, but was guided home by a will o' the wisp",
        "Captured at dawn by a mountain troll and was stuck in its petrified arms",
      ],
      darkSecret: [
        "I sold my soul",
        "I cannot control my fits of rage",
        "Has children with a vaesen",
      ],
      talents: [
        "Bloodhound",
        "Herbalist",
        "Marksman"
      ],
      equipment: [
        "Rifle",
        "Knife or Dagger",
        "Hunting dog",
        "Hunting trap",
        "Hunting equipment",
      ],
      events: [
        {
          eventName: "Injured",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Hunting equipment"
        },
        {
          eventName: "Faraway Lands",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Compass"
        },
        {
          eventName: "Border Trouble",
          skills: {
            "system.skill.agility.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Rifle"
        },
        {
          eventName: "Great Find",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.learning.value": 1,
          },
          item: "Field kitchen"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Writing utensils and paper"
        },
        {
          eventName: "Your own expedition",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Strong horse"
        }
      ]
    },
    Occultist: {
      motivation: [
        "Learning about vaesen",
        "Understanding myself",
        "Power",
      ],
      trauma: [
        "Was hit by corrosive venom while trying to steal a lindworm egg",
        "The family farm is being run by a grumpy house nisse",
        "Was attacked by a night raven who infected you with a febrile disease",
      ],
      darkSecret: [
        "Guilty of a heinous crime",
        "My powers control me",
        "Changeling",
      ],
      talents: [
        "Magic tricks",
        "Medium",
        "Strike Fear"
      ],
      equipment: [
        "Crystal ball",
        "Powdered stag's horn",
        "Tinderbox",
        "Knife or Dagger",
        "Cooking pot",
      ],
      events: [
        {
          eventName: "Encounter with Vaesen",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Hurricane lamp"
        },
        {
          eventName: "Distinguish employer",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Disguise"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Strong poison"
        },
        {
          eventName: "Renowned",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Musical instrument"
        },
        {
          eventName: "Grief",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Liquor"
        },
        {
          eventName: "Put on a show",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Disguise"
        }
      ]
    },
    Officer: {
      motivation: [
        "Make my father proud",
        "My friends need me",
        "Seek out danger and death",
      ],
      trauma: [
        "Almost drowned when your ship was dragged down by a sea monster",
        "Lost all your men to an angry giant",
        "Saw dead warriors rise again on the battlefield",
      ],
      darkSecret: [
        "Deserter",
        "Cannot cope with filth and disorder",
        "Killed a defenseless enemy",
      ],
      talents: [
        "Battle-hardened",
        "Gentleman",
        "Tactician"
      ],
      equipment: [
        "Rifle",
        "Pistol or Revolver",
        "Compass",
        "Bayonet",
        "Map book",
        "Sword or Saber",
      ],
      events: [
        {
          eventName: "Injured",
          skills: {
            "system.skill.force.value": 1,
            "system.skill.medicine.value": 1,
          },
          item: "Field kitchen"
        },
        {
          eventName: "Expedition",
          skills: {
            "system.skill.force.value": 1,
            "system.skill.ranged_combat.value": 1,
          },
          item: "Rifle"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.close_combat.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Knuckle duster"
        },
        {
          eventName: "Rescued",
          skills: {
            "system.skill.agility.value": 1,
            "system.skill.stealth.value": 1,
          },
          item: "Bayonet"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Binoculars"
        },
        {
          eventName: "Valor",
          skills: {
            "system.skill.force.value": 1,
            "system.skill.ranged_combat.value": 1,
          },
          item: "Pistol or Revolver"
        }
      ]
    },
    "Private Detective": {
      motivation: [
        "Getting away from my family",
        "Uncovering the truth",
        "Thrill-seeking",
      ],
      trauma: [
        "Heard the cry of a myling during your search for a missing child",
        "Had nightmares and woke up breathless and mare-ridden",
        "Came face-to-face with a werewolf",
      ],
      darkSecret: [
        "There is a price on my head",
        "Constant adulterer",
        "Drug addict",
      ],
      talents: [
        "Eagle Eye",
        "Elementary",
        "Focused"
      ],
      equipment: [
        "Magnifying glass",
        "Lockpicks",
        "Pistol or Revolver",
        "Knuckle duster",
        "Binoculars",
      ],
      events: [
        {
          eventName: "Failed Case",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Liquor"
        },
        {
          eventName: "Secret Client",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Pistol or Revolver"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.close_combat.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Knuckle duster"
        },
        {
          eventName: "High-profile Case",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Book collection"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Musical instrument"
        },
        {
          eventName: "Your own agency",
          skills: {
            "system.skill.discovery.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Chemical equipment"
        }
      ]
    },
    Writer: {
      motivation: [
        "Finding a certain vaesen",
        "Researching a book",
        "Revenge",
      ],
      trauma: [
        "Angered fairies who put you to sleep and sucked your blood",
        "Cursed by a homeless vaettir to write a book in your own blood",
        "Heard the song of the Neck, but failed to write down the lyrics",
      ],
      darkSecret: [
        "I record and use the secrets and weaknesses of my friends",
        "Wanted for revolutionary ideas",
        "My life's work is a lie"
      ],
      talents: [
        "Automatic Writing",
        "Journalist",
        "Wordsmith",
      ],
      equipment: [
        "Writing utensils and paper",
        "Camera",
        "Opera glasses",
        "Pet dog",
        "Book collection",
      ],
      events: [
        {
          eventName: "Addiction",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.stealth.value": 1,
          },
          item: "Liquor"
        },
        {
          eventName: "Patron",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Pet dog"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.close_combat.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Pistol or Revolver"
        },
        {
          eventName: "Unexpected success",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Book collection"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.religion.value": 2,
          },
          item: "Writing utensils and paper"
        },
        {
          eventName: "Created a masterpiece",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Fine wines"
        }
      ]
    },
    Academic: {
      motivation: [
        "Charting the unknown",
        "Proving my critics wrong",
        "Becoming famous",
      ],
      trauma: [
        "Vaettir turned you into a rat",
        "Aged by the magic of a mermaid",
        "Watched your partner being torn apart by a giant",
      ],
      darkSecret: [
        "Addicted to drugs",
        "Stole or falsified documents to get research results",
        "Hunted by a vaesen"
      ],
      talents: [
        "Bookworm",
        "Erudite",
        "Knowledge is Reassuring",
      ],
      equipment: [
        "Book collection",
        "Map book",
        "Writing utensils and paper",
        "Liquor",
        "Slide rule",
      ],
      events: [
        {
          eventName: "Scandal",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Fine wines"
        },
        {
          eventName: "Distinguished employer",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Writing utensils and paper"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.learning.value": 1,
          },
          item: "Strong poison"
        },
        {
          eventName: "Socialite",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Musical instrument"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Opera glasses"
        },
        {
          eventName: "Influential work",
          skills: {
            "system.skill.learning.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Book collection"
        }
      ]
    },
    Doctor: {
      motivation: [
        "Exploring and describing the world",
        "Aiding the weak and afflicted",
        "Strengthening the Society and becoming its leader",
      ],
      trauma: [
        "A corpse came back to life during an autopsy",
        "Operated on a person with donkey's ears and hooves",
        "Saw your destiny in the eyes of a dying mermaid",
      ],
      darkSecret: [
        "Has two separate personalities",
        "Involved in illicit affairs",
        "Unnatural lust",
      ],
      talents: [
        "Army Medic",
        "Chief Physician",
        "Emergency Medicine",
      ],
      equipment: [
        "Medical equipment",
        "Liquor",
        "Fine wines",
        "Weak horse",
        "Strong poison",
      ],
      events: [
        {
          eventName: "Addiction",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Chemical equipment"
        },
        {
          eventName: "Complex case",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.learning.value": 1,
          },
          item: "Medical equipment"
        },
        {
          eventName: "Rival",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.stealth.value": 1,
          },
          item: "Extremely strong poison"
        },
        {
          eventName: "Socialite",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Fine wines"
        },
        {
          eventName: "Sweetheart",
          skills: {
            "system.skill.medicine.value": 1,
            "system.skill.learning.value": 1,
          },
          item: "Opera glasses"
        },
        {
          eventName: "Opened a pratice",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Book collection"
        }
      ]
    },
    Priest: {
      motivation: [
        "Performing a sacred mission",
        "Cleansing my tarnished soul",
        "Understanding God's creation",
      ],
      trauma: [
        "Hurt someone after being enthralled by a witch",
        "Watched a church grim tear apart some thieves trying to steal the church silver",
        "The third owner of a spertus, serving the church to avoid being twisted",
      ],
      darkSecret: [
        "The Devil speaks to me",
        "I have stolen my identity",
        "Ensnared by a vaesen"
      ],
      talents: [
        "Absolution",
        "Blessing",
        "Confessor",
      ],
      equipment: [
        "Musical instrument",
        "Fine wines",
        "Writing utensils and paper",
        "Holy water",
        "Bible",
      ],
      events: [
        {
          eventName: "Doubt",
          skills: {
            "system.skill.religion.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Liquor"
        },
        {
          eventName: "Popular",
          skills: {
            "system.skill.religion.value": 2,
          },
          item: "Musical instrument"
        },
        {
          eventName: "Enemy in the Church",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.religion.value": 1,
          },
          item: "Disguise"
        },
        {
          eventName: "Theological discovery",
          skills: {
            "system.skill.learning.value": 2,
          },
          item: "Book collection"
        },
        {
          eventName: "Forbidden Love",
          skills: {
            "system.skill.stealth.value": 1,
            "system.skill.manipulation.value": 1,
          },
          item: "Writing utensils and paper"
        },
        {
          eventName: "In God's Service",
          skills: {
            "system.skill.manipulation.value": 1,
            "system.skill.observation.value": 1,
          },
          item: "Horse and carriage"
        }
      ]
    },
  };

  static weaponList = [
    "kick or punch",
    "knuckle duster",
    "chair",
    "sledgehammer",
    "flail",
    "rifle butt",
    "knife or dagger",
    "rapier",
    "sword",
    "saber",
    "crowbar",
    "axe",
    "quarterstaff",
    "halberd",
    "bayonet",
    "whip",
    "spear",
    "bow",
    "longbow",
    "crossbow",
    "pistol or revolver",
    "musket",
    "rifle",
    "canon"
  ];
};