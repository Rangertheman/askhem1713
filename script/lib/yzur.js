/**
 * ===============================================================================
 * YZUR:
 * YEAR ZERO UNIVERSAL DICE ROLLER FOR THE FOUNDRY VTT
 * ===============================================================================
 * Author: @Stefouch
 * Version: 6.0.0          for: Foundry VTT V14
 * Date: 2025-06-06
 * License: MIT
 * ===============================================================================
 */

class YearZeroDie extends foundry.dice.terms.Die {
  constructor(termData = {}) {
    termData.faces = Number.isInteger(termData.faces) ? termData.faces : 6;
    super(termData);
    if (this.maxPush == undefined) this.maxPush = termData.maxPush ?? 1;
  }
  get denomination() { return this.constructor.DENOMINATION; }
  get type() { return this.constructor.TYPE; }
  get pushable() {
    if (this.pushCount >= this.maxPush) return false;
    for (const r of this.results) {
      if (!r.active || r.discarded) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) return true;
    }
    return false;
  }
  get pushCount() { return this.results.reduce((c, r) => Math.max(c, r.indexPush || 0), 0); }
  get pushed() { return this.pushCount > 0; }
  get isYearZeroDie() { return true; }
  get success() {
    if (!this._evaluated) return undefined;
    const s = this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      if (r.count !== undefined) return tot + r.count;
      if (this.constructor.SUCCESS_TABLE) return tot + this.constructor.SUCCESS_TABLE[r.result];
      return tot + (r.result >= 6 ? 1 : 0);
    }, 0);
    return this.type === 'neg' ? -s : s;
  }
  get failure() {
    if (!this._evaluated) return undefined;
    return this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      return tot + (r.result <= 1);
    }, 0);
  }
  async roll(options = {}) {
    const roll = await super.roll(options);
    roll.indexResult = options.indexResult;
    if (roll.indexResult == undefined) {
      roll.indexResult = 1 + this.results.reduce((c, r) => {
        let i = r.indexResult;
        if (i == undefined) i = -1;
        return Math.max(c, i);
      }, -1);
    }
    roll.indexPush = options.indexPush ?? this.pushCount;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
  count(n) { return this.values.filter(v => v === n).length; }
  async push() {
    if (!this.pushable) {
      return this;
    }
    const indexPush = this.pushCount + 1;
    const indexesResult = [];
    for (const r of this.results) {
      if (!r.active || r.locked) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        r.active = false; r.discarded = true; r.pushed = true; r.hidden = true;
        indexesResult.push(r.indexResult);
      } else { r.hidden = true; }
    }
    
    await Promise.all(
      indexesResult.map(indexResult => this.roll({ indexResult, indexPush }))
    );
    
    return this;
  }
  nopush() { this.maxPush = 0; }
  setpush(modifier) {
    const rgx = /p([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [, max] = match;
    max = parseInt(max) ?? 1;
    this.maxPush = max;
  }
  getResultLabel(result) {
    let label = CONFIG.YZUR.Icons.getLabel(
      this.constructor.TYPE,
      result.result,
    );
    return label !== undefined && label !== null ? label : String(result.result);
  }
  getResultCSS(result) {
    const hasSuccess = result.success !== undefined;
    const hasFailure = result.failure !== undefined;
    let isMax = false, isMin = false;
    if (this.type === 'neg') {
      isMax = false;
      isMin = result.result === 6;
    }
    else if (this instanceof YearZeroDie) {
      const noMin = ['skill', 'arto', 'loc'];
      isMax = result.result === this.faces || result.result >= 6;
      isMin = result.result === 1 && !noMin.includes(this.type);
    }
    else {
      isMax = result.result === this.faces;
      isMin = result.result === 1;
    }
    return [
      this.type,
      this.constructor.name.toLowerCase(),
      'd' + this.faces,
      hasSuccess ? 'success' : null,
      hasFailure ? 'failure' : null,
      result.rerolled ? 'rerolled' : null,
      result.exploded ? 'exploded' : null,
      result.discarded ? 'discarded' : null,
      result.pushed ? 'pushed' : null,
      !(hasSuccess || hasFailure) && isMin ? 'min' : null,
      !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    ];
  }
  getTooltipData() {
    const rawRollItems = this.results.map(r => {
      return { 
        result: this.getResultLabel(r), 
        classes: this.getResultCSS(r).filterJoin(' '), 
        row: r.indexPush || 0, 
        col: r.indexResult || 0,
        active: r.active
      };
    });

    const rollMap = new Map();
    for (const r of rawRollItems) {
      const key = `${r.row}-${r.col}`;
      if (!rollMap.has(key) || (r.active && !rollMap.get(key).active)) {
        rollMap.set(key, r);
      }
    }
    
    const allRolls = Array.from(rollMap.values());

    const originalRolls = allRolls.filter(r => !r.row || r.row === 0).sort((a, b) => a.col - b.col);
    const pushedRolls = allRolls.filter(r => r.row && r.row > 0).sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    return {
      formula: this.expression, total: this.success, banes: this.failure,
      faces: this.faces, number: this.number, type: this.type,
      isYearZeroDie: this.isYearZeroDie,
      flavor: this.options.flavor ?? (CONFIG.YZUR?.Dice?.localizeDieTerms ? game.i18n.localize(`YZUR.DIETERMS.${this.constructor.name}`) : null),
      rolls: allRolls,
      originalRolls: originalRolls,
      pushedRolls: pushedRolls,
    };
  }
}

YearZeroDie.TYPE = 'blank';
YearZeroDie.LOCKED_VALUES = [6];
YearZeroDie.SERIALIZE_ATTRIBUTES.push('maxPush');
YearZeroDie.MODIFIERS = foundry.utils.mergeObject({'p': 'setpush', 'np': 'nopush'}, foundry.dice.terms.Die.MODIFIERS);

class BaseDie extends YearZeroDie {}
BaseDie.TYPE = 'base'; BaseDie.DENOMINATION = 'b'; BaseDie.LOCKED_VALUES = [1, 6];
class SkillDie extends YearZeroDie {}
SkillDie.TYPE = 'skill'; SkillDie.DENOMINATION = 's'; SkillDie.LOCKED_VALUES = [1, 6];
class GearDie extends YearZeroDie {}
GearDie.TYPE = 'gear'; GearDie.DENOMINATION = 'g'; GearDie.LOCKED_VALUES = [1, 6];
class NegativeDie extends SkillDie {}
NegativeDie.TYPE = 'neg'; NegativeDie.DENOMINATION = 'n';
class StressDie extends YearZeroDie {}
StressDie.TYPE = 'stress'; StressDie.DENOMINATION = 'z'; StressDie.LOCKED_VALUES = [1, 6];
class ArtifactDie extends SkillDie {
  getResultLabel(result) {
    let label = CONFIG.YZUR.Icons.getLabel(
      `d${this.constructor.DENOMINATION}`,
      result.result,
    );
    return label !== undefined && label !== null ? label : String(result.result);
  }
}
ArtifactDie.TYPE = 'arto'; ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4]; ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];
class D8ArtifactDie extends ArtifactDie { constructor(termData = {}) { termData.faces = 8; super(termData); } } D8ArtifactDie.DENOMINATION = '8';
class D10ArtifactDie extends ArtifactDie { constructor(termData = {}) { termData.faces = 10; super(termData); } } D10ArtifactDie.DENOMINATION = '10';
class D12ArtifactDie extends ArtifactDie { constructor(termData = {}) { termData.faces = 12; super(termData); } } D12ArtifactDie.DENOMINATION = '12';
class TwilightDie extends ArtifactDie {
  getResultLabel(result) {
    let label = CONFIG.YZUR.Icons.getLabel('base', result.result);
    return label !== undefined && label !== null ? label : String(result.result);
  }
}
TwilightDie.TYPE = 'base'; TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2]; TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];
class D6TwilightDie extends TwilightDie { constructor(termData = {}) { termData.faces = 6; super(termData); } } D6TwilightDie.DENOMINATION = '6';
class D8TwilightDie extends TwilightDie { constructor(termData = {}) { termData.faces = 8; super(termData); } } D8TwilightDie.DENOMINATION = '8';
class D10TwilightDie extends TwilightDie { constructor(termData = {}) { termData.faces = 10; super(termData); } } D10TwilightDie.DENOMINATION = '10';
class D12TwilightDie extends TwilightDie { constructor(termData = {}) { termData.faces = 12; super(termData); } } D12TwilightDie.DENOMINATION = '12';
class AmmoDie extends YearZeroDie { constructor(termData = {}) { termData.faces = 6; super(termData); } } AmmoDie.TYPE = 'ammo'; AmmoDie.DENOMINATION = 'm'; AmmoDie.LOCKED_VALUES = [1, 6];
class LocationDie extends YearZeroDie { constructor(termData = {}) { termData.faces = 6; super(termData); } get pushable() { return false; } roll(options) { const roll = super.roll(options); roll.count = 0; this.results[this.results.length - 1] = roll; return roll; } }
LocationDie.TYPE = 'loc'; LocationDie.DENOMINATION = 'l'; LocationDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 0]; LocationDie.LOCKED_VALUES = [1, 2, 3, 4, 5, 6];
class BladeRunnerDie extends ArtifactDie {
  getResultLabel(result) {
    let label = CONFIG.YZUR.Icons.getLabel('base', result.result);
    return label !== undefined && label !== null ? label : String(result.result);
  }
}
BladeRunnerDie.TYPE = 'base'; BladeRunnerDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2]; BladeRunnerDie.LOCKED_VALUES = [1];
class D6BladeRunnerDie extends BladeRunnerDie { constructor(termData = {}) { termData.faces = 6; super(termData); } } D6BladeRunnerDie.DENOMINATION = '6'; D6BladeRunnerDie.LOCKED_VALUES = [1, 6];
class D8BladeRunnerDie extends BladeRunnerDie { constructor(termData = {}) { termData.faces = 8; super(termData); } } D8BladeRunnerDie.DENOMINATION = '8'; D8BladeRunnerDie.LOCKED_VALUES = [1, 6, 7, 8];
class D10BladeRunnerDie extends BladeRunnerDie { constructor(termData = {}) { termData.faces = 10; super(termData); } } D10BladeRunnerDie.DENOMINATION = '10'; D10BladeRunnerDie.LOCKED_VALUES = [1, 10];
class D12BladeRunnerDie extends BladeRunnerDie { constructor(termData = {}) { termData.faces = 12; super(termData); } } D12BladeRunnerDie.DENOMINATION = '12'; D12BladeRunnerDie.LOCKED_VALUES = [1, 10, 11, 12];

