import { prop } from "@typegoose/typegoose";

export class Post {
  @prop()
  public title?: string;
}