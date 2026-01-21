import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    async sendMessage(data: { senderId: string; receiverId: string; tradeId?: string; listingId: string; content?: string; templateKey?: string }) {
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

        return this.prisma.message.create({
            data: {
                senderId: data.senderId,
                receiverId: data.receiverId,
                listingId: data.listingId,
                tradeId: data.tradeId,
                content: finalContent,
                templateKey: data.templateKey || "CUSTOM"
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
}
