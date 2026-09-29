import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage, languages, currentLanguageConfig } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-wrap" ref={containerRef} data-testid="language-selector-wrap">
      <button
        type="button"
        className={`language-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        data-testid="language-toggle-btn"
        title="Select language (English, हिंदी, ಕನ್ನಡ)"
      >
        <Languages size={15} strokeWidth={2.2} className="language-icon" />
        <span className="language-current-label">
          {currentLanguageConfig.nativeName}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2.2}
          className={`language-chevron ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu"
          role="listbox"
          aria-label="Choose language"
          data-testid="language-dropdown-menu"
        >
          <div className="language-dropdown-header">
            <span>Select language</span>
          </div>
          <div className="language-options-list">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`language-option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(lang.code)}
                  data-testid={`language-option-${lang.code}`}
                >
                  <div className="language-option-content">
                    <span className="language-badge">{lang.short}</span>
                    <div className="language-names">
                      <strong className="language-native-name">{lang.nativeName}</strong>
                      <span className="language-english-name">{lang.label}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={16} strokeWidth={2.5} className="language-check-icon" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
