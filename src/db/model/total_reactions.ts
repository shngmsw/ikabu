export class TotalReactions {
  reaction_seq: number;
  emoji_id: string;
  emoji_name: string;
  count: number;
  constructor(
    reaction_seq: number,
    emoji_id: string,
    emoji_name: string,
    count: number
  ) {
    this.reaction_seq = reaction_seq;
    this.emoji_id = emoji_id;
    this.emoji_name = emoji_name;
    this.count = count;
  }
}