var YearZeroDice = Object.freeze({ AmmoDie, ArtifactDie, BaseDie, BladeRunnerDie, D10ArtifactDie, D10BladeRunnerDie, D10TwilightDie, D12ArtifactDie, D12BladeRunnerDie, D12TwilightDie, D6BladeRunnerDie, D6TwilightDie, D8ArtifactDie, D8BladeRunnerDie, D8TwilightDie, GearDie, LocationDie, NegativeDie, SkillDie, StressDie, TwilightDie, YearZeroDie });

const YZUR = { 
  game: '', 
  Chat: { showInfos: true, diceSorting: ['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo'] }, 
  Roll: { 
    baseTemplate: '/systems/askhem1713/model/templates/dice/broll.hbs', 
    chatTemplate: "/systems/askhem1713/model/templates/dice/roll.hbs", 
    tooltipTemplate: "/systems/askhem1713/model/templates/dice/tooltip.hbs", 
    infosTemplate: "/systems/askhem1713/model/templates/dice/infos.hbs" 
  }, 
  Dice: { localizeDieTerms: true, DIE_TYPES: ['base', 'skill', 'neg', 'gear', 'stress', 'arto', 'ammo', 'loc'], DIE_TERMS: { 'base': BaseDie, 'skill': SkillDie, 'neg': NegativeDie, 'gear': GearDie, 'stress': StressDie, 'artoD8': D8ArtifactDie, 'artoD10': D10ArtifactDie, 'artoD12': D12ArtifactDie, 'a': D12TwilightDie, 'b': D10TwilightDie, 'c': D8TwilightDie, 'd': D6TwilightDie, 'ammo': AmmoDie, 'loc': LocationDie, 'brD12': D12BladeRunnerDie, 'brD10': D10BladeRunnerDie, 'brD8': D8BladeRunnerDie, 'brD6': D6BladeRunnerDie } }, 
  Icons: { getLabel: function (type, result) { const arto = ['d8', 'd10', 'd12']; if (arto.includes(type)) type = 'arto'; return String(CONFIG.YZUR.Icons[CONFIG.YZUR.game][type][result]); }, myz: { base: { '1': '☣', '2': 2, '3': 3, '4': 4, '5': 5, '6': '☢' }, skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '☢' }, neg: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '➖' }, gear: { '1': '💥', '2': 2, '3': 3, '4': 4, '5': 5, '6': '☢' } }, fbl: { base: { '1': '☠', '2': 2, '3': 3, '4': 4, '5': 5, '6': '⚔️' }, skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '⚔️' }, neg: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '➖' }, gear: { '1': '💥', '2': 2, '3': 3, '4': 4, '5': 5, '6': '⚔️' }, arto: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12 } }, alien: { skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '💠' }, stress: { '1': '😱', '2': 2, '3': 3, '4': 4, '5': 5, '6': '💠' } }, tales: { skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '⚛️' } }, cor: { skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '🐞' } }, vae: { skill: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': '⚜️' } }, t2k: { base: { '1': '💥', '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12 }, ammo: { '1': '💥', '2': 2, '3': 3, '4': 4, '5': 5, '6': '🎯' }, loc: { '1': 'L', '2': 'T', '3': 'T', '4': 'T', '5': 'A', '6': 'H' } }, br: { base: { '1': '🦄', '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12 } } } 
};

class YearZeroRoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    if (options.name == undefined) options.name = data.name;
    if (options.game == undefined) options.game = data.game;
    if (options.maxPush == undefined) options.maxPush = data.maxPush ?? 1;
    super(formula, data, options);
    if (!this.game) this.game = CONFIG.YZUR.game ?? 'myz';
    if (options.maxPush != undefined) this.maxPush = options.maxPush;
  }
  get game() { return this.options.game; } set game(yzGame) { this.options.game = yzGame; }
  get name() { return this.options.name; } set name(str) { this.options.name = str; }
  set maxPush(n) { 
    this.options.maxPush = n ?? 1; 
    for (const t of this.terms) {
      if (t instanceof YearZeroDie) {
        t.maxPush = this.options.maxPush;
      }
    }
  }
  get maxPush() { return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, 1); }
  get size() { return this.terms.reduce((s, t) => t instanceof YearZeroDie ? s + t.number : s, 0); }
  get pushCount() { return this.terms.reduce((c, t) => Math.max(c, t.pushCount || 0), 0); }
  get pushed() { return this.pushCount > 0; }
  get pushable() { return (this.pushCount < this.maxPush && this.terms.some(t => t.pushable)); }
  get successCount() { return this.terms.reduce((sc, t) => sc + (t.success ?? 0), 0); }
  get baneCount() { const banableTypes = ['base', 'gear', 'stress', 'ammo']; let count = 0; for (const bt of banableTypes) count += this.count(bt, 1); return count; }
  get attributeTrauma() { return this.count('base', 1); }
  get gearDamage() { return this.count('gear', 1); }
  get stress() { return this.count('stress'); }
  get panic() { return this.count('stress', 1); }
  get ammoSpent() { const mt = this.getTerms('ammo'); if (!mt.length) return 0; return mt.reduce((tot, t) => tot + t.values.reduce((a, b) => a + b, 0), 0); }
  get hitCount() { return this.count('ammo', 6); }
  get jamCount() { const n = this.count('ammo', 1); return n > 0 ? n + this.attributeTrauma : 0; }
  get jammed() { return this.pushed ? (this.jamCount >= 2) : false; }
  get baseSuccessQty() { return this.successCount - this.hitCount; }
  get hitLocations() { const lt = this.getTerms('loc'); if (!lt.length) return []; return lt.reduce((tot, t) => tot.concat(t.values), []); }
  get bestHitLocation() { if (!this.hitLocations.length) return undefined; return Math.max(...this.hitLocations); }
  static create(formula, data = {}, options = {}) { return new YearZeroRoll(formula, data, options); }
  static fromData(data) {
    const cls = CONFIG.Dice.rolls[CONFIG.YZUR?.Roll?.index ?? 0] || YearZeroRoll;
    const roll = new cls(data.formula, data.data, data.options);
    roll._total = data.total;
    roll._evaluated = data.evaluated;
    if (data.terms) {
      roll.terms = data.terms.map(t => foundry.dice.terms.DiceTerm.fromData(t));
    }
    return roll;
  }
  static forge(dice = [], { title, yzGame = null, maxPush = 1 } = {}, options = {}) {
    yzGame = yzGame ?? options.game ?? CONFIG.YZUR?.game;
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);
    if (!Array.isArray(dice)) dice = [dice];
    const out = [];
    for (const d of dice) out.push(YearZeroRoll._getTermFormulaFromBlok(d));
    let formula = out.join(' + ');
    if (!YearZeroRoll.validate(formula)) { console.warn(`YZUR | ${YearZeroRoll.name} | Invalid roll formula: "${formula}"`); formula = yzGame === 't2k' ? '1d6' : '1ds'; }
    if (options.name == undefined) options.name = title;
    if (options.flavor == undefined) options.flavor = title;
    if (options.game == undefined) options.game = yzGame;
    if (options.maxPush == undefined) options.maxPush = maxPush ?? 1;
    const roll = YearZeroRoll.create(formula, {}, options);
    roll.maxPush = options.maxPush;
    return roll;
  }
  static _getTermFormulaFromBlok(termBlok) { const { term, number, flavor, maxPush } = termBlok; return YearZeroRoll.generateTermFormula(number, term, flavor, maxPush); }
  static generateTermFormula(number, term, flavor = '', maxPush = null) { let f = `${number}d${term}`; if (typeof maxPush === 'number') f += `p${maxPush}`; if (flavor) f += `[${flavor}]`; return f; }
  getTerms(search) {
    if (typeof search === 'string') return this.terms.filter(t => t.type === search);
    return this.terms.filter(t => {
      let f = true;
      if (search.type != undefined) f = f && search.type === t.type;
      if (search.number != undefined) f = f && search.number === t.number;
      if (search.faces != undefined) f = f && search.faces === t.faces;
      return f;
    });
  }
  count(type, seed = null, comparison = '=') {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        if (t.results.length) {
          for (const r of t.results) {
            if (!r.active) continue;
            if (seed != null) {
              if (comparison === '>') { if (r.result > seed) c++; }
              else if (comparison === '>=') { if (r.result >= seed) c++; }
              else if (comparison === '<') { if (r.result < seed) c++; }
              else if (comparison === '<=') { if (r.result <= seed) c++; }
              else if (r.result === seed) { c++; }
            } else { c++; }
          }
        } else if (seed != null) { c += 0; } else { c += t.number; }
      }
      return c;
    }, 0);
  }
  async addDice(qty, type, { range = 6, value = null, options } = {}) {
    if (!qty) return this;
    const search = { type, faces: range, options };
    if (qty < 0) return this.removeDice(-qty, search);
    if (value != undefined && !this._evaluated) await this.roll();
    let term = this.getTerms(search)[0];
    if (term) { for (; qty > 0; qty--) { term.number++; if (this._evaluated) { term.roll(); if (value != undefined) term.results[term.results.length - 1].result = value; } } }
    else {
      const cls = CONFIG.YZUR.Dice.DIE_TERMS[type];
      term = new cls({ number: qty, faces: range, maxPush: this.maxPush ?? 1, options });
      if (this._evaluated) { await term.evaluate(); if (value != undefined) term.results.forEach(r => r.result = value); }
      if (this.terms.length > 0) this.terms.push(new OperatorTerm({ operator: type === 'neg' ? '-' : '+' }));
      this.terms.push(term);
    }
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) this._total = this._evaluateTotal();
    return this;
  }
  removeDice(qty, search, { discard = false, disable = false } = {}) {
    if (!qty) return this;
    for (; qty > 0; qty--) {
      const term = this.getTerms(search)[0];
      if (term) {
        term.number--;
        if (term.number <= 0) { const index = this.terms.findIndex(t => t.type === (search.type ?? search) && t.number === 0); this.terms.splice(index, 1); if (this.terms[index - 1]?.operator) this.terms.splice(index - 1, 1); }
        else if (this._evaluated) { const index = term.results.findIndex(r => r.active); if (index < 0) break; if (discard) term.results[index].discarded = discard; if (disable) term.results[index].active = !disable; else term.results.splice(index, 1); }
      } else break;
    }
    if (this.terms[0] instanceof OperatorTerm) this.terms.shift();
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) this._total = this.terms.length ? this._evaluateTotal() : 0;
    return this;
  }
  async push() { 
    if (!this._evaluated) await this.evaluate(); 
    if (!this.pushable) return this; 
    this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t); 
    this._evaluated = false; 
    await this.evaluate(); 
    return this; 
  }
  async getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData()).sort((a, b) => {
      const sorts = CONFIG?.YZUR?.Chat?.diceSorting || YZUR.Chat.diceSorting || [];
      if (!sorts.length) return 0;
      return sorts.indexOf(a.type) - sorts.indexOf(b.type);
    });

    return foundry.applications.handlebars.renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts,
      pushed: this.pushed,
      config: CONFIG.YZUR ?? {},
      options: this.options,
    });
  }
  async getRollInfos(template = null) { return foundry.applications.handlebars.renderTemplate(template ?? CONFIG.YZUR?.Roll?.infosTemplate, { roll: this }); }
  async render(chatOptions = {}) {
    chatOptions = foundry.utils.mergeObject({ user: game.user.id, flavor: this.name || this.options.flavor, template: this.constructor.CHAT_TEMPLATE, blind: false }, chatOptions);
    const isPrivate = chatOptions.isPrivate;
    if (!this._evaluated) await this.evaluate();
    const chatData = {
      formula: isPrivate ? '???' : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
      success: isPrivate ? '?' : this.successCount,
      showInfos: isPrivate ? false : CONFIG.YZUR?.Chat?.showInfos,
      infos: isPrivate ? null : await this.getRollInfos(chatOptions.infosTemplate),
      pushable: isPrivate ? false : this.pushable,
      options: chatOptions,
      isPrivate,
      roll: this,
    };
    return foundry.applications.handlebars.renderTemplate(chatOptions.template, chatData);
  }
  async toMessage(messageData = {}, { rollMode = null, create = true } = {}) { return await super.toMessage(messageData, { rollMode, create }); }
}

