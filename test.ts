import { randomUUID } from "crypto";

class User {
  constructor(public id: number) {}
}

class RoomUser {
  info: User;

  room?: Room;

  get id() {
    return this.info.id;
  }

  constructor(user: User) {
    this.info = user;
  }

  onJoinedRoom(room: Room) {
    this.room = room;
  }

  onDisconnectedRoom() {
    console.log("ah got disconnected");
  }
}

class Room {
  users: RoomUser[];
  id: string;

  constructor() {
    this.users = [];
    this.id = randomUUID();
  }
  addUser(user: RoomUser) {
    this.users.push(user);
    user.onJoinedRoom(this);
  }
  removeUser(id: number) {
    const user = this.users.find((user: RoomUser) => user.id == id);

    user?.onDisconnectedRoom();

    this.users = this.users.filter((user: RoomUser) => user.id !== id);
  }
}

class RoomHandler {
  static rooms: Map<string, Room> = new Map();

  static getRoomById(id: string) {
    if (RoomHandler.rooms.has(id)) {
      throw new Error("Room not found");
    }
    return RoomHandler.rooms.get(id);
  }
  static addRoom(room: Room, users?: User[]) {
    RoomHandler.rooms.set(room.id, room);

    users?.forEach((user) => {
      room.addUser(new RoomUser(user));
    });
  }
}
