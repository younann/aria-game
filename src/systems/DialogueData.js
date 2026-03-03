export const DIALOGUES = {
  bridge_intro: [
    { speaker: "Commander", portrait: "commander", text: "Cadet Nova, welcome aboard the ISS Prometheus. I wish we were meeting under better circumstances." },
    { speaker: "Commander", portrait: "commander", text: "A cosmic storm has damaged our onboard AI, ARIA. Without her, the station's systems are failing." },
    { speaker: "Commander", portrait: "commander", text: "Your mission: repair ARIA module by module. You'll need to understand how she thinks to fix her." },
    {
      speaker: "Commander", portrait: "commander",
      text: "Ready to begin, Cadet?",
      choices: [
        { label: "Yes, Commander!", next: "bridge_ready" },
        { label: "What happened to ARIA?", next: "bridge_lore" },
      ],
    },
  ],
  bridge_ready: [
    { speaker: "Commander", portrait: "commander", text: "Good. Head to the Data Vault first. ARIA's memory banks need recalibration." },
    { speaker: "ARIA", portrait: "aria_glitch", text: "H-h-hello... C-Cadet... I can... barely... process..." },
    { speaker: "Commander", portrait: "commander", text: "That's ARIA trying to reach you. Help her, Cadet." },
  ],
  bridge_lore: [
    { speaker: "Commander", portrait: "commander", text: "ARIA was our most advanced Adaptive Research Intelligence Agent. She ran everything — navigation, life support, research." },
    { speaker: "Commander", portrait: "commander", text: "The storm scrambled her neural pathways. We need someone who can learn how AI works to piece her back together." },
    { speaker: "Commander", portrait: "commander", text: "That someone is you. Head to the Data Vault to begin." },
  ],
  datavault_intro: [
    { speaker: "ARIA", portrait: "aria_glitch", text: "C-Cadet... my memory... is fragmented... I can't tell... friend from foe..." },
    { speaker: "ARIA", portrait: "aria_glitch", text: "Incoming signals... I need you to... classify them for me... so I can... relearn..." },
    { speaker: "System", portrait: null, text: "MISSION: Classify incoming alien signals as FRIENDLY or HOSTILE to restore ARIA's pattern recognition." },
  ],
  datavault_complete: [
    { speaker: "ARIA", portrait: "aria_25", text: "I can... see patterns now. Thank you, Cadet. My memory banks are stabilizing." },
    { speaker: "ARIA", portrait: "aria_25", text: "You taught me something called 'Supervised Learning'. Labeling data so I can learn from examples." },
    { speaker: "Commander", portrait: "commander", text: "Excellent work. ARIA's memory is at 25%. Head to the Neural Core next — her thinking circuits need rewiring." },
  ],
  neuralcore_intro: [
    { speaker: "ARIA", portrait: "aria_25", text: "Cadet... I can remember now, but I can't think clearly. My synaptic weights are all wrong." },
    { speaker: "ARIA", portrait: "aria_25", text: "I need you to manually adjust the connections in my neural core. Find the right balance." },
    { speaker: "System", portrait: null, text: "MISSION: Adjust ARIA's synaptic weights to restore her decision-making ability." },
  ],
  neuralcore_complete: [
    { speaker: "ARIA", portrait: "aria_50", text: "My circuits are firing correctly again! I can make decisions now. I feel... clearer." },
    { speaker: "ARIA", portrait: "aria_50", text: "Each connection has a weight — like how important it is. You found the right weights using something called Gradient Descent." },
    { speaker: "Commander", portrait: "commander", text: "ARIA's at 50% and climbing. The Simulation Deck is next — she needs to learn to navigate on her own." },
  ],
  simdeck_intro: [
    { speaker: "ARIA", portrait: "aria_50", text: "I can think now, but I don't know how to ACT. I need to learn by doing — by trial and error." },
    { speaker: "ARIA", portrait: "aria_50", text: "Set up a simulation for me. Place rewards and obstacles. I'll try to find the best path." },
    { speaker: "System", portrait: null, text: "MISSION: Design an environment and train ARIA to navigate through it using reinforcement learning." },
  ],
  simdeck_complete: [
    { speaker: "ARIA", portrait: "aria_75", text: "I've learned to navigate! Each attempt taught me something. Good moves get rewards, bad moves get penalties." },
    { speaker: "ARIA", portrait: "aria_75", text: "This is Reinforcement Learning — learning through experience, not just examples. I'm almost fully repaired!" },
    { speaker: "Commander", portrait: "commander", text: "Outstanding, Cadet. Report to the Command Center. It's time to bring ARIA fully online." },
  ],
  command_finale: [
    { speaker: "ARIA", portrait: "aria_100", text: "Cadet Nova... I am fully operational. Thank you for rebuilding me." },
    { speaker: "ARIA", portrait: "aria_100", text: "You taught me to recognize patterns, to think with weights and biases, and to learn from my own experience." },
    { speaker: "ARIA", portrait: "aria_100", text: "These are the same principles behind every AI on Earth — from medical scanners to self-driving cars." },
    { speaker: "Commander", portrait: "commander", text: "Cadet, you have exceeded all expectations. The ISS Prometheus is safe because of you." },
    { speaker: "Commander", portrait: "commander", text: "On behalf of the Deep Space Research Initiative, I hereby promote you. Well done, Commander." },
  ],
};
