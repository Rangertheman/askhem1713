const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AskhemCharacterWizard extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.currentStep = 1;
    this.tempActor = null;
    this.isCompleted = false;
    this.characterData = {
      archetypeId: null,
      socialClassId: null,
      weaponChoice: null,
      weaponChoice2: null,
      armorChoice: null,
      miseryId: null,
      age: 20
    };
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    window: { title: "Rollpersonsguiden" },
    position: { width: 550, height: 800 },
    classes: ["askhem-character-wizard"]
  };

  static PARTS = {
    main: {
      template: "systems/askhem1713/model/character-creation-dialog.hbs"
    }
  };

  async _prepareContext(options) {
    if (!this.tempActor) {
      this.tempActor = await Actor.create({
        name: "Ny rollperson",
        type: "player",
        flags: { askhem1713: { isCreating: true } }
      }, { temporary: true });
    }

    const archetypes = game.items.filter(i => i.type === "archetype");
    const selectedArchetypeData = archetypes.find(a => String(a.id) === String(this.characterData.archetypeId));

    const miseries = game.items.filter(i => i.type === "misery");
    const selectedMiseryData = miseries.find(m => String(m.id) === String(this.characterData.miseryId));

    let archetypeSocialStatuses = [];
    let archetypeArmors = [];
    let resolvedTalent = null;

    let weaponPart1Type = null;
    let weaponPart1Options = [];
    let weaponPart1Value = "";

    let weaponPart2Type = null;
    let weaponPart2Options = [];
    let weaponPart2Value = "";

    if (selectedArchetypeData && selectedArchetypeData.system) {
      if (selectedArchetypeData.system.socialStatus) {
        archetypeSocialStatuses = selectedArchetypeData.system.socialStatus
          .split(/,|\s+eller\s+|\s+samt\s+/)
          .map(s => s.trim())
          .filter(Boolean);
      }

      if (selectedArchetypeData.system.armor) {
        archetypeArmors = selectedArchetypeData.system.armor
          .split(/,|\s+eller\s+|\s+samt\s+/)
          .map(a => a.trim())
          .filter(Boolean);
      }

      if (archetypeSocialStatuses.length === 1 && !this.characterData.socialClassId) {
        this.characterData.socialClassId = archetypeSocialStatuses[0];
      }
      if (archetypeArmors.length === 1 && !this.characterData.armorChoice) {
        this.characterData.armorChoice = archetypeArmors[0];
      }

      const rawWeaponStr = selectedArchetypeData.system.weapon || "";
      if (rawWeaponStr.trim() !== "") {
        const parts = rawWeaponStr.split(/\s+samt\s+/i);

        if (parts[0]) {
          const p1 = parts[0].trim();
          if (/eller/i.test(p1)) {
            weaponPart1Type = "select";
            weaponPart1Options = p1.split(/\s+eller\s+/i).map(w => w.replace(/^en\s+/i, "").trim()).filter(Boolean);
            if (weaponPart1Options.length === 1 && !this.characterData.weaponChoice) {
              this.characterData.weaponChoice = weaponPart1Options[0];
            }
          } else {
            weaponPart1Type = "fixed";
            weaponPart1Value = p1.replace(/^en\s+/i, "").trim();
            this.characterData.weaponChoice = weaponPart1Value;
          }
        }

        if (parts[1]) {
          const p2 = parts[1].trim();
          if (/valfritt enhandsvapen/i.test(p2)) {
            weaponPart2Type = "select";
            weaponPart2Options = game.items.filter(i => i.type === "weapon" && i.system?.grip === "1H").map(i => i.name);
          } else if (/eller/i.test(p2)) {
            weaponPart2Type = "select";
            weaponPart2Options = p2.split(/\s+eller\s+/i).map(w => w.replace(/^en\s+/i, "").trim()).filter(Boolean);
          } else {
            weaponPart2Type = "fixed";
            weaponPart2Value = p2.replace(/^en\s+/i, "").trim();
            this.characterData.weaponChoice2 = weaponPart2Value;
          }
        } else {
          weaponPart2Type = "none";
        }
      }

      const rawTalent = selectedArchetypeData.system.talent;
      let talentName = "";
      
      if (typeof rawTalent === "string") {
        talentName = rawTalent;
      } else if (rawTalent && typeof rawTalent === "object") {
        talentName = rawTalent.name || rawTalent.title;
      }

      if (talentName) {
        const foundItem = game.items.find(i => i.type === "talent" && i.name.toLowerCase() === talentName.toLowerCase());
        if (foundItem) {
          resolvedTalent = {
            name: foundItem.name,
            description: foundItem.system?.description || ""
          };
        } else if (rawTalent && typeof rawTalent === "object") {
          resolvedTalent = {
            name: talentName,
            description: rawTalent.system?.description || rawTalent.description || ""
          };
        } else {
          resolvedTalent = { name: talentName, description: "" };
        }
      }
    }

    const age = parseInt(this.characterData.age) || 20;
    let totalAttrPoints = 15;
    let skillPoints = 8;
    if (age >= 26 && age <= 50) {
      totalAttrPoints = 14;
      skillPoints = 10;
    } else if (age >= 51) {
      totalAttrPoints = 13;
      skillPoints = 12;
    }

    const currentAttrs = this.tempActor.system.attribute;
    let currentAttrSum = 0;
    for (let key of Object.keys(currentAttrs)) {
      let val = parseInt(currentAttrs[key]?.value);
      if (isNaN(val) || val < 1) val = 1;
      currentAttrs[key].value = val;
      currentAttrSum += val;
    }
    let attrPoints = totalAttrPoints - currentAttrSum;

    const currentSkills = this.tempActor.system.skill;
    for (let key of Object.keys(currentSkills)) {
      let val = parseInt(currentSkills[key]?.value) || 0;
      if (val < 0) val = 0;
      skillPoints -= val;
    }

    const primaryAttr = selectedArchetypeData?.system?.primaryAttribute || "";
    const primarySkillsStr = (selectedArchetypeData?.system?.skills || "").toLowerCase();
    const primarySkillsList = primarySkillsStr.split(",").map(s => s.trim()).filter(Boolean);

    const sortedSkills = Object.entries(currentSkills).sort((a, b) => {
      return game.i18n.localize(a[1].label).localeCompare(game.i18n.localize(b[1].label), 'sv');
    });

    let formattedSkills = {};
    for (let [key, skill] of sortedSkills) {
      const localizedLabel = game.i18n.localize(skill.label).toLowerCase();
      const isPrimary = primarySkillsList.includes(key.toLowerCase()) || primarySkillsList.includes(localizedLabel);
      formattedSkills[key] = {
        label: skill.label,
        value: skill.value,
        isPrimary: isPrimary,
        attribute: skill.attribute
      };
    }

    return {
      currentStep: this.currentStep,
      archetypes: archetypes,
      selectedArchetypeData: selectedArchetypeData,
      miseries: miseries,
      selectedMiseryData: selectedMiseryData,
      resolvedTalent: resolvedTalent,
      archetypeSocialStatuses: archetypeSocialStatuses,
      archetypeArmors: archetypeArmors,
      hasWeapon: Boolean(selectedArchetypeData?.system?.weapon && selectedArchetypeData.system.weapon.trim() !== ""),
      weaponPart1Type,
      weaponPart1Options,
      weaponPart1Value,
      weaponPart2Type,
      weaponPart2Options,
      weaponPart2Value,
      characterData: this.characterData,
      attributePointsLeft: attrPoints,
      skillPointsLeft: skillPoints,
      isStrengthPrimary: primaryAttr === "strength",
      isAgilityPrimary: primaryAttr === "agility",
      isSharpnessPrimary: primaryAttr === "sharpness",
      isPresencePrimary: primaryAttr === "presence",
      system: {
        attribute: currentAttrs,
        skill: formattedSkills
      },
      eq: (a, b) => String(a) === String(b)
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    
    const html = this.element;
    
    // Tvinga fönstrets kropp att ha pergamentbakgrund
    const windowContent = html.closest(".window-content");
    if (windowContent) {
      windowContent.style.backgroundColor = "#f9f8f6";
    }
    const windowApp = html.closest(".askhem-character-wizard");
    if (windowApp) {
      const body = windowApp.querySelector(".window-content");
      if (body) body.style.backgroundColor = "#f9f8f6";
    }

    const selectArchetype = html.querySelector("[name='archetype-select']");
    if (selectArchetype) {
      selectArchetype.addEventListener("change", (event) => {
        this.characterData.archetypeId = event.target.value;
        this.characterData.socialClassId = null;
        this.characterData.weaponChoice = null;
        this.characterData.weaponChoice2 = null;
        this.characterData.armorChoice = null;
        this.render();
      });
    }

    const selectSocialClass = html.querySelector("[name='socialclass-select']");
    if (selectSocialClass) {
      selectSocialClass.addEventListener("change", (event) => {
        this.characterData.socialClassId = event.target.value;
      });
    }

    const selectWeapon1 = html.querySelector("[name='weapon-select-1']");
    if (selectWeapon1) {
      selectWeapon1.addEventListener("change", (event) => {
        this.characterData.weaponChoice = event.target.value;
      });
    }

    const selectWeapon2 = html.querySelector("[name='weapon-select-2']");
    if (selectWeapon2) {
      selectWeapon2.addEventListener("change", (event) => {
        this.characterData.weaponChoice2 = event.target.value;
      });
    }

    const selectArmor = html.querySelector("[name='armor-select']");
    if (selectArmor) {
      selectArmor.addEventListener("change", (event) => {
        this.characterData.armorChoice = event.target.value;
      });
    }

    const selectMisery = html.querySelector("[name='misery-select']");
    if (selectMisery) {
      selectMisery.addEventListener("change", (event) => {
        this.characterData.miseryId = event.target.value;
        this.render();
      });
    }

    const randomMiseryBtn = html.querySelector("[data-action='randomize-misery']");
    if (randomMiseryBtn && context.miseries && context.miseries.length > 0) {
      randomMiseryBtn.addEventListener("click", () => {
        const randomIndex = Math.floor(Math.random() * context.miseries.length);
        this.characterData.miseryId = context.miseries[randomIndex].id;
        this.render();
      });
    }

    const inputAge = html.querySelector("[name='age-input']");
    if (inputAge) {
      inputAge.addEventListener("change", (event) => {
        this.characterData.age = parseInt(event.target.value) || 20;
        this.tempActor.update({ "system.bio.age": this.characterData.age });
        this.render();
      });
    }

    html.querySelectorAll(".cc-btn").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        const action = event.currentTarget.dataset.action;
        const target = event.currentTarget.dataset.target;
        if (!target) return;

        const parts = target.split('.');
        const attrKey = parts[2];
        let val = parseInt(this.tempActor.system.attribute[attrKey]?.value);
        if (isNaN(val) || val < 1) val = 1;

        const primaryAttr = context.selectedArchetypeData?.system?.primaryAttribute || "";
        const maxVal = (attrKey === primaryAttr) ? 5 : 4;

        const age = parseInt(this.characterData.age) || 20;
        let totalAttrPoints = age >= 51 ? 13 : (age >= 26 ? 14 : 15);
        
        let currentAttrSum = 0;
        for (let k of Object.keys(this.tempActor.system.attribute)) {
          let currVal = (k === attrKey ? val : (parseInt(this.tempActor.system.attribute[k]?.value) || 1));
          if (currVal < 1) currVal = 1;
          currentAttrSum += currVal;
        }
        let attrPointsLeft = totalAttrPoints - currentAttrSum;

        if (action === "increase" && attrPointsLeft > 0 && val < maxVal) {
          val++;
        } else if (action === "decrease" && val > 1) {
          val--;
        }

        await this.tempActor.update({ [`system.attribute.${attrKey}.value`]: val });
        this.render();
      });
    });

    html.querySelectorAll(".cc-skill-btn").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        const action = event.currentTarget.dataset.action;
        const key = event.currentTarget.dataset.key;
        if (!key) return;

        let val = parseInt(this.tempActor.system.skill[key]?.value) || 0;
        const skillObj = context.system.skill[key];
        const maxSkillVal = skillObj?.isPrimary ? 3 : 1;

        const age = parseInt(this.characterData.age) || 20;
        let skillPoints = age >= 51 ? 12 : (age >= 26 ? 10 : 8);
        for (let k of Object.keys(this.tempActor.system.skill)) {
          skillPoints -= (k === key ? val : (parseInt(this.tempActor.system.skill[k]?.value) || 0));
        }

        if (action === "increase" && skillPoints > 0 && val < maxSkillVal) {
          val++;
        } else if (action === "decrease" && val > 0) {
          val--;
        }

        await this.tempActor.update({ [`system.skill.${key}.value`]: val });
        this.render();
      });
    });

    const nextBtn = html.querySelector("[data-action='next-step']");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentStep === 1) {
          if (!this.characterData.archetypeId) {
            ui.notifications.warn("Du måste välja en arketyp innan du kan gå vidare.");
            return;
          }
          this.currentStep = 2;
          this.render();
        } else if (this.currentStep === 2) {
          if (context.archetypeSocialStatuses && context.archetypeSocialStatuses.length > 1 && !this.characterData.socialClassId) {
            ui.notifications.warn("Du måste välja ett samhällsstånd.");
            return;
          }
          if (context.weaponPart1Type === "select" && !this.characterData.weaponChoice) {
            ui.notifications.warn("Du måste göra ett val för vapen.");
            return;
          }
          if (context.weaponPart2Type === "select" && !this.characterData.weaponChoice2) {
            ui.notifications.warn("Du måste göra ett val för vapen 2.");
            return;
          }
          if (context.archetypeArmors && context.archetypeArmors.length > 1 && !this.characterData.armorChoice) {
            ui.notifications.warn("Du måste välja en rustning.");
            return;
          }
          if (context.miseries && context.miseries.length > 0 && !this.characterData.miseryId) {
            ui.notifications.warn("Du måste välja eller slumpa fram ett elände.");
            return;
          }

          this.currentStep = 3;
          this.render();
        }
      });
    }

    const prevBtn = html.querySelector("[data-action='prev-step']");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentStep === 2) {
          this.currentStep = 1;
          this.render();
        } else if (this.currentStep === 3) {
          this.currentStep = 2;
          this.render();
        }
      });
    }

    const finishBtn = html.querySelector("[data-action='finish-wizard']");
    if (finishBtn) {
      finishBtn.addEventListener("click", async () => {
        const nameInput = html.querySelector("[name='character-name']");
        const charName = nameInput ? nameInput.value.trim() : "Ny rollperson";

        let itemsToCreate = [];

        // 1. Vapen 1
        if (this.characterData.weaponChoice) {
          let foundWeapon = game.items.find(i => i.type === "weapon" && i.name.toLowerCase() === this.characterData.weaponChoice.toLowerCase());
          if (foundWeapon) {
            itemsToCreate.push(foundWeapon.toObject());
          } else {
            itemsToCreate.push({
              name: this.characterData.weaponChoice,
              type: "weapon",
              system: { grip: "1H", bonus: 0, damage: 1 }
            });
          }
        }

        // 2. Vapen 2
        if (this.characterData.weaponChoice2) {
          let foundWeapon2 = game.items.find(i => i.type === "weapon" && i.name.toLowerCase() === this.characterData.weaponChoice2.toLowerCase());
          if (foundWeapon2) {
            itemsToCreate.push(foundWeapon2.toObject());
          } else {
            itemsToCreate.push({
              name: this.characterData.weaponChoice2,
              type: "weapon",
              system: { grip: "1H", bonus: 0, damage: 1 }
            });
          }
        }

        // 3. Rustning
        if (this.characterData.armorChoice) {
          let foundArmor = game.items.find(i => i.type === "armor" && i.name.toLowerCase() === this.characterData.armorChoice.toLowerCase());
          if (foundArmor) {
            itemsToCreate.push(foundArmor.toObject());
          } else {
            itemsToCreate.push({
              name: this.characterData.armorChoice,
              type: "armor",
              system: { protection: 1 }
            });
          }
        }

        // 4. Elände
        if (this.characterData.miseryId) {
          let foundMisery = game.items.get(this.characterData.miseryId);
          if (foundMisery) {
            itemsToCreate.push(foundMisery.toObject());
          }
        }

        // 5. Talang från arketyp
        if (context.resolvedTalent) {
          let foundTalent = game.items.find(i => i.type === "talent" && i.name.toLowerCase() === context.resolvedTalent.name.toLowerCase());
          if (foundTalent) {
            itemsToCreate.push(foundTalent.toObject());
          } else {
            itemsToCreate.push({
              name: context.resolvedTalent.name,
              type: "talent",
              system: { description: context.resolvedTalent.description }
            });
          }
        }

        const updateData = {
          name: charName || "Ny rollperson",
          "system.bio.age": parseInt(this.characterData.age) || 20,
          "system.bio.social_status": this.characterData.socialClassId || "",
          "system.bio.archetype": context.selectedArchetypeData?.name || "",
          "flags.askhem1713.isCreating": false
        };

        await this.tempActor.update(updateData);
        
        if (itemsToCreate.length > 0) {
          await this.tempActor.createEmbeddedDocuments("Item", itemsToCreate);
        }
        
        this.isCompleted = true;
        this.close();
        this.tempActor.sheet.render(true);
      });
    }
  }

  async close(options) {
    if (!this.isCompleted && this.tempActor) {
      try {
        await this.tempActor.delete();
      } catch (err) {
        console.error("Kunde inte radera tillfällig aktör vid stängning:", err);
      }
    }
    return super.close(options);
  }
}