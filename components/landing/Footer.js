"use client";

import React from "react";
import { 
  Mail, 
  Phone, 
  MapPin
} from "lucide-react";
import { landingPageData } from "@/data/mock/landing";
import { useToast } from "@/context/ToastContext";

export default function Footer() {
  const { footer } = landingPageData;
  if (!footer) return null;

  const { logo, description, contact, quickLinks, connect, bottom } = footer;

  const { showToast } = useToast();

  const handleLinkClick = (e, href) => {
    if (href && href.includes("followproperty.org")) {
      e.preventDefault();
      showToast("Redirecting to our parent site...", "info", "Redirecting");
      setTimeout(() => {
        window.location.href = href;
      }, 1200);
    }
  };

  // Helper to render inline robust SVGs for social media icons
  const getSocialIcon = (platform) => {
    switch (platform) {
      case "instagram":
        return (
          <svg 
            viewBox="0 0 24 24" 
            className="w-[16px] h-[16px] stroke-current fill-none" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case "facebook":
        return (
          <svg 
            viewBox="0 0 24 24" 
            className="w-[16px] h-[16px] stroke-current fill-none" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        );
      case "linkedin":
        return (
          <svg 
            viewBox="0 0 24 24" 
            className="w-[16px] h-[16px] stroke-current fill-none" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        );
      case "youtube":
        return (
          <svg 
            viewBox="0 0 24 24" 
            className="w-[16px] h-[16px] stroke-current fill-none" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        );
      case "x":
        return (
          <svg 
            viewBox="0 0 24 24" 
            className="w-[13px] h-[13px] fill-current"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="bg-brand-bg-alt border-t border-brand-border py-12 md:py-16 w-full">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-brand-border">
          
          {/* Logo & Company Info Column */}
          <div className="col-span-12 lg:col-span-5 flex flex-col items-start">
            {/* Brand Logo consistent with Site Nav */}
            <div className="flex items-center gap-2 mb-5">
              <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
              <span className="font-bold text-[17px] text-brand-navy tracking-[-0.025em]">
                {logo}
              </span>
              <span className="text-[10px] text-brand-slate-light tracking-[0.14em] uppercase ml-1">
                Real Assets
              </span>
            </div>

            {/* Description */}
            <p className="text-[14px] text-brand-slate leading-relaxed mb-6 max-w-sm">
              {description}
            </p>

            {/* Contact Details */}
            <div className="flex flex-col items-start gap-3.5 w-full max-w-sm">
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`} 
                  className="group flex items-center gap-3 text-[13px] text-brand-slate hover:text-brand-navy transition-colors duration-200"
                >
                  <Mail size={15} className="text-brand-slate-light group-hover:text-brand-blue transition-colors duration-200 flex-shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`} 
                  className="group flex items-center gap-3 text-[13px] text-brand-slate hover:text-brand-navy transition-colors duration-200"
                >
                  <Phone size={15} className="text-brand-slate-light group-hover:text-brand-blue transition-colors duration-200 flex-shrink-0" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.address && (
                <div className="group flex items-start gap-3 text-[13px] text-brand-slate leading-relaxed">
                  <MapPin size={15} className="text-brand-slate-light mt-0.5 flex-shrink-0" />
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 flex flex-col items-start">
            <h3 className="font-bold text-[11px] text-brand-navy tracking-[0.1em] uppercase mb-6">
              {quickLinks.title}
            </h3>
            
            {/* Dynamic Grid Layout to keep links in exact mockup columns */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:gap-x-16 w-full">
              {quickLinks.columns.map((column, colIdx) => (
                <ul key={colIdx} className="flex flex-col gap-3.5 list-none p-0 m-0">
                  {column.map((link) => (
                    <li key={link.label}>
                      <a 
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="text-[13.5px] text-brand-slate hover:text-brand-navy hover:translate-x-[2px] transition-all duration-200 inline-block no-underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Connect With Us Column */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col items-start">
            <h3 className="font-bold text-[11px] text-brand-navy tracking-[0.1em] uppercase mb-6">
              {connect.title}
            </h3>
            
            <p className="text-[13.5px] text-brand-slate leading-relaxed mb-6">
              {connect.description}
            </p>

            {/* Social Buttons */}
            <div className="flex items-center gap-3.5">
              {connect.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={`Follow us on ${social.name}`}
                  className="w-9 h-9 rounded-full border border-brand-border-mid flex items-center justify-center bg-white text-brand-slate hover:text-brand-blue hover:border-brand-blue hover:-translate-y-0.5 hover:shadow-brand transition-all duration-[0.25s] cursor-pointer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[12.5px] text-brand-slate-light font-medium">
          {/* Copyright */}
          <p className="m-0 text-center sm:text-left">
            {bottom.copyright}
          </p>

          {/* Bottom Legal Links */}
          <div className="flex items-center gap-y-2 gap-x-4 sm:gap-6 flex-wrap justify-center">
            {bottom.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="hover:text-brand-navy transition-colors duration-200 no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
