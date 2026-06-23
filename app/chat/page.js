"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Send, CheckCircle2, User, Sparkles, RefreshCw } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Chat stage tracking: 'initial', 'contact', 'intent', 'message', 'submitting', 'completed'
  const [chatStage, setChatStage] = useState("initial");
  const [firstMessage, setFirstMessage] = useState("");
  const [userIntent, setUserIntent] = useState(""); // buy, sell, other
  const [inputText, setInputText] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Get IST greeting helper
  const getGreeting = () => {
    const date = new Date();
    // Get current client hour
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Generate ticket number helper
  const generateTicket = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `FP-${rand}`;
  };

  // Initialize Chat
  useEffect(() => {
    const greeting = getGreeting();
    setMessages([
      {
        sender: "bot",
        text: `${greeting}! Welcome to FollowProperty. 👋`,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Step 1: Contact Form Submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    let hasErr = false;

    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError("Please enter a valid 10-digit number.");
      hasErr = true;
    } else {
      setPhoneError("");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasErr = true;
    } else {
      setEmailError("");
    }

    if (hasErr) return;

    // Log the user response in chat history
    const userMsg = {
      sender: "user",
      text: `Mobile: +91 ${phoneNumber} | Email: ${email}`,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setHasStarted(true);
    setChatStage("intent");
    setIsTyping(true);

    // Bot responds with quick reply options
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Thank you! How can I help you today? Please select one of the options below:",
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  // Handle Step 2: Intent Option Selection
  const handleIntentSelection = (selectedIntent, optionText) => {
    setUserIntent(selectedIntent);

    // User message
    const userMsg = {
      sender: "user",
      text: optionText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatStage("message");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let promptText = "";
      if (selectedIntent === "buy") {
        promptText = "Perfect! Please describe the details of the property you want to buy (e.g. Preferred Location, BHK configuration, Budget, and any other requirements).";
      } else if (selectedIntent === "sell") {
        promptText = "Got it! Please describe the property you want to sell (e.g. Location, Property Type, BHK size, Expected Price, and key amenities).";
      } else {
        promptText = "Sure, please let us know what you need or write your requirement here and I will notify our executive.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: promptText,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  // Handle Text Input Submission
  const handleMessageSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const rawReq = inputText.trim();
    setInputText("");

    // User message
    const userMsg = {
      sender: "user",
      text: rawReq,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);

    if (chatStage === "initial") {
      setFirstMessage(rawReq);
      setChatStage("contact");
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Before we proceed, please share your mobile number and email address below so we can register your inquiry:",
            timestamp: new Date()
          }
        ]);
      }, 1000);
      return;
    }

    // Otherwise, we are in the 'message' stage capturing final requirements...
    setChatStage("submitting");
    setIsTyping(true);

    const generatedTicket = generateTicket();
    setTicketNumber(generatedTicket);

    // Prepare full history for DB save
    const fullHistory = [
      ...messages,
      userMsg
    ].map((m) => ({
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp || new Date()
    }));

    // Combine initial query with additional details
    const finalMessage = firstMessage 
      ? `Initial Query: ${firstMessage}\n\nAdditional Details: ${rawReq}` 
      : rawReq;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          email,
          intent: userIntent,
          message: finalMessage,
          ticketNumber: generatedTicket,
          chatHistory: fullHistory
        })
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setTimeout(() => {
          setIsTyping(false);
          setChatStage("completed");

          if (userIntent === "other") {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `Your inquiry has been successfully registered. This is your ticket number: **${generatedTicket}**. Our executive will get in touch with you tomorrow.`,
                timestamp: new Date()
              }
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `Perfect, your property requirement details have been saved under ticket number **${generatedTicket}**. Our real estate matching engine is on it and our executive will contact you tomorrow.`,
                timestamp: new Date()
              }
            ]);
          }
        }, 1500);
      } else {
        throw new Error(json.error || "Failed to submit lead");
      }

    } catch (err) {
      console.error("Chat lead submission failed:", err);
      setIsTyping(false);
      setChatStage("message");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops, I encountered an issue saving your chat details. Please try sending again.",
          timestamp: new Date()
        }
      ]);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setPhoneNumber("");
    setEmail("");
    setPhoneError("");
    setEmailError("");
    setHasStarted(false);
    setChatStage("initial");
    setUserIntent("");
    setInputText("");
    setFirstMessage("");
    setTicketNumber("");
    setIsTyping(false);

    const greeting = getGreeting();
    setMessages([
      {
        sender: "bot",
        text: `${greeting}! Welcome to FollowProperty. 👋`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#0F1629] flex flex-col font-sans selection:bg-[#325fec] selection:text-white relative overflow-hidden">
      {/* Header */}
      <header className="w-full bg-white border-b border-brand-border py-4 px-6 z-10 sticky top-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[17px] tracking-[-0.025em] text-[#0F1629]">
              FollowProperty
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-[0.14em] uppercase ml-1 text-brand-slate-light font-semibold">
              Real Assets
            </span>
          </Link>

          <Link href="/" className="text-xs font-semibold text-brand-slate hover:text-brand-navy-deep no-underline bg-brand-bg-alt px-3.5 py-2 rounded-xl transition duration-200">
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main chat space */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:py-8 flex flex-col h-[calc(100vh-140px)] z-10">
        {/* Chat box wrapper */}
        <div className="flex-1 bg-white border border-brand-border rounded-2xl shadow-brand-md flex flex-col overflow-hidden">
          
          {/* Chat Window Head */}
          <div className="bg-[#FAFAF8] border-b border-brand-border px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue-bg border border-brand-blue-border flex items-center justify-center text-brand-blue">
              <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F1629] flex items-center gap-1.5">
                FollowProperty Assistant 
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-emerald-bg border border-brand-emerald/15 text-[10px] text-brand-emerald font-semibold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block animate-pulse-custom" />
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-brand-slate font-medium">Virtual Real Estate Guide</p>
            </div>
          </div>

          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAF8]/40">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Profile icon */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-[11px] font-bold ${
                  msg.sender === "user" 
                    ? "bg-brand-navy-deep border-brand-navy-deep text-white" 
                    : "bg-white border-brand-border text-brand-blue"
                }`}>
                  {msg.sender === "user" ? <User size={13} /> : "FP"}
                </div>

                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-[#0F1629] text-white rounded-tr-none font-medium"
                    : "bg-white text-[#0F1629] border border-brand-border rounded-tl-none font-normal"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Inline contact form (visible in timeline during contact stage) */}
            {chatStage === "contact" && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-brand-border text-[11px] font-bold bg-white text-brand-blue">
                  FP
                </div>
                <div className="bg-white border border-brand-border rounded-2xl rounded-tl-none p-5 shadow-brand-md w-full space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-slate flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                    Please share your contact info
                  </h3>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-3.5">
                    <div>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) setPhoneNumber(val);
                          if (val.length === 10) setPhoneError("");
                        }}
                        placeholder="WhatsApp/Mobile Number"
                        className="form-input text-xs font-semibold py-2.5"
                        required
                      />
                      {phoneError && <p className="text-[#DC2626] text-[10px] font-semibold mt-1">{phoneError}</p>}
                    </div>

                    <div>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="Email Address"
                        className="form-input text-xs font-semibold py-2.5"
                        required
                      />
                      {emailError && <p className="text-[#DC2626] text-[10px] font-semibold mt-1">{emailError}</p>}
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary w-full py-2.5 text-xs uppercase font-extrabold tracking-wide"
                    >
                      Continue &rarr;
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Quick replies for intent selection */}
            {chatStage === "intent" && !isTyping && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-brand-border text-[11px] font-bold bg-white text-brand-blue">
                  FP
                </div>
                <div className="flex flex-col gap-2 w-full pt-1.5">
                  <button
                    onClick={() => handleIntentSelection("buy", "I want to buy a property")}
                    className="w-full text-left bg-white hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border hover:border-brand-blue-border p-3.5 rounded-xl text-xs font-bold text-brand-navy shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    🏠 I want to buy a property
                  </button>
                  <button
                    onClick={() => handleIntentSelection("sell", "I want to sell a property")}
                    className="w-full text-left bg-white hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border hover:border-brand-blue-border p-3.5 rounded-xl text-xs font-bold text-brand-navy shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    🏢 I want to sell a property
                  </button>
                  <button
                    onClick={() => handleIntentSelection("other", "Something else / Other support")}
                    className="w-full text-left bg-white hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border hover:border-brand-blue-border p-3.5 rounded-xl text-xs font-bold text-brand-navy shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    ❓ Something else / Other support
                  </button>
                </div>
              </div>
            )}

            {/* Typing bubble placeholder */}
            {isTyping && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-brand-border text-[11px] font-bold bg-white text-brand-blue">
                  FP
                </div>
                <div className="bg-white border border-brand-border px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-brand-blue/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 bg-brand-blue/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input form (for capturing text requirements) */}
          <div className="bg-white border-t border-brand-border p-4">
            {chatStage === "message" || chatStage === "initial" ? (
              <form onSubmit={handleMessageSubmit} className="flex gap-2.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={chatStage === "initial" ? "Type your query or requirement here..." : "Type your reply here..."}
                  className="form-input py-3 text-xs"
                  required
                />
                <button
                  type="submit"
                  className="bg-brand-blue hover:bg-[#1e3bb3] text-white p-3 rounded-xl shadow-brand-blue/20 shadow-md flex items-center justify-center transition cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : chatStage === "completed" ? (
              <div className="text-center py-2 flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-semibold text-brand-emerald flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ticket #{ticketNumber} has been locked.
                </p>
                <button
                  onClick={resetChat}
                  className="btn-secondary py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm rounded-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start New Chat
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-brand-slate-light font-medium py-3">
                Conversation will open once setup is complete.
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
