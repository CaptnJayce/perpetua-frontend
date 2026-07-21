import type { DialogueTree } from "./types";

export const gaigeDialogue: DialogueTree = {
  entryNodeIds: ["intro"],
  nodes: {
    intro: {
      id: "intro",
      text: "Oh oh oh! Look who it is! I was wondering when I'd run into you!",
      options: [{ text: "Oh no.", nextNodeId: "intro_2" }],
    },
    intro_2: {
      id: "intro_2",
      text: "I heard someone built a bounty board and thought to come check it out, low and behold it's the wirepuller that's aching for resources.",
      options: [
        {
          text: "Already with the attitude.",
          nextNodeId: "intro_a1",
        },
        { text: "Wirepuller?!", nextNodeId: "intro_b1" },
      ],
    },
    intro_a1: {
      id: "intro_a1",
      text: "Mentally prepping, were you? Must have known someone - or rather, a LOT of someones would start catching onto your nonsense schematics.",
      options: [
        {
          text: "A lot of people who lack comprehension.",
          nextNodeId: "intro_a2",
        },
      ],
    },
    intro_a2: {
      id: "intro_a2",
      text: "The only one lacking comprehension is the Mantle of Logic you somehow coddled into believing this will work. Do you know what will happen when your generators are in the atmosphere? They won't gently ask for kinetic energy stores to fill your battery - they'll push against the planets orbit and start slowing Perpetua down.",
      options: [
        {
          text: "That's a hypothetical worst case scenario which doesn't reflect reality. There are enough cosmic events that could, in theory, speed Perpetua back up just as it has happened in the past.",
          nextNodeId: "intro_a3",
        },
      ],
    },
    intro_a3: {
      id: "intro_a3",
      text: "'Hypothetical worst case scenario' - That's exactly what they said about the thermics. Look where we are now only fifty years later, no forests, no plants, no green anywhere.",
      options: [
        {
          text: "The thermics were an issue that came and left before I was even born, not that it's even remotely the same thing. You want me to blow on Perpetua and make it cooler?",
          nextNodeId: "intro_a3_b1",
        },
        {
          text: "Drastic times call for drastic measures. You were apart of the generation that let the thermics melt this planet - where were you then?",
          nextNodeId: "intro_a3_a1",
        },
      ],
    },
    intro_a3_b1: {
      id: "intro_a3_b1",
      text: "Not in practice, no, but spiritually, it's the same thing. Surely you understand? Perpetua doesn't achieve perpetuity through energy, it achieves it through life and the quality of it.",
      options: [
        {
          text: "Energy is life, Gaige. You want your food cooled? You want to be able to sleep at night? How do you plan to do that without any energy?",
          nextNodeId: "intro_a3_b2",
        },
      ],
    },
    intro_a3_b2: {
      id: "intro_a3_b2",
      text: "I do plan to do that, but with dust. It's renewable, it's abundant, it doesn't damage the environment. Tell me. Tell me why we're not using dustation to our advantage?",
      options: [
        {
          text: "It's just too unknown. We don't know how dustation occurs, we don't know what kinds of dust exist. We need something we can try and test quickly.",
          nextNodeId: "intro_a3_b3",
        },
      ],
    },
    intro_a3_b3: {
      id: "intro_a3_b3",
      text: "'Too unkown'... Laughable. As if perpetual energy itself isn't a pipe dream... For what it's worth, I do hope it works, Felicity. Your 'Perpetual Kinetic Energy'... For Perpetua's sake.",
      options: [
        {
          text: "It will. Just have some trust in me, Gaige.",
          nextNodeId: "end",
        },
      ],
    },
    intro_a3_a1: {
      id: "intro_a3_a1",
      text: "That had nothing to do with me. I was just as loud about the thermics as I am about this.",
      options: [
        {
          text: "Being loud isn't the solution. Solutions are solutions. What are you actually doing to help Perpetua?",
          nextNodeId: "intro_a3_a2",
        },
      ],
    },
    intro_a3_a2: {
      id: "intro_a3_a2",
      text: "A lot. I'm just not blessed enough to work with the Mantle of Logic directly, or to have nigh-infinite resources delivered to my front door... Such a waste.",
      options: [
        {
          text: "You've had more life than me to earn it. Don't be bitter. Start providing results.",
          nextNodeId: "intro_a3_a3",
        },
      ],
    },
    intro_a3_a3: {
      id: "intro_a3_a3",
      text: "Humble. Truly. Quality takes time. Every single one of my inventions has been integrated into society fully with no drawback. Just you wait until you're asking me for steam dust to get your pathetic blazer boxes off the floor.",
      options: [{ text: "Get lost.", nextNodeId: "end" }],
    },
    intro_b1: {
      id: "intro_b1",
      text: "I said what I said. You are a wirepuller. It is absolutely beyond me how you managed to gain the favour of the oh so great Mantle of Logic, but I suppose tis a testament to how bereft he is of sense.",
      options: [
        {
          text: "Of course hard work and reason would be beyond you. Too much thinking not enough tinkering.",
          nextNodeId: "intro_b2",
        },
      ],
    },
    intro_b2: {
      id: "intro_b2",
      text: "Haha! Sassy. Nice one. So tell me, Felicity, what is it about 'Perpetual Kinetic Motion' that has you so whipped? Sure, it's a neat concept, but it's not exactly sound in... uh... oh yeah... realism.",
      options: [
        {
          text: "I believe it be to a practical solution to our energy and global warming crisis. It solves the thermics issue, and will contribute to cooling down the planet.",
          nextNodeId: "intro_b3",
        },
      ],
    },
    intro_b3: {
      id: "intro_b3",
      text: "That's what you say, but how? The thought doesn't stand to reason. Don't you see a particular, almost GLARING, flaw in your architecture?",
      options: [
        { text: "Nah mate.", nextNodeId: "intro_b4" },
        { text: "The planet's orbit?", nextNodeId: "intro_b3_a1" },
      ],
    },
    intro_b3_a1: {
      id: "intro_b3_a1",
      text: "Yes. Despite it's name our planet's orbit isn't perpetual, so tell me, just how is the energy supposed to be? And more importantly, how do you plan to stop the planet from SLOWING DOWN?!",
      options: [
        {
          text: "Perpetua is so fast because of several cosmic phenomena that sped it up - phenomena of which occur on average about every one thousand years.",
          nextNodeId: "intro_b3_a2",
        },
      ],
    },
    intro_b3_a2: {
      id: "intro_b3_a2",
      text: "And how slowly, or quickly, will your generators slow down the planet?",
      options: [
        {
          text: "We'll gain about an extra thirty minutes of day time every five hundred years. It's a non-issue.",
          nextNodeId: "intro_b3_a3",
        },
      ],
    },
    intro_b3_a3: {
      id: "intro_b3_a3",
      text: "For how many assumed Perpetual Kinetic Generators?",
      options: [{ text: "About a hundred.", nextNodeId: "intro_b3_a4" }],
    },
    intro_b3_a4: {
      id: "intro_b3_a4",
      text: "So, for every one hundred generators in the atmosphere, we get an extra hour every one thousand years. Look, I understand that doesn't sound bad, but genuinely, deeply reflect on how it could spiral out of control. Please. For Perpetua's sake.",
      options: [{ text: "I have. Now I'm here.", nextNodeId: "intro_b3_a5" }],
    },
    intro_b3_a5: {
      id: "intro_b3_a5",
      text: "Ugh... I'll see you around Felicity. Don't drift us into our star by the time I see you again.",
      options: [{ text: "...", nextNodeId: "end" }],
    },
    intro_b4: {
      id: "intro_b4",
      text: "Don't act innocent, Felicity. You're not some wonderkid. 'Perpetual Kinetic Energy'?! You're not a Witch from Fabryka, there's no such thing as perpetual energy.",
      options: [
        {
          text: "No such thing yet you mean. I haven't finished inventing it.",
          nextNodeId: "intro_b5",
        },
        {
          text: "Correct, I'm not a wonderkid. I'm a wonderadult.",
          nextNodeId: "intro_b4_a1",
        },
      ],
    },

    intro_b4_a1: {
      id: "intro_b4_a1",
      text: "Go fuck yourself. You're going to slow down Perpt-... You know what. Forget it. You're not even worth the words.",
      options: [{ text: "...", nextNodeId: "end" }],
    },
    intro_b5: {
      id: "intro_b5",
      text: "You're not inventing perpetual motion, you're inventing a brake for our planet's orbit you dimwit. Do you really think that kinetic energy is for free? The only reason that moron Isaac listens to you is because he's desperate and is too traumatised to be a proper leader.",
      options: [
        {
          text: "Do not call the Mantle of Logic a moron, just because we both realise something you don't.",
          nextNodeId: "intro_b6",
        },
      ],
    },
    intro_b6: {
      id: "intro_b6",
      text: "Calling him a Mantle doesn't change what happened on Earth nor does it make your ideas more plausible. We both know that. If he intends to absolve himself I suggest he does it with water and not with fire.",
      options: [
        {
          text: "Isaac works hard to make sure that this society turns into something meaningful. He has a good head on his shoulders. We'll provide the results, I can promise you that much.",
          nextNodeId: "intro_b7",
        },
      ],
    },
    intro_b7: {
      id: "intro_b7",
      text: "Felicity. Providing the results is exactly the thing I'm worried about.",
      options: [
        {
          text: "...",
          nextNodeId: "end",
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
