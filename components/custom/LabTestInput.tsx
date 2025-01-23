import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const LabTestCombobox = () => {
  const labTests = [
    { value: "blood-test", label: "Blood Test" },
    { value: "x-ray", label: "X-Ray" },
    { value: "mri", label: "MRI" },
    { value: "ct-scan", label: "CT Scan" },
    { value: "urine-test", label: "Urine Test" },
    { value: "ecg", label: "ECG" },
    { value: "lipid-profile", label: "Lipid Profile" },
  ];

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const addTest = (test: string) => {
    if (!selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test]);
    }
    setInputValue(""); // Clear the input
    setOpen(false); // Close the popover
  };

  const removeTest = (test: string) => {
    setSelectedTests(selectedTests.filter((t) => t !== test));
  };

  return (
    <div className="space-y-4">
      {/* Popover with Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim() !== "") {
                  e.preventDefault();
                  addTest(inputValue.trim());
                }
              }}
              placeholder="Enter lab tests..."
              className="w-full p-2 rounded border border-gray-300"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search or add a lab test..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <CommandList>
              <CommandEmpty>No lab tests found.</CommandEmpty>
              {labTests
                .filter((test) =>
                  test.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((test) => (
                  <CommandItem
                    key={test.value}
                    onSelect={() => addTest(test.label)}
                  >
                    {test.label}
                  </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display Selected Tests */}
      <div className="flex flex-wrap gap-2">
        {selectedTests.map((test, index) => (
          <Badge
            key={index}
            className="flex items-center space-x-2 bg-gray-100 text-gray-800"
          >
            <span>{test}</span>
            <X
              className="cursor-pointer"
              size={16}
              onClick={() => removeTest(test)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default LabTestCombobox;
