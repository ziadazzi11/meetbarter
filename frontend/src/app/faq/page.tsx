"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What are Value Points (VP)?</AccordionTrigger>
                    <AccordionContent>
                        Value Points (VP) are the currency of MeetBarter. You earn them by offering goods or services and spend them to get what you need. 1 VP is roughly equivalent to $1 USD in value, but they cannot be cashed out.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Is MeetBarter free to use?</AccordionTrigger>
                    <AccordionContent>
                        Yes, signing up and listing items is free. We may charge a small transaction fee in VP for completed trades to support the platform.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>How do I verify my account?</AccordionTrigger>
                    <AccordionContent>
                        You can verify your account in your Profile settings. We offer phone verification and ID verification to increase your Trust Score.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Can I trade outside of my local area?</AccordionTrigger>
                    <AccordionContent>
                        Yes! While we encourage local community building, digital services and shippable goods can be traded globally.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
