"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '🌍 **Welcome to Ecolens Conservation Assistant**\n\nI provide actionable insights, policy guidance, and authority recommendations for wildlife conservation in the Sundarbans ecosystem.\n\nI can help with:\n- 🚨 Emergency response & high-risk zones\n- 🐅 Wildlife population status & trends\n- 📋 Policy guidance & regulations\n- 🏛️ Responsible authorities\n- 🎯 Conservation action plans\n\nWhat would you like to know?',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
        'What are the high-risk zones?',
        'Status of Bengal Tigers?',
        'How can I help?',
        'Recent poaching alerts?'
    ])

    useEffect(() => {
        // Scroll to bottom when messages change
        const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages])

    const handleSend = async (overrideInput?: string) => {
        const messageText = overrideInput || input
        if (!messageText.trim() || isLoading) return

        const userMessage: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        }

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setIsLoading(true)
        setIsTyping(true)

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages
                })
            })

            const data = await response.json()

            // Extract suggestions from response
            let cleanContent = data.message
            const suggestionsMatch = data.message.match(/\[SUGGESTIONS: (.*?)\]/)

            if (suggestionsMatch) {
                const suggestions = suggestionsMatch[1].split(',').map((s: string) => s.trim())
                setSuggestedQuestions(suggestions)
                cleanContent = data.message.replace(/\[SUGGESTIONS: .*?\]/, '').trim()
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: cleanContent,
                timestamp: new Date(data.timestamp)
            }

            setMessages(prev => [...prev, assistantMessage])

            // Force a scroll to bottom after state update
            setTimeout(() => {
                const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                    scrollContainer.scrollTo({
                        top: scrollContainer.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100)
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
            setIsTyping(false)
        }
    }



    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="lg"
                            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden group"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
                                animate={{
                                    rotate: [0, 360]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                            <MessageCircle className="h-8 w-8 relative z-10" />
                            <motion.div
                                className="absolute top-0 right-0 h-3 w-3 bg-green-400 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0.7, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 w-[420px] h-[650px] z-50 flex flex-col"
                    >
                        <div className="glassmorphism rounded-2xl shadow-2xl border border-primary/20 flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-4 flex items-center justify-between border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                        <motion.div
                                            className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full"
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: [1, 0.5, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Ecolens Chatbot</h3>
                                        <p className="text-xs text-muted-foreground">Conservation Assistant</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-destructive/20 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full p-4">
                                    <div className="space-y-4 pr-4">
                                        {messages.map((message, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'glassmorphism border border-border'
                                                        }`}
                                                >
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown
                                                            components={{
                                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                                                ul: ({ children }) => <ul className="space-y-1 ml-4">{children}</ul>,
                                                                li: ({ children }) => <li className="text-sm">{children}</li>
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                    <p className="text-xs opacity-60 mt-2">
                                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {(isLoading || isTyping) && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex justify-start"
                                            >
                                                <div className="glassmorphism border border-border rounded-2xl px-6 py-4 flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <motion.div
                                                            animate={{ y: [0, -5, 0] }}
                                                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                                            className="h-1.5 w-1.5 rounded-full bg-primary"
                                                        />
                                                        <motion.div
                                                            animate={{ y: [0, -5, 0] }}
                                                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                                            className="h-1.5 w-1.5 rounded-full bg-primary"
                                                        />
                                                        <motion.div
                                                            animate={{ y: [0, -5, 0] }}
                                                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                                            className="h-1.5 w-1.5 rounded-full bg-primary"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Assistant is thinking</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Dynamic Suggestions */}
                            {!isLoading && (
                                <div className="px-4 pb-4 overflow-x-auto">
                                    <div className="flex gap-2 min-w-max">
                                        {suggestedQuestions.map((q, idx) => (
                                            <motion.button
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => handleSend(q)}
                                                className="px-3 py-1.5 rounded-full glassmorphism border border-primary/20 hover:border-primary/50 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-primary/5"
                                            >
                                                {q}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-4 border-t border-border bg-background/50">
                                <div className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your conservation query..."
                                        className="flex-1 bg-background/50 border-border focus-visible:ring-primary shadow-inner"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        size="icon"
                                        className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50 transition-all"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
