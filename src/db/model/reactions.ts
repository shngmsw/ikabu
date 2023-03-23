export class Reactions {
  user_id: string;
  reaction_seq: number;
  channel_id: string;
  year: string;
  count: number;
  constructor(
    reaction_seq: $TSFixMe,
    user_id: $TSFixMe,
    channel_id: $TSFixMe,
    year: $TSFixMe,
    count: $TSFixMe
  ) {
    this.user_id = user_id;
    this.reaction_seq = reaction_seq;
    this.channel_id = channel_id;
    this.year = year;
    this.count = count;
  }
}
