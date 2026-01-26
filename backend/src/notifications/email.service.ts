import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Safe Initialization: Check for SMTP config
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.warn('⚠️ SMTP Configuration Missing. EmailService running in LOG_ONLY mode.');
            this.transporter = {
                sendMail: async (options) => {
                    console.log(`[LOG_ONLY_EMAIL] To: ${options.to}, Subject: ${options.subject}`);
                    return { messageId: 'LOGGED_ONLY' };
                }
            } as any;
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Send trade offer notification to seller
     */
    async sendTradeOfferNotification(
        sellerEmail: string,
        sellerName: string,
        listingTitle: string,
        offerVP: number,
        buyerName: string,
    ) {
        const subject = `New Trade Offer for "${listingTitle}"`;
        const html = `
      <h2>You have a new trade offer!</h2>
      <p>Hi ${sellerName},</p>
      <p><strong>${buyerName}</strong> has made an offer for your listing: <strong>${listingTitle}</strong></p>
      <p><strong>Offer:</strong> ${offerVP} Value Points</p>
      <p>Log in to your Dekish dashboard to review and respond to this offer.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This is an automated notification from Meetbarter.</p>
    `;

        return this.sendEmail(sellerEmail, subject, html);
    }

    /**
     * Send trade accepted notification to buyer
     */
    async sendTradeAcceptedNotification(
        buyerEmail: string,
        buyerName: string,
        listingTitle: string,
        sellerName: string,
    ) {
        const subject = `Trade Accepted: "${listingTitle}"`;
        const html = `
      <h2>Your trade offer was accepted!</h2>
      <p>Hi ${buyerName},</p>
      <p><strong>${sellerName}</strong> has accepted your offer for: <strong>${listingTitle}</strong></p>
      <p>Next steps:</p>
      <ol>
        <li>Coordinate pickup/delivery through secure messaging</li>
        <li>Complete the item exchange</li>
        <li>Confirm the trade in your dashboard</li>
      </ol>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This is an automated notification from Meetbarter.</p>
    `;

        return this.sendEmail(buyerEmail, subject, html);
    }

    /**
     * Send moderation alert to admin
     */
    async sendModerationAlert(
        adminEmail: string,
        listingTitle: string,
        severity: string,
        category: string,
        matchedKeywords: string[],
    ) {
        const subject = `⚠️ MODERATION ALERT: ${severity} - ${category}`;
        const html = `
      <div style="background-color: #fee2e2; padding: 20px; border-left: 4px solid #dc2626;">
        <h2 style="color: #7f1d1d;">Prohibited Content Detected</h2>
        <p><strong>Listing:</strong> ${listingTitle}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Matched Keywords:</strong> ${matchedKeywords.join(', ')}</p>
        <a href="${process.env.FRONTEND_URL}/moderation" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px;">Review in Moderation Queue</a>
      </div>
    `;

        return this.sendEmail(adminEmail, subject, html);
    }

    /**
     * Send welcome email after signup
     */
    async sendWelcomeEmail(userEmail: string, userName: string) {
        const subject = 'Welcome to Meetbarter!';
        const html = `
      <h2>Welcome to Meetbarter, ${userName}!</h2>
      <p>Thank you for joining our barter community.</p>
      <p><strong>What you can do now:</strong></p>
      <ul>
        <li>Create your first listing</li>
        <li>Browse items in your area</li>
        <li>Build your trust score through successful trades</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/listings/new" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Create Your First Listing</a>
      <p style="margin-top: 20px;">Happy bartering!</p>
      <p style="color: #666; font-size: 12px;">The Meetbarter Team</p>
    `;

        return this.sendEmail(userEmail, subject, html);
    }

    /**
     * Generic email sender
     */
    private async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Meetbarter" <${process.env.SMTP_FROM || 'noreply@meetbarter.com'}>`,
                to,
                subject,
                html,
            });

            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }
}
