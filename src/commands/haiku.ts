import type {CommandInteraction} from "discord.js";
import {Discord, Slash} from "discordx";
import haikus from "./haikus.txt" with {type: "text"};

@Discord()
export class Haiku {
    @Slash({name: "haiku", description: "Post a random deadlock haiku from reddit"})
    async haiku(interaction: CommandInteraction) {
        const allHaikus = (haikus as string).split('\n\n\n');
        const randomHaiku = allHaikus[Math.floor(Math.random() * allHaikus.length)];
        await interaction.reply(randomHaiku);
    }
}