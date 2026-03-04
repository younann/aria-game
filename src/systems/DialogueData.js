// Structural template — keeps speaker, portrait, choices.next
// Text is resolved at runtime via t() from the locale

const DIALOGUES_TEMPLATE = {
  bridge_intro: [
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander", choices: [
      { next: "bridge_ready" },
      { next: "bridge_lore" },
    ] },
  ],
  bridge_ready: [
    { speaker: "Commander", portrait: "commander" },
    { speaker: "ARIA", portrait: "aria_glitch" },
    { speaker: "Commander", portrait: "commander" },
  ],
  bridge_lore: [
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
  ],
  datavault_intro: [
    { speaker: "ARIA", portrait: "aria_glitch" },
    { speaker: "ARIA", portrait: "aria_glitch" },
    { speaker: "System", portrait: null },
  ],
  datavault_complete: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "Commander", portrait: "commander" },
  ],
  neuralcore_intro: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "System", portrait: null },
  ],
  neuralcore_complete: [
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "Commander", portrait: "commander" },
  ],
  simdeck_intro: [
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "System", portrait: null },
  ],
  simdeck_complete: [
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "Commander", portrait: "commander" },
  ],
  opticslab_intro: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "System", portrait: null },
  ],
  opticslab_complete: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "Commander", portrait: "commander" },
  ],
  commsarray_intro: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "System", portrait: null },
  ],
  commsarray_complete: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "Commander", portrait: "commander" },
  ],
  ethicschamber_intro: [
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "System", portrait: null },
  ],
  ethicschamber_complete: [
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
  ],
  level2_intro: [
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
  ],
  level3_intro: [
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
  ],
  memory_fragment_1: [
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
    { speaker: "ARIA", portrait: "aria_25" },
  ],
  memory_fragment_2: [
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
  ],
  memory_fragment_3: [
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
    { speaker: "ARIA", portrait: "aria_50" },
  ],
  memory_fragment_4: [
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
    { speaker: "ARIA", portrait: "aria_75" },
  ],
  command_finale: [
    { speaker: "ARIA", portrait: "aria_100" },
    { speaker: "ARIA", portrait: "aria_100" },
    { speaker: "ARIA", portrait: "aria_100" },
    { speaker: "ARIA", portrait: "aria_100" },
    { speaker: "Commander", portrait: "commander" },
    { speaker: "Commander", portrait: "commander" },
  ],
};

/**
 * Build locale-aware dialogues from the template.
 * Speaker names and all text come from the locale via t().
 */
export function getDialogues(t) {
  const result = {};
  for (const [key, lines] of Object.entries(DIALOGUES_TEMPLATE)) {
    result[key] = lines.map((line, i) => {
      const built = {
        speaker: t(`dialogue.speaker.${line.speaker}`),
        portrait: line.portrait,
        text: t(`dialogue.${key}.${i}.text`),
      };
      if (line.choices) {
        built.choices = line.choices.map((ch, ci) => ({
          label: t(`dialogue.${key}.${i}.choices.${ci}.label`),
          next: ch.next,
        }));
      }
      return built;
    });
  }
  return result;
}

// Keep backward-compatible named export for any old imports
export const DIALOGUES = DIALOGUES_TEMPLATE;
