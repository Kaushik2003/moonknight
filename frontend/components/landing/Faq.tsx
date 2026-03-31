"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

type FAQItem = {
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    {
        question: "Do I need to install Rust or the Midnight CLI?",
        answer:
            "No. MoonKnight is a complete zero-setup environment that handles Rust, Midnight SDK, and all dependencies in the cloud.",
    },
    {
        question: "How does MoonKnight handle private transactions?",
        answer:
            "MoonKnight leverages Midnight's ZK-powered privacy layer to automatically generate shielded and unshielded contract variants, ensuring your transactions remain confidential when needed.",
    },
    {
        question: "Is my code secure and private?",
        answer:
            "Yes. Every project runs in its own isolated Docker sandbox with full privacy controls. MoonKnight supports shielded wallets and ZK proofs, so your contracts can maintain privacy on-chain.",
    },
    {
        question: "Can I deploy to Midnight Preprod or Mainnet directly?",
        answer:
            "Absolutely. MoonKnight integrates with Lace wallet and generates all necessary Midnight contract bindings. Deploy to Preprod for testing, then move to Mainnet with confidence.",
    },
];

const FAQRow = ({
    item,
    isOpen,
    onClick,
}: {
    item: FAQItem;
    isOpen: boolean;
    onClick: () => void;
}) => {
    return (
        <div className="border-t border-white/20 last:border-b">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-10 text-left group hover:bg-white/5 transition-colors px-2"
            >
                <span className="text-white text-xl md:text-2xl font-bold tracking-tight transition-colors">
                    {item.question}
                </span>

                {/* Icon */}
                <span className="text-white transition-transform duration-300">
                    {isOpen ? <X size={28} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={2.5} />}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-white/75 text-lg md:text-xl leading-relaxed max-w-3xl pb-10 px-2 font-medium">
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="text-white px-6 py-40 border-t border-white/10 bg-[radial-gradient(120%_120%_at_50%_0%,#2e1642_0%,#151022_40%,#09070f_100%)]">
            <div className="max-w-[90rem] mx-auto">
                {/* Title */}
                <h2 className="text-6xl md:text-7xl font-bold mb-24 tracking-tighter text-white uppercase text-center">
                    FAQ
                </h2>

                {/* List */}
                <div className="flex flex-col">
                    {faqs.map((item, i) => (
                        <FAQRow
                            key={i}
                            item={item}
                            isOpen={openIndex === i}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}