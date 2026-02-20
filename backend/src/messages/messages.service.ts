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

        const message = await this.prisma.message.create({
            data: {
                content: finalContent,
                sender: { connect: { id: data.senderId } },
                receiver: { connect: { id: data.receiverId } },
                conversation: { connect: { id: conversationId } },
                listing: data.listingId ? { connect: { id: data.listingId } } : undefined,
                trade: data.tradeId ? { connect: { id: data.tradeId } } : undefined
            },
            include: {
                sender: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                trade: { select: { status: true } }
            }
        });

        return this.maskMessage(message);
    }

    async getMessagesForTrade(tradeId: string) {
        const messages = await this.prisma.message.findMany({
            where: { tradeId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                trade: { select: { status: true } }
            }
        });

        // 🛡️ Anonymity Protocol (Layer III)
        // Hide identities until trade is LOCKED, CONFIRMED, or COMPLETED.
        return messages.map(msg => this.maskMessage(msg));
    }
    async getConversations(userId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } }
            },
            include: {
                participants: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                trade: { select: { status: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // 🛡️ Anonymity Protocol (Layer III) - Mask Participants
        return conversations.map(conv => {
            const isAnonymous = ['OFFER_MADE', 'AWAITING_FEE', 'DISPUTED'].includes(conv.trade?.status || 'OFFER_MADE');

            if (isAnonymous) {
                return {
                    ...conv,
                    participants: conv.participants.map(p => {
                        if (p.id === userId) return p; // Don't mask self
                        return {
                            ...p,
                            fullName: `Trader ${p.id.substring(0, 5)}...`,
                            email: null,
                            avatarUrl: null
                        };
                    })
                };
            }
            return conv;
        });
    }
    // 🛡️ Anonymity Protocol (Layer III)
    private maskMessage(msg: any) {
        const isAnonymous = ['OFFER_MADE', 'AWAITING_FEE', 'DISPUTED'].includes(msg.trade?.status || 'OFFER_MADE');

        if (isAnonymous && msg.sender) {
            return {
                ...msg,
                sender: {
                    ...msg.sender,
                    fullName: `Trader ${msg.sender.id.substring(0, 5)}...`, // Masked Name
                    email: null, // Hidden
                    avatarUrl: null // Hidden
                }
            };
        }
        return msg;
    }
    async findOrCreateConversation(userId1: string, userId2: string) {
        // Check for existing conversation
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId1 } } },
                    { participants: { some: { id: userId2 } } }
                ]
            }
        });

        if (existing) return existing;

        // Create new
        return this.prisma.conversation.create({
            data: {
                participants: { connect: [{ id: userId1 }, { id: userId2 }] }
            }
        });
    }
}


