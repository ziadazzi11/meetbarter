import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) { }

    private readonly templates: Record<string, string> = {
        AVAILABILITY: "Is this item still available for trade?",
        CONDITION: "Can you confirm the condition matches the description?",
        PICKUP_COORD: "I am interested. Can we coordinate a pickup via the platform?",
        DETAIL_REQUEST: "Could you provide more specific details about the item's history?",
        REQUEST_BETTER_PHOTOS: "The photos are not clear. Could you please upload better quality pictures?",
    };

    async sendMessage(data: CreateMessageDto) {
        let finalContent = "";

        // 1. Template Logic (User demanded specific prompts)
        if (data.templateKey) {
            if (!this.templates[data.templateKey]) throw new BadRequestException('Invalid message template.');
            finalContent = this.templates[data.templateKey];
        } else {
            // 2. Custom Content with SAFETY FILTER
            finalContent = data.content || "";

            // Redact contacts to prevent off-platform fraud
            const phoneRegex = /(\d{2}[- ]?\d{6}|\d{8}|\+961[- ]?\d{2}[- ]?\d{6})/g;
            const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;

            if (phoneRegex.test(finalContent) || emailRegex.test(finalContent)) {
                finalContent = finalContent.replace(phoneRegex, "[HIDDEN PHONE]").replace(emailRegex, "[HIDDEN EMAIL]");
                finalContent += " \n\n[SYSTEM WARNING: Contact details hidden for safety until trade confirmation.]";
            }
        }

        // 3. Resolve Conversation (Auto-Create if missing)
        let conversationId = "";

        if (data.tradeId) {
            const existing = await this.prisma.conversation.findFirst({
                where: { tradeId: data.tradeId }
            });
            if (existing) {
                conversationId = existing.id;
            } else {
                const newConv = await this.prisma.conversation.create({
                    data: {
                        tradeId: data.tradeId,
                        participants: { connect: [{ id: data.senderId }, { id: data.receiverId }] }
                    }
                });
                conversationId = newConv.id;
            }
        } else {
            // Fallback for Listing Inquiry (No Trade Yet) - simplified for MVP
            // Find conversation between these 2 users? 
            // For now, let's create a stand-alone conversation if distinct
            const newConv = await this.prisma.conversation.create({
                data: {
                    participants: { connect: [{ id: data.senderId }, { id: data.receiverId }] }
                }
            });
            conversationId = newConv.id;
        }

        return this.prisma.message.create({
            data: {
                content: finalContent,
                sender: { connect: { id: data.senderId } },
                receiver: { connect: { id: data.receiverId } },
                conversation: { connect: { id: conversationId } },
                listing: data.listingId ? { connect: { id: data.listingId } } : undefined,
                trade: data.tradeId ? { connect: { id: data.tradeId } } : undefined
            }
        });
    }

    async getMessagesForTrade(tradeId: string) {
        return this.prisma.message.findMany({
            where: { tradeId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, fullName: true, email: true } }
            }
        });
    }
    async findOrCreateConversation(userId1: string, userId2: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                AND: [
                    { participants: { some: { id: userId1 } } },
                    { participants: { some: { id: userId2 } } },
                ]
            }
        });

        if (conversations.length > 0) return conversations[0];

        return this.prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: userId1 }, { id: userId2 }]
                }
            }
        });
    }
}
