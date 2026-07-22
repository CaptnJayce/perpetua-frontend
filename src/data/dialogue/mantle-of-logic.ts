import type { DialogueTree } from "./types";

export const mantleOfLogicDialogue: DialogueTree = {
  entryNodeIds: [
    "intro",
    "worker_visit",
    "worker_visit_2",
    "worker_visit_3",
    "specialization_intro",
  ],
  nodes: {
    intro: {
      id: "intro",
      text: "Welcome to your new place of work! Your perpetual kinetic research has shown a lot of promise, so we're giving you the means to make your contraptions a reality.",
      options: [{ text: "Let's get to it", nextNodeId: "npc_display" }],
    },
    npc_display: {
      id: "npc_display",
      text: "Just below me, you'll see an 'Actions' dashboard, showing you upgrades, worker management, and a list of people you have spoken with whilst at work. Transcripts of your conversations will be stored and can be accessed by tapping their portrait, their portraits will also glow green if they ever have something to say.",
      options: [{ text: "Noted.", nextNodeId: "resources_dashboard" }],
    },
    resources_dashboard: {
      id: "resources_dashboard",
      text: "On your left is your 'Resources' dashboard, showing what you can collect, what you've collected, and what you should be working towards. It's a lot simpler than it looks, just a lot of knobs, dials, and displays to keep track of everything.",
      options: [{ text: "Good to know.", nextNodeId: "workers_intro" }],
    },
    workers_intro: {
      id: "workers_intro",
      text: "As for the workers, you'll get them overtime. Your first one is scheduled to arrive shortly.",
      options: [{ text: "Also good to know!", nextNodeId: "goal" }],
    },
    goal: {
      id: "goal",
      text: "Once you've proven you can take the kinetic energy from the planets orbit with a generator and store it in a battery - we'll speak again. Until then, Felicity.",
      options: [{ text: "Until then!", nextNodeId: "end" }],
    },
    worker_visit: {
      id: "worker_visit",
      requireFlag: "purchased_upgrade",
      text: "Good progress so far! I've brought over one of Gaige's workers to help you get along, treat him well!",
      options: [
        {
          text: "Thank you. I'll put him to use.",
          nextNodeId: "end",
          setFlag: "unlock_worker_one",
        },
      ],
    },
    worker_visit_2: {
      id: "worker_visit_2",
      requireFlag: "assembly_floor_built",
      text: "Nice job on getting this floor built. Here's a new hire for you to make use of.",
      options: [
        {
          text: "Thank you!",
          nextNodeId: "end",
          setFlag: "unlock_worker_two",
        },
      ],
    },
    worker_visit_3: {
      id: "worker_visit_3",
      requireFlag: "boiler_room_built",
      text: "Yet another worker for you. You must be getting close to that PKG now.",
      options: [
        {
          text: "Slow and steady.",
          nextNodeId: "end",
          setFlag: "unlock_worker_three",
        },
      ],
    },
    specialization_intro: {
      id: "specialization_intro",
      requireFlag: "generator_online",
      text: "Incredible! You have granted the people of Perpetua infinite energy! My title is hardly befitting of me with a tinkerer like you in the Magnus Factory.",
      options: [
        {
          text: "Wonder what it takes to get that title from you",
          nextNodeId: "specialization_intro_a1",
        },
        {
          text: "You flatter me",
          nextNodeId: "specialization_intro_b1",
        },
      ],
    },
    specialization_intro_a1: {
      id: "specialization_intro_a1",
      text: "Hahaha! Well, an effervescent heirloom would do it - unfortunately there's only one of those per to go around, and taking mine would probably kill me.",
      options: [
        {
          text: "An efferveffer-what?",
          nextNodeId: "specialization_promotion",
        },
      ],
    },
    specialization_intro_b1: {
      id: "specialization_intro_b1",
      text: "This isn't flattery. What you've done is truly revolutionary. Generations of future deeds rest on your scales.",
      options: [
        {
          text: "The recognition is appreciated!",
          nextNodeId: "specialization_promotion",
        },
      ],
    },
    specialization_promotion: {
      id: "specialization_promotion",
      text: "I think this is deserving of a hefty promotion - This is no usual promotion, however. The technology is still yours by right - so I'll let you decide which direction you steer the Magnus Factory.",
      options: [
        {
          text: "Choices choices.",
          nextNodeId: "end",
          setFlag: "specialization_briefed",
        },
      ],
    },
    end: {
      id: "end",
      text: "...",
      options: [],
    },
  },
};
