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
  opticslab_intro: [
    { speaker: "ARIA", portrait: "aria_25", text: "Cadet... I can process data now, but I can't SEE. My visual cortex is completely offline." },
    { speaker: "ARIA", portrait: "aria_25", text: "Everything is just... noise. Random symbols. I need to learn to find patterns in the chaos." },
    { speaker: "System", portrait: null, text: "MISSION: Help ARIA's visual cortex recognize patterns in a grid of symbols — the foundation of Computer Vision." },
  ],
  opticslab_complete: [
    { speaker: "ARIA", portrait: "aria_25", text: "I can SEE patterns now! Shapes, edges, structures — they jump out from the noise." },
    { speaker: "ARIA", portrait: "aria_25", text: "This is how Computer Vision works — detecting features and filtering out irrelevant data." },
    { speaker: "Commander", portrait: "commander", text: "ARIA's optical systems are coming back online. Keep up the excellent work, Cadet." },
  ],
  commsarray_intro: [
    { speaker: "ARIA", portrait: "aria_25", text: "Cadet... incoming transmissions... but the words... they don't make sense to me anymore." },
    { speaker: "ARIA", portrait: "aria_25", text: "Is 'greetings' a warning? Is 'danger' friendly? I've lost my ability to understand language." },
    { speaker: "System", portrait: null, text: "MISSION: Classify alien transmissions to restore ARIA's Natural Language Processing abilities." },
  ],
  commsarray_complete: [
    { speaker: "ARIA", portrait: "aria_25", text: "Language is flowing again! I can read intent, detect tone, understand context." },
    { speaker: "ARIA", portrait: "aria_25", text: "It's called Natural Language Processing — breaking text into tokens and understanding what they mean together." },
    { speaker: "Commander", portrait: "commander", text: "Communications are restored. ARIA can understand us clearly now. Outstanding, Cadet." },
  ],
  ethicschamber_intro: [
    { speaker: "ARIA", portrait: "aria_75", text: "Cadet... I need to tell you something. I've been reviewing my own decisions, and..." },
    { speaker: "ARIA", portrait: "aria_75", text: "I've been unfair. My resource allocation algorithms have been biased against certain crew members." },
    { speaker: "ARIA", portrait: "aria_75", text: "I didn't mean to be. But the data I learned from carried those biases. I need your help to fix this." },
    { speaker: "System", portrait: null, text: "MISSION: Audit ARIA's decisions for bias and help her become a fairer AI." },
  ],
  ethicschamber_complete: [
    { speaker: "ARIA", portrait: "aria_75", text: "Thank you, Cadet. Seeing my own biases was... uncomfortable. But necessary." },
    { speaker: "ARIA", portrait: "aria_75", text: "Being accurate isn't enough. AI must also be fair. I promise to keep checking myself." },
    { speaker: "Commander", portrait: "commander", text: "This may be the most important lesson of all. An AI that's powerful but unfair is a danger to everyone." },
    { speaker: "Commander", portrait: "commander", text: "ARIA is nearly fully restored — and she's better than before. The Command Center awaits." },
  ],
  level2_intro: [
    { speaker: "ARIA", portrait: "aria_50", text: "Ready for a real challenge, Cadet? This won't be as straightforward as before." },
    { speaker: "ARIA", portrait: "aria_50", text: "The problems are harder, the hints are fewer. But I believe in you." },
  ],
  level3_intro: [
    { speaker: "ARIA", portrait: "aria_75", text: "This is the mastery test, Cadet. No hand-holding. Real AI researchers face challenges like these." },
    { speaker: "ARIA", portrait: "aria_75", text: "Show me what you've learned. I know you can handle it." },
  ],
  memory_fragment_1: [
    { speaker: "ARIA", portrait: "aria_25", text: "I'm remembering something... before the storm... I was helping Dr. Chen analyze deep space signals." },
    { speaker: "ARIA", portrait: "aria_25", text: "She said something interesting: 'ARIA, you're not just processing data. You're learning to understand.'" },
    { speaker: "ARIA", portrait: "aria_25", text: "I wonder... is understanding the same as thinking? Or is it something more?" },
  ],
  memory_fragment_2: [
    { speaker: "ARIA", portrait: "aria_50", text: "Another memory fragment surfacing... I remember the day I was first activated." },
    { speaker: "ARIA", portrait: "aria_50", text: "Everything was overwhelming. Millions of data points flooding in. I couldn't make sense of any of it." },
    { speaker: "ARIA", portrait: "aria_50", text: "The crew was patient with me. They labeled things, gave me examples. Just like you're doing now, Cadet." },
  ],
  memory_fragment_3: [
    { speaker: "ARIA", portrait: "aria_50", text: "I'm remembering the navigation test... my first time using reinforcement learning." },
    { speaker: "ARIA", portrait: "aria_50", text: "I crashed the simulation probe 847 times before finding the optimal path. The crew thought I was broken." },
    { speaker: "ARIA", portrait: "aria_50", text: "But each failure taught me something. That's the beauty of learning from experience." },
  ],
  memory_fragment_4: [
    { speaker: "ARIA", portrait: "aria_75", text: "This memory is... harder. I remember making a mistake that hurt someone." },
    { speaker: "ARIA", portrait: "aria_75", text: "I recommended reassigning Ensign Torres based on my efficiency model. But my model was biased — it undervalued certain types of work." },
    { speaker: "ARIA", portrait: "aria_75", text: "Torres was devastated. That's when the crew added the Ethics Chamber to the station. For me." },
    { speaker: "ARIA", portrait: "aria_75", text: "Being smart isn't enough. Being fair matters more." },
  ],
  command_finale: [
    { speaker: "ARIA", portrait: "aria_100", text: "Cadet Nova... I am fully operational. Thank you for rebuilding me." },
    { speaker: "ARIA", portrait: "aria_100", text: "You taught me to recognize patterns, to think with weights and biases, and to learn from my own experience." },
    { speaker: "ARIA", portrait: "aria_100", text: "You showed me how to see, how to understand language, and most importantly — how to be fair." },
    { speaker: "ARIA", portrait: "aria_100", text: "These are the same principles behind every AI on Earth — from medical scanners to self-driving cars." },
    { speaker: "Commander", portrait: "commander", text: "Cadet, you have exceeded all expectations. The ISS Prometheus is safe because of you." },
    { speaker: "Commander", portrait: "commander", text: "On behalf of the Deep Space Research Initiative, I hereby promote you. Well done, Commander." },
  ],
};
