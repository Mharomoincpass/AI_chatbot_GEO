import clientPromise from './mongo';
import { Collection, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  _id?: ObjectId;
  id: string;
  isGuest: boolean;
  createdAt: Date;
}

export interface Chat {
  _id?: ObjectId;
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
}

export interface Message {
  _id?: ObjectId;
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'ui';
  content: string;
  createdAt: Date;
}

const client = await clientPromise;
const db = client.db(process.env.MONGODB_DB_NAME || "ai-chatbot");

// Collections
const users: Collection<User> = db.collection('users');
const chats: Collection<Chat> = db.collection('chats');
const messages: Collection<Message> = db.collection('messages');
const streams: Collection<any> = db.collection('streams');

// Queries
export async function getUser(userId: string): Promise<User | null> {
  return users.findOne({ id: userId });
}

export async function getOrCreateUser(userId: string): Promise<User> {
  const user = await users.findOne({ id: userId });
  if (user) {
    return user;
  }
  const newUser: User = {
    id: userId,
    isGuest: false,
    createdAt: new Date(),
  };
  await users.insertOne(newUser);
  return newUser;
}

export async function createGuestUser(): Promise<User> {
  const newUser: User = {
    id: `guest_${uuidv4()}`,
    isGuest: true,
    createdAt: new Date(),
  };
  await users.insertOne(newUser);
  return newUser;
}

export async function saveChat(chat: Omit<Chat, '_id' | 'createdAt'>) {
  const chatToSave = {
    ...chat,
    createdAt: new Date(),
  };
  const result = await chats.insertOne(chatToSave as any);
  return { ...chatToSave, _id: result.insertedId };
}

export async function getChatById(chatId: string) {
  const chat = await chats.findOne({ id: chatId });
  if (!chat) return null;
  const chatMessages = await messages.find({ chatId }).sort({ createdAt: 1 }).toArray();
  return { ...chat, messages: chatMessages };
}

export async function saveMessages(newMessages: Omit<Message, 'id' | '_id' | 'createdAt'>[]) {
  const messagesToInsert = newMessages.map(m => ({
    ...m,
    id: uuidv4(),
    createdAt: new Date(),
  }));
  if (messagesToInsert.length > 0) {
    await messages.insertMany(messagesToInsert as any[]);
  }
}

export async function getChats(userId: string) {
  return chats.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function updateChatTitle(chatId: string, title: string) {
  return chats.updateOne({ id: chatId }, { $set: { title } });
}

export async function deleteChat(chatId: string) {
  await chats.deleteOne({ id: chatId });
  await messages.deleteMany({ chatId });
}

export async function saveStream(id: string, data: any) {
  return streams.insertOne({ id, ...data, createdAt: new Date() });
}
