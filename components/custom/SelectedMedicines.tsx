import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input"; // Assuming you're using Input component from ShadCN
import { useEffect, useState } from "react";
import { Medicine } from "./columns";
import { MultiSelectItem } from "./FancyMultiSelect";

export type SelectedMedicineTableDataType = {
    drug_id: string;
    dosage: string;
    duration_in_days: number;
    guidelines: string;
}

export function SelectedMedicines({ details, data, setData, selected }: { details: Medicine[], data: SelectedMedicineTableDataType[], setData: Function, selected: MultiSelectItem[] }) {

    const [tableData, setTableData] = useState<Medicine[]>([])

    const handleInputChange = (drug_id: string, field: any, value: any) => {
        setTableData((prev: Medicine[]) =>
            prev.map((medication) =>
                medication.id === drug_id
                    ? { ...medication, [field]: value }
                    : medication
            )
        );
    };

    useEffect(() => {
        setData(tableData.map((med) => {
            const { id, dosage, duration_in_days, guidelines } = med
            return { drug_id: id, dosage, duration_in_days, guidelines }
        }))

        console.log(data)
    }, [tableData])


    useEffect(() => {
        setTableData((prevData: Medicine[]) => {
            // Filter the existing data to keep only the ones that are still selected
            const updatedData = prevData.filter((med) =>
                selected.some((s) => s.value === med.id)
            );

            // Add new items from details.filter that are not already in the data
            const newSelectedItems = details.filter((med) =>
                selected.some((s) => s.value === med.id) &&
                !updatedData.some((existingMed) => existingMed.id === med.id)
            );

            // Combine the old (filtered) data with the new items
            return [...updatedData, ...newSelectedItems];
        });
    }, [selected])

    return (
        <Table>
            <TableCaption>A list of selected medications for this prescription.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Drug Name</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Dosage Form</TableHead>
                    {/* <TableHead>Quantity</TableHead> */}
                    <TableHead>Daily Dosage</TableHead>
                    <TableHead>Duration (days)</TableHead>
                    {/* <TableHead>Administer Route</TableHead> */}
                    <TableHead>Administer Guidelines</TableHead>
                    <TableHead>Formula Name</TableHead>
                    <TableHead>Chemical Formula</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableData && tableData.map((medication) => (
                    <TableRow key={medication.id}>
                        <TableCell className="min-w-32">{medication.drug_name}</TableCell>
                        <TableCell>{medication.strength}</TableCell>
                        <TableCell className="min-w-28">{medication.dosage_form}</TableCell>
                        {/* <TableCell>
                            <Input
                                type="number"
                                value={Number(medication.quantity)}
                                placeholder="1"
                                onChange={(e) =>
                                    handleInputChange(medication.id, "quantity", parseInt(e.target.value))
                                }
                                className="w-16 p-1 border rounded"
                            />
                        </TableCell> */}
                        <TableCell>
                            <Input
                                type="text"
                                value={medication.dosage}
                                onChange={(e) =>
                                    handleInputChange(medication.id, "dosage", e.target.value)
                                }
                                className="w-24 p-1 border rounded"
                                placeholder="1-0-1"
                            />
                        </TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                value={Number(medication.duration_in_days)}
                                placeholder="7"
                                onChange={(e) =>
                                    handleInputChange(medication.id, "duration_in_days", parseInt(e.target.value))
                                }
                                className="w-16 p-1 border rounded"
                            />
                        </TableCell>
                        {/* <TableCell>
                            <Input
                                type="text"
                                value={medication.administer_route}
                                placeholder="Oral"
                                onChange={(e) =>
                                    handleInputChange(medication.id, "administer_route", e.target.value)
                                }
                                className="w-24 p-1 border rounded"
                            />
                        </TableCell> */}
                        <TableCell>
                            <Input
                                type="text"
                                value={medication.guidelines}
                                placeholder="Take after meals, with water..."
                                onChange={(e) =>
                                    handleInputChange(medication.id, "guidelines", e.target.value)
                                }
                                className="min-w-60 p-1 border rounded"
                            />
                        </TableCell>
                        <TableCell>{medication.formula_name}</TableCell>
                        <TableCell>{medication.chemical_formula}</TableCell>
                        <TableCell>{medication.supplier}</TableCell>
                        <TableCell className="min-w-80">
                            {medication.description.length > 80
                                ? `${medication.description.slice(0, 80)}...`
                                : medication.description
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
