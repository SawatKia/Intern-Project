// export interface Post_Interface {
//   _id: string;
//   created_stamp: Date;
//   published: boolean;
//   team: string;
//   creator: Creator;
//   content: Content;
// }
export interface Post_Interface {
  id: string;
  creator: {
    username: string;
  };
  created_stamp: string;
  content: Content;
  team: string;
  owner: boolean;
  published: boolean;
}

export interface Content {
  time: number;
  blocks: Block[];
  version: string;
}

export interface Creator {
  username: string;
  email: string;
}

export interface Block {
  id: string;
  type: string;
  data: Data;
}

export interface Data {
  text?: string;
  level?: number;
  style?: string;
  items?: string[];
}

export interface ID {
  $oid: string;
}

export enum Type {
  Header = "header",
  List = "list",
  Paragraph = "paragraph",
}
