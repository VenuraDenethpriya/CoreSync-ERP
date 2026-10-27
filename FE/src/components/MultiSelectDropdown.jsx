import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";

const MultiSelectDropdown = ({ options, value = [], onChange, isLoading, error, placeholder = "Select assignees..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const removeOption = (e, optionValue) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex min-h-[40px] w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex flex-wrap gap-1.5">
                    {value.length === 0 && (
                        <span className="text-gray-500 py-0.5">{placeholder}</span>
                    )}
                    {value.map((val) => {
                        const option = options.find((o) => o.value === val);
                        return (
                            <span 
                                key={val} 
                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium"
                            >
                                {option?.label || val}
                                <button
                                    type="button"
                                    onClick={(e) => removeOption(e, val)}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95">
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="px-3 py-2 text-sm text-red-600 text-center">{error}</div>
                    ) : options.length > 0 ? (
                        options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => toggleOption(option.value)}
                                    className={`relative flex items-center justify-between cursor-pointer select-none py-2 px-3 text-sm transition-colors hover:bg-gray-100 ${
                                        isSelected ? "bg-blue-50/50 text-blue-900 font-medium" : "text-gray-700"
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No assignees found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;