class YearZeroRollManager {
  static GAMES = ['myz', 'fbl', 'alien', 'tales', 'cor', 'vae', 't2k', 'br'];
  static DIE_TERMS_MAP = { 'myz': ['base', 'skill', 'gear', 'neg'], 'fbl': ['base', 'skill', 'gear', 'neg', 'artoD8', 'artoD10', 'artoD12'], 'alien': ['skill', 'stress'], 'tales': ['skill'], 'cor': ['skill'], 'vae': ['skill'], 't2k': ['a', 'b', 'c', 'd', 'ammo', 'loc'], 'br': ['brD12', 'brD10', 'brD8', 'brD6'] };
  static register(yzGame, config, options = {}) { YearZeroRollManager._overrideDiceTermFromData(); YearZeroRollManager.registerConfig(config); YearZeroRollManager._initialize(yzGame); YearZeroRollManager.registerDice(yzGame, options?.index); }
  static registerConfig(config) { CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config); }
  static registerDice(yzGame, i) { const diceTypes = YearZeroRollManager.DIE_TERMS_MAP[yzGame]; for (const type of diceTypes) YearZeroRollManager.registerDie(type); YearZeroRollManager.registerRoll(undefined, i); }
  static registerRoll(cls = YearZeroRoll, i = 0) { CONFIG.Dice.rolls[i] = cls; CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.Roll.chatTemplate; CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.Roll.tooltipTemplate; CONFIG.YZUR.Roll.index = i; }
  static registerDie(term) { const cls = CONFIG.YZUR.Dice.DIE_TERMS[term]; const deno = cls.DENOMINATION; CONFIG.Dice.terms[deno] = cls; }
  static _initialize(yzGame) { CONFIG.YZUR.game = yzGame; }
  static _overrideDiceTermFromData() {
    foundry.dice.terms.DiceTerm.fromData = function (data) {
      let cls = CONFIG.Dice.termTypes[data.class];
      if (!cls) {
        const termkeys = Object.keys(CONFIG.Dice.terms);
        const stringifiedFaces = String(data.faces);
        if (data.class === 'Die' && termkeys.includes(stringifiedFaces)) {
          cls = CONFIG.Dice.terms[stringifiedFaces];
          data.class = cls.name;
        }
        else
          cls = Object.values(CONFIG.Dice.terms).find(c => c.name === data.class) || foundry.dice.terms.Die;
      }
      return cls._fromData(data);
    };
  }
  static _overrideRollCreate(index = 1) { Roll.prototype.constructor.create = function (formula, data = {}, options = {}) { const isYZURFormula = options.yzur ?? formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i); const cls = CONFIG.Dice.rolls[isYZURFormula ? index : 0]; return new cls(formula, data, options); }; }
}
export { YZUR, YearZeroDice, YearZeroRoll, YearZeroRollManager };