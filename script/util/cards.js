const PF = "askhem-cs";

const openDocument = async (uuid) => {
    const doc = await fromUuid(uuid);
    if (doc) doc.sheet.render(true);
};

// Global händelselyssnare för klick på tabellknappar och rubriklänkar
document.addEventListener('click', async (ev) => {
    const rollBtn = ev.target.closest(`.${PF}-roll-table-btn`);
    if (rollBtn) {
        ev.preventDefault();
        ev.stopPropagation();
        const table = await fromUuid(rollBtn.dataset.uuid);
        if (table) {
            await table.draw();
        }
        return;
    }

    const headerLink = ev.target.closest('.askhem-header-link');
    if (headerLink) {
        ev.preventDefault();
        ev.stopPropagation();
        openDocument(headerLink.dataset.uuid);
    }
});

Hooks.once('init', () => {
    CONFIG.TextEditor.enrichers.push(
        // 1. Tabeller (@DisplayTable)
        {
            pattern: /@DisplayTable\[(.*?)\]/g,
            enricher: async (match) => {
                const table = await fromUuid(match[1]);
                if (!table) return document.createElement("span");
                
                let rows = "";
                for (let r of table.results) {
                    const range = r.range[0] === r.range[1] ? `${r.range[0]}` : `${r.range[0]}-${r.range[1]}`;
                    const text = await TextEditor.enrichHTML(r.text || "", {async: true});
                    rows += `
                        <div style="display: flex; border-bottom: 1px solid #846758; padding: 6px 0; align-items: baseline;">
                            <div style="flex: 0 0 50px; font-weight: bold; text-align: center; border-right: 1px solid #846758; margin-right: 10px;">${range}</div>
                            <div style="flex: 1; font-size: 0.9em; padding-right: 10px;">${text}</div>
                        </div>`;
                }

                const tableName = (table.name || "").toUpperCase();

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="${PF}-card" style="margin: 1rem 0; border: 2px solid #846758; background: #fdfbf7; color: #412017; font-family: 'Lin', sans-serif;">
                        <div style="background: #412017; color: #e2c8b6; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-family: 'Berolina', serif;">
                            <span style="width: 30px;"></span>
                            <span style="text-align: center;"><i class="fas fa-dice-d6"></i> ${tableName}</span>
                            <button type="button" onclick="(async () => { const t = await fromUuid('${table.uuid}'); if(t) t.draw(); else ui.notifications.warn('Kunde inte hitta tabellen.'); })();" title="Slå på tabellen" style="background: transparent; border: none; color: #e2c8b6; cursor: pointer; font-size: 1.1em; padding: 0; margin: 0; box-shadow: none; pointer-events: auto;">
                                <i class="fas fa-dice"></i>
                            </button>
                        </div>
                        <div style="background: rgba(0,0,0,0.02); padding: 4px 8px;">
                            ${rows}
                        </div>
                    </div>`;

                return div;
            }
        },
// 2. Rollperson (@DisplayPC)
        {
            pattern: /@DisplayPC\[(.*?)\]/g,
            enricher: async (match) => {
                const pc = await fromUuid(match[1]);
                if (!pc) return document.createElement("span");
                
                const name = pc.name || "";
                const archetype = pc.system?.bio?.archetype || "";
                const socialStatus = pc.system?.bio?.social_status || "-";
                const age = pc.system?.bio?.age || "-";
                const description = pc.system?.bio?.description || "";
                
                // Hämta attribut och färdigheter
                const attributes = pc.system?.attribute || {};
                const skills = pc.system?.skill || {};
                
                let attributesHtml = "";
                const attrMapping = [
                    { key: "strength", label: "Styrka", check: "strength" },
                    { key: "agility", label: "Smidighet", check: "agility" },
                    { key: "sharpness", label: "Skärpa", check: "sharpness" },
                    { key: "presence", label: "Närvaro", check: "presence" }
                ];

                for (let attr of attrMapping) {
                    const attrData = attributes[attr.key];
                    const attrVal = attrData?.value ?? 0;
                    
                    let skillList = "";
                    for (let [skillKey, skillData] of Object.entries(skills)) {
                        if (skillData && skillData.attribute === attr.check) {
                            const sVal = skillData.value ?? 0;
                            const sLabel = skillData.label ? (game.i18n.localize(skillData.label) !== skillData.label ? game.i18n.localize(skillData.label) : skillData.label) : skillKey;
                            skillList += `<div style="font-size: 0.85em; display: flex; justify-content: space-between;"><span>${sLabel}:</span> <b>${sVal}</b></div>`;
                        }
                    }

                    attributesHtml += `
                        <div style="background: rgba(0,0,0,0.02); border: 1px solid #846758; padding: 6px; border-radius: 4px; display: flex; flex-direction: column; gap: 2px;">
                            <div style="font-size: 0.95em; border-bottom: 1px solid #846758; padding-bottom: 2px; display: flex; justify-content: space-between;">
                                <b>${attr.label}</b> <span><b>${attrVal}</b></span>
                            </div>
                            <div style="margin-top: 2px;">
                                ${skillList || '<i style="font-size: 0.8em; opacity: 0.7;">Inga färdigheter</i>'}
                            </div>
                        </div>`;
                }

                // Samla in favoriter och kontrollera om rustning finns
                let talentsHtml = "";
                let gearHtml = "";
                let hasArmor = false;

                for (let i of pc.items) {
                    if (i.system?.isFav) {
                        if (i.type === "talent") {
                            let bonusText = "";
                            const bType = i.system.bonusType;
                            if (bType === "skill") {
                                bonusText = " (Färdighet)";
                            } else if (bType === "damage") {
                                const bVal = i.system.bonus ?? 0;
                                bonusText = ` (Skada +${bVal})`;
                            } else if (bType === "other") {
                                bonusText = " (Annan bonus)";
                            }
                            talentsHtml += `<div style="margin-top: 2px;">• <b>${i.name}</b><span style="font-size: 0.85em; opacity: 0.8;">${bonusText}</span></div>`;
                        } else if (i.type === "weapon") {
                            const bonus = i.system.bonus ?? 0;
                            const damage = i.system.damage || "";
                            gearHtml += `<div style="margin-top: 2px;">• <b>${i.name}</b> (Bonus: ${bonus}, Skada: ${damage})</div>`;
                        } else if (i.type === "armor") {
                            hasArmor = true;
                            const protection = i.system.protection ?? 0;
                            gearHtml += `<div style="margin-top: 2px;">• <b>${i.name}</b> (Skydd: ${protection})</div>`;
                        }
                    }
                }

                const gearHeader = hasArmor ? "VAPEN & RUSTNING:" : "VAPEN:";

                let favoritesContent = "";
                if (talentsHtml || gearHtml) {
                    favoritesContent = `
                        <div style="margin-top: 8px; border-top: 1px solid #846758; padding-top: 6px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">${gearHeader}</div>
                                    ${gearHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inget</i>'}
                                </div>
                                <div>
                                    <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">TALANGER:</div>
                                    ${talentsHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inga</i>'}
                                </div>
                            </div>
                        </div>`;
                }

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="${PF}-card" style="margin: 1rem 0; border: 2px solid #846758; background: #fdfbf7; color: #412017; font-family: 'Lin', sans-serif;">
                        <div class="${PF}-card-header" style="background: #412017; color: #e2c8b6; padding: 6px 12px; display: flex; justify-content: space-between; font-weight: bold; font-family: 'Berolina', serif;">
                            <a class="askhem-header-link" data-uuid="${pc.uuid}" style="color: #e2c8b6; text-decoration: none; cursor: pointer;">
                                <i class="fas fa-user"></i> ${name}
                            </a>
                            <span>${archetype}</span>
                        </div>
                        <div style="padding: 10px 15px; display: flex; gap: 15px; align-items: flex-start;">
                            <img src="${pc.img}" style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #846758; flex-shrink: 0;" />
                            <div style="flex: 1; font-size: 0.95em;">
                                <div><b>Samhällsstånd:</b> ${socialStatus} | <b>Ålder:</b> ${age}</div>
                                ${description ? `<div style="margin-top: 6px; font-style: italic;">${description}</div>` : ""}
                                <div style="margin-top: 8px; border-top: 1px solid #846758; padding-top: 6px;">
                                    <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">EGENSKAPER & FÄRDIGHETER:</div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                        ${attributesHtml}
                                    </div>
                                </div>
                                ${favoritesContent}
                            </div>
                        </div>
                    </div>`;
                return div;
            }
        },
       // 3. SLP (@DisplayNpc)
        {
            pattern: /@DisplayNpc\[(.*?)\]/g,
            enricher: async (match) => {
                const npc = await fromUuid(match[1]);
                if (!npc) return document.createElement("span");
                
                const name = npc.name || "";
                const strength = npc.system?.attributes?.strength?.value ?? "-";
                const description = npc.system?.information || npc.system?.bio?.description || "";
                
                let skillsHtml = "";
                let weaponsHtml = "";

                for (let i of npc.items) {
                    if (i.type === "skill") {
                        const sVal = i.system?.value ?? 0;
                        skillsHtml += `<div style="font-size: 0.85em; display: flex; justify-content: space-between; margin-bottom: 2px; padding-right: 15px;"><span style="padding-right: 8px;">${i.name}:</span> <b>${sVal}</b></div>`;
                    } else if (i.type === "weapon" || i.isWeapon) {
                        const bonus = i.system?.bonus ?? 0;
                        const damage = i.system?.damage || "";
                        weaponsHtml += `<div style="margin-top: 2px; font-size: 0.9em;">• <b>${i.name}</b> (Bonus: ${bonus}, Skada: ${damage})</div>`;
                    }
                }

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="${PF}-card" style="margin: 1rem 0; border: 2px solid #846758; background: #fdfbf7; color: #412017; font-family: 'Lin', sans-serif;">
                        <div class="${PF}-card-header" style="background: #412017; color: #e2c8b6; padding: 6px 12px; display: flex; justify-content: space-between; font-weight: bold; font-family: 'Berolina', serif;">
                            <a class="askhem-header-link" data-uuid="${npc.uuid}" style="color: #e2c8b6; text-decoration: none; cursor: pointer;">
                                <i class="fas fa-user-shield"></i> ${name}
                            </a>
                            <span>Styrka: ${strength}</span>
                        </div>
                        <div style="padding: 10px 15px; display: flex; gap: 15px; align-items: flex-start;">
                            <img src="${npc.img}" style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #846758; flex-shrink: 0;" />
                            <div style="flex: 1; font-size: 0.95em; min-width: 0;">
                                ${description ? `<div style="margin-bottom: 8px; font-style: italic; white-space: pre-wrap;">${description}</div>` : ""}
                                <div style="border-top: 1px solid #846758; padding-top: 6px;">
                                    <div style="display: grid; grid-template-columns: 200px 30px 1fr; gap: 0;">
                                        <div>
                                            <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">FÄRDIGHETER:</div>
                                            ${skillsHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inga färdigheter</i>'}
                                        </div>
                                        <div></div>
                                        <div>
                                            <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">VAPEN:</div>
                                            ${weaponsHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inga vapen</i>'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                return div;
            }
        },

        // 4. Monster (@DisplayMonster)
        {
            pattern: /@DisplayMonster\[(.*?)\]/g,
            enricher: async (match) => {
                const monster = await fromUuid(match[1]);
                if (!monster) return document.createElement("span");
                
                const name = monster.name || "";
                const strength = monster.system?.attributes?.strength?.value ?? "-";
                const description = monster.system?.information || monster.system?.bio?.description || "";
                
                let skillsHtml = "";
                for (let i of monster.items) {
                    if (i.type === "skill") {
                        const sVal = i.system?.value ?? 0;
                        skillsHtml += `<div style="font-size: 0.85em; display: flex; justify-content: space-between; margin-bottom: 2px; padding-right: 15px;"><span style="padding-right: 8px;">${i.name}:</span> <b>${sVal}</b></div>`;
                    }
                }

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="${PF}-card" style="margin: 1rem 0; border: 2px solid #846758; background: #fdfbf7; color: #412017; font-family: 'Lin', sans-serif;">
                        <div class="${PF}-card-header" style="background: #412017; color: #e2c8b6; padding: 6px 12px; display: flex; justify-content: space-between; font-weight: bold; font-family: 'Berolina', serif;">
                            <a class="askhem-header-link" data-uuid="${monster.uuid}" style="color: #e2c8b6; text-decoration: none; cursor: pointer;">
                                <i class="fas fa-dragon"></i> ${name}
                            </a>
                            <span>Styrka: ${strength}</span>
                        </div>
                        <div style="padding: 10px 15px; display: flex; gap: 15px; align-items: flex-start;">
                            <img src="${monster.img}" style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #846758; flex-shrink: 0;" />
                            <div style="flex: 1; font-size: 0.95em; min-width: 0;">
                                ${description ? `<div style="margin-bottom: 8px; font-style: italic; white-space: pre-wrap;">${description}</div>` : ""}
                                <div style="border-top: 1px solid #846758; padding-top: 6px;">
                                    <div style="display: grid; grid-template-columns: 200px 30px 1fr; gap: 0;">
                                        <div>
                                            <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">FÄRDIGHETER:</div>
                                            ${skillsHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inga färdigheter</i>'}
                                        </div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                return div;
            }
        },
// 5. Detaljerat Monster med tabell för Monsterattacker (@DisplayMonsterDetails)
        {
            pattern: /@DisplayMonsterDetails\[(.*?)\]/g,
            enricher: async (match) => {
                const monster = await fromUuid(match[1]);
                if (!monster) return document.createElement("span");
                
                const name = monster.name || "";
                const strength = monster.system?.attributes?.strength?.value ?? "-";
                const description = monster.system?.information || monster.system?.bio?.description || "";
                
                // Samla färdigheter
                let skillsHtml = "";
                for (let i of monster.items) {
                    if (i.type === "skill") {
                        const sVal = i.system?.value ?? 0;
                        skillsHtml += `<div style="font-size: 0.85em; display: flex; justify-content: space-between; margin-bottom: 2px; padding-right: 15px;"><span style="padding-right: 8px;">${i.name}:</span> <b>${sVal}</b></div>`;
                    }
                }

                // Hämta monsterattacker från den kopplade attacktabellen via system.attackTable
                let attacksHtml = "";
                let attackTable = null;
                if (monster.system?.attackTable) {
                    attackTable = await fromUuid(monster.system.attackTable);
                }

                if (attackTable && attackTable.results) {
                    for (let result of attackTable.results) {
                        const rangeStr = result.range && result.range[0] === result.range[1] ? `${result.range[0]}` : `${result.range[0]}-${result.range[1]}`;
                        let text = result.text || result.description || "";
                        attacksHtml += `
                            <div style="display: flex; border-bottom: 1px solid #846758; padding: 6px 0; align-items: baseline;">
                                <div style="flex: 0 0 40px; font-weight: bold; text-align: center; border-right: 1px solid #846758; margin-right: 10px;">${rangeStr}</div>
                                <div style="flex: 1; font-size: 0.9em;">${text}</div>
                            </div>`;
                    }
                } else {
                    attacksHtml = `<div style="font-size: 0.85em; font-style: italic; padding: 6px 0;">Ingen attacktabell kopplad till detta monster.</div>`;
                }

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="${PF}-card" style="margin: 1rem 0; border: 2px solid #846758; background: #fdfbf7; color: #412017; font-family: 'Lin', sans-serif;">
                        <div class="${PF}-card-header" style="background: #412017; color: #e2c8b6; padding: 6px 12px; display: flex; justify-content: space-between; font-weight: bold; font-family: 'Berolina', serif;">
                            <a class="askhem-header-link" data-uuid="${monster.uuid}" style="color: #e2c8b6; text-decoration: none; cursor: pointer;">
                                <i class="fas fa-dragon"></i> ${name}
                            </a>
                            <span>Styrka: ${strength}</span>
                        </div>
                        <div style="padding: 10px 15px;">
                            <div style="display: flex; gap: 15px; align-items: flex-start;">
                                <img src="${monster.img}" style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #846758; flex-shrink: 0;" />
                                <div style="flex: 1; font-size: 0.95em; min-width: 0;">
                                    ${description ? `<div style="margin-bottom: 8px; font-style: italic; white-space: pre-wrap;">${description}</div>` : ""}
                                    <div style="border-top: 1px solid #846758; padding-top: 6px;">
                                        <div style="display: grid; grid-template-columns: 200px 30px 1fr; gap: 0;">
                                            <div>
                                                <div style="font-size: 0.85em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">FÄRDIGHETER:</div>
                                                ${skillsHtml || '<i style="font-size: 0.8em; opacity: 0.7;">Inga färdigheter</i>'}
                                            </div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Nedre delen: Tabell för Monsterattacker med samma stilrena knapp -->
                            <div style="margin-top: 12px; border-top: 2px solid #846758; padding-top: 8px;">
                                <div style="background: #412017; color: #e2c8b6; padding: 4px 8px; font-weight: bold; font-family: 'Berolina', serif; text-align: center; font-size: 0.95em; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="width: 30px;"></span>
                                    <span><i class="fas fa-dice-d6"></i> MONSTERATTACKER</span>
                                    ${attackTable ? `
                                        <button type="button" onclick="(async () => { const t = await fromUuid('${attackTable.uuid}'); if(t) t.draw(); else ui.notifications.warn('Kunde inte hitta attacktabellen.'); })();" title="Slå monsterattack" style="background: transparent; border: none; color: #e2c8b6; cursor: pointer; font-size: 1.1em; padding: 0; margin: 0; box-shadow: none; pointer-events: auto;">
                                            <i class="fas fa-dice"></i>
                                        </button>` : `<span style="width: 30px;"></span>`}
                                </div>
                                <div style="background: rgba(0,0,0,0.02); border: 1px solid #846758; padding: 4px 8px; border-radius: 4px;">
                                    ${attacksHtml}
                                </div>
                            </div>
                        </div>
                    </div>`;
                return div;
            }
        },
    );
});