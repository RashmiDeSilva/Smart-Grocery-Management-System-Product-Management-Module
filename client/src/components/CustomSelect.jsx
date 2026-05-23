import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CustomSelect = ({
  name,
  value,
  onChange,
  placeholder,
  options,
  disabled,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: optionValue
        }
      });
    }
    setIsOpen(false);
  };

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        userSelect: "none"
      }}
    >
      {/* Trigger Button */}
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={handleToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "3rem",
          padding: "0 1.25rem",
          borderRadius: "1.25rem",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
          backgroundColor: disabled ? "#F8FAFC" : "#ffffff",
          border: isOpen ? "1.5px solid #007A5E" : "1.5px solid rgba(15, 23, 42, 0.08)",
          color: disabled ? "rgba(15, 23, 42, 0.3)" : "#0F172A"
        }}
      >
        <span className="custom-select-label" style={{ fontWeight: 700, fontSize: "0.85rem" }}>
          {displayLabel}
        </span>
        <span className="custom-select-arrow" style={{ display: "flex", alignItems: "center" }}>
          {isOpen ? (
            <ChevronUp size={16} className="text-[#0F172A]" />
          ) : (
            <ChevronDown size={16} className="text-[#0F172A]" />
          )}
        </span>
      </div>

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className="custom-select-options"
          style={{
            position: "absolute",
            top: "calc(100% + 0.35rem)",
            left: 0,
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "1.25rem",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            padding: "0.5rem",
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 9999,
            boxSizing: "border-box"
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={i}
                className={`custom-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "0.85rem",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  color: isSelected ? "#007A5E" : "#1E293B",
                  backgroundColor: isSelected ? "#E6F2EC" : "transparent"
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
