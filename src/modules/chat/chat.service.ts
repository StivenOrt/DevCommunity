import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendsService } from '../friends/friends.service';
import { ChatEntity } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    private readonly friendsService: FriendsService,
    private readonly userService: UsersService
  ) {}


  async getAll() {

    return this.chatRepository.find({
      relations: { sender: true, receiver: true }
    })
  }

  findOneBy = {
    uuid: async(uuid: string) => {

      const chat = await this.chatRepository.findOne({
        where: { uuid }
      })

      if (!chat) throw new NotFoundException('No existe ese chat')
        return chat
    }
  }


  async create(createChatDto: CreateChatDto) {

    console.log(createChatDto)

    const chat = await this.chatRepository.findOne({
      where: [
        {
          sender: { uuid: createChatDto.senderUuid },
          receiver: { uuid: createChatDto.receiverUuid },
        },
        {
          sender: { uuid: createChatDto.receiverUuid },
          receiver: { uuid: createChatDto.senderUuid },
        }

      ],
      relations: { sender: true , receiver: true }
    })

    if (chat) throw new ConflictException('Ya existe este chat')

    const newData: Partial<ChatEntity> = {}

    newData.sender = await this.userService.findOneBy.uuid(createChatDto.senderUuid)
    newData.receiver = await this.userService.findOneBy.uuid(createChatDto.receiverUuid)


    const newChat = this.chatRepository.create(newData)

    return await this.chatRepository.save(newChat)
  }

  messages = {

    getAll: async(chatUuid: string) => {

      const chat = await this.chatRepository.findOne({
        where: { uuid: chatUuid },
        relations: { messages: true }
      })
      if (!chat) throw new NotFoundException('No existe ese chat')
        return chat
    },

    create: async(createMessageDto: CreateMessageDto) => {

      const { chatUuid, senderUuid, ...newData } = createMessageDto;

      const newMessageData: Partial<MessageEntity> = { ...newData }
      const sender = await this.userService.findOneBy.uuid(createMessageDto.senderUuid)
      const chat = await this.findOneBy.uuid(createMessageDto.chatUuid)

      if (chat.sender.id !== sender.id && chat.receiver.id !== sender.id) throw new NotFoundException('No existe este chat')

      newMessageData.sender = sender;
      newMessageData.chat = chat
      
      const newMessage = this.messageRepository.create(newMessageData)

      return await this.messageRepository.save(newMessage)
    }
  }


}
