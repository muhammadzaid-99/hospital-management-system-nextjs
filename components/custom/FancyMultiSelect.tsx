"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Portal } from "@radix-ui/react-portal"; 

export type MultiSelectItem = Record<"value" | "label", string>;

// const FRAMEWORKS = [
//     {
//         value: "next.js",
//         label: "Next.js",
//     },
//     {
//         value: "sveltekit",
//         label: "SvelteKit",
//     },
//     {
//         value: "nuxt.js",
//         label: "Nuxt.js",
//     },
//     {
//         value: "remix",
//         label: "Remix",
//     },
//     {
//         value: "astro",
//         label: "Astro",
//     },
//     {
//         value: "wordpress",
//         label: "WordPress",
//     },
//     {
//         value: "express.js",
//         label: "Express.js",
//     },
//     {
//         value: "nest.js",
//         label: "Nest.js",
//     },
// ] satisfies MultiSelectItem[];

interface FancyMultiSelectProps {
    selected: MultiSelectItem[]; // Array of selected items
    setSelected: React.Dispatch<React.SetStateAction<MultiSelectItem[]>>; // Function to update selected items
    itemsList: MultiSelectItem[]; // List of available items
    setSelectablesLength: React.Dispatch<React.SetStateAction<number>>; // Whether the search returned no results
    inputValue: string; // Input text for filtering items
    setInputValue: (text: string) => void; // Function to update the input text
    placeholder: string;
}

export function FancyMultiSelect({ selected, setSelected, itemsList, setSelectablesLength, inputValue, setInputValue, placeholder }: FancyMultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    // const [selected, setSelected] = React.useState<MultiSelectItem[]>([FRAMEWORKS[1]]);
    // const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = React.useCallback((item: MultiSelectItem) => {
        setSelected((prev) => prev.filter((s) => s.value !== item.value));
    }, []);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "") {
                        setSelected((prev) => {
                            const newSelected = [...prev];
                            newSelected.pop();
                            return newSelected;
                        });
                    }
                }
                // This is not a default behaviour of the <input /> field
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        []
    );

    const selectables = itemsList.filter(
        (item) => !selected.includes(item)
    );

    // console.log(selectables, selected, inputValue);

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div className="group rounded-md border border-input px-3 py-2 text-sm">
                <div className="flex flex-wrap gap-1">
                    {selected.map((item) => {
                        return (
                            <Badge key={item.value} variant="secondary">
                                {item.label}
                                <button
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(item);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(item)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    {/* Avoid having the "Search" Icon */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                <Portal>
                    <CommandList>
                        {open && selectables.length > 0 ? (
                            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                <CommandGroup className="max-h-40 overflow-y-scroll">
                                    {selectables.map((item) => {
                                        return (
                                            <CommandItem
                                                key={item.value}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onSelect={(value) => {
                                                    setInputValue("");
                                                    setSelected((prev) => [...prev, item]);
                                                    setSelectablesLength(selectables.length)
                                                }}
                                                className={"cursor-pointer"}
                                            >
                                                {item.label}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </div>
                        ) : null}
                    </CommandList>
                </Portal>
            </div>
        </Command>
    );
}