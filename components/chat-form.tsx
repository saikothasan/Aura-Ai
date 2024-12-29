'use client'

import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { ArrowUpIcon, Loader2, Send, Trash, Sparkles, Copy, Check, Mic, MicOff, Share, Download, RotateCcw, LogIn, LogOut, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AutoResizeTextarea } from '@/components/autoresize-textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'

export function ChatForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { messages, input, setInput, handleSubmit, isLoading, error, reload, stop } = useChat({
    api: '/api/chat',
    id: conversationId || undefined,
    onFinish: (message) => {
      if (user) {
        saveMessageToSupabase(message)
      }
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchOrCreateConversation(session.user.id)
      } else {
        setConversationId(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchOrCreateConversation = async (userId: string) => {
    let { data: conversation, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !conversation) {
      const newConversationId = uuidv4()
      await supabase.from('conversations').insert({ id: newConversationId, user_id: userId })
      setConversationId(newConversationId)
    } else {
      setConversationId(conversation.id)
    }
  }

  const saveMessageToSupabase = async (message: any) => {
    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
      };

      setRecognition(recognition);
    }
  }, [setInput]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const shareConversation = async () => {
    if (user && conversationId) {
      const { data, error } = await supabase
        .from('conversations')
        .update({ is_public: true })
        .eq('id', conversationId)
        .select()

      if (error) {
        toast.error('Failed to share conversation')
      } else {
        const shareUrl = `${window.location.origin}/conversation/${conversationId}`
        navigator.clipboard.writeText(shareUrl)
        toast.success('Conversation shared! URL copied to clipboard')
      }
    } else {
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      navigator.clipboard.writeText(conversationText);
      toast.success('Conversation copied to clipboard!');
    }
  }

  const downloadConversation = () => {
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aura-ai-conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversation downloaded!');
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
  }

  const saveConversation = async () => {
    if (user && !conversationId) {
      const newConversationId = uuidv4()
      await supabase.from('conversations').insert({ id: newConversationId, user_id: user.id })
      setConversationId(newConversationId)
      
      for (const message of messages) {
        await supabase.from('messages').insert({
          conversation_id: newConversationId,
          role: message.role,
          content: message.content,
        })
      }
      
      toast.success('Conversation saved successfully')
    } else if (!user) {
      toast.error('Please log in to save conversations')
    } else {
      toast.info('Conversation is already being saved')
    }
  }

  return (
    <div className={cn('flex h-full flex-col', className)} {...props}>
      <ScrollArea className="flex-1 p-2 sm:p-4 md:p-6" ref={scrollAreaRef}>
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'mb-4 flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'flex max-w-[90%] sm:max-w-[85%] md:max-w-[75%] flex-col rounded-lg px-3 py-2 text-sm shadow-md',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {message.role === 'user' ? 'U' : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-xs sm:text-sm">
                      {message.role === 'user' ? 'You' : 'Aura'}
                    </span>
                  </div>
                  <ReactMarkdown
                    className="mt-1 leading-relaxed break-words text-xs sm:text-sm"
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="relative">
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={theme === 'dark' ? atomDark : vs}
                              language={match[1]}
                              PreTag="div"
                              className="text-xs sm:text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(String(children), index)}
                              className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center">
                <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Welcome to Aura AI</h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Your creative AI companion. Start a conversation below!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
      <div className="border-t p-2 sm:p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <AutoResizeTextarea
            value={input}
            onChange={(value) => setInput(value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aura anything..."
            className="flex-1 resize-none rounded-md border p-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full"
                onClick={toggleListening}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isListening ? 'Stop voice input' : 'Start voice input'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Send message</TooltipContent>
          </Tooltip>
        </form>
        {error && (
          <div className="mt-2 text-xs sm:text-sm text-red-500">
            Error: {error.message}
            <Button
              variant="link"
              size="sm"
              onClick={() => reload()}
              className="ml-2 text-purple-500"
            >
              Try again
            </Button>
          </div>
        )}
        <div className="flex flex-wrap justify-between mt-2 gap-2">
          {isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => stop()}
              className="text-purple-500 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900 text-xs sm:text-sm"
            >
              Stop generating
            </Button>
          )}
          {messages.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('')
                  reload()
                }}
                className="text-pink-500 border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900 text-xs sm:text-sm"
              >
                <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Clear chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareConversation}
                className="text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-xs sm:text-sm"
              >
                <Share className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadConversation}
                className="text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-xs sm:text-sm"
              >
                <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                className="text-yellow-500 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 text-xs sm:text-sm"
              >
                <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveConversation}
                className="text-indigo-500 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-xs sm:text-sm"
              >
                <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Save
              </Button>
            </>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          {user ? (
            <div className="flex items-center space-x-2">
              <Link href="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-purple-500 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900 text-xs sm:text-sm"
                >
                  <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900 text-xs sm:text-sm"
              >
                <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-xs sm:text-sm"
              >
                <LogIn className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

