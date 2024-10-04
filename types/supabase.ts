export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          doctor_id: number
          id: number
          patient_id: number
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status_enum"]
        }
        Insert: {
          appointment_date: string
          doctor_id: number
          id?: number
          patient_id: number
          reason?: string | null
          status: Database["public"]["Enums"]["appointment_status_enum"]
        }
        Update: {
          appointment_date?: string
          doctor_id?: number
          id?: number
          patient_id?: number
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_status_log: {
        Row: {
          appointment_id: number
          id: number
          operator_id: number
          status: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at: string
        }
        Insert: {
          appointment_id: number
          id?: number
          operator_id: number
          status: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
        }
        Update: {
          appointment_id?: number
          id?: number
          operator_id?: number
          status?: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_status_log_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_status_log_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_assignments: {
        Row: {
          assigned_date: string
          bed_id: number
          discharge_date: string | null
          id: number
          operator_id: number
          patient_id: number
          service_id: number
          status: string
        }
        Insert: {
          assigned_date: string
          bed_id: number
          discharge_date?: string | null
          id?: number
          operator_id: number
          patient_id: number
          service_id: number
          status: string
        }
        Update: {
          assigned_date?: string
          bed_id?: number
          discharge_date?: string | null
          id?: number
          operator_id?: number
          patient_id?: number
          service_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bed_assignments_bed"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bed_assignments_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bed_assignments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bed_assignments_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: number
          id: number
          room_id: number
        }
        Insert: {
          bed_number: number
          id?: number
          room_id: number
        }
        Update: {
          bed_number?: number
          id?: number
          room_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_beds_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          id: number
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["billing_status_enum"]
          service_id: number
          total_amount: number
        }
        Insert: {
          id?: number
          payment_date?: string | null
          payment_status: Database["public"]["Enums"]["billing_status_enum"]
          service_id: number
          total_amount: number
        }
        Update: {
          id?: number
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["billing_status_enum"]
          service_id?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_billing_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_amendments: {
        Row: {
          bill_id: number
          id: number
          modified_at: string
          operator_id: number
          reason: string | null
          status: string
          total_amount: number
        }
        Insert: {
          bill_id: number
          id?: number
          modified_at?: string
          operator_id: number
          reason?: string | null
          status: string
          total_amount: number
        }
        Update: {
          bill_id?: number
          id?: number
          modified_at?: string
          operator_id?: number
          reason?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_billing_amendments_bill"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_billing_amendments_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      checkups: {
        Row: {
          diagnosis: string
          doctor_id: number
          id: number
          notes: string | null
          patient_id: number
          prescription_id: number
          service_id: number
          treatment: string
          visit_date: string
        }
        Insert: {
          diagnosis: string
          doctor_id: number
          id?: number
          notes?: string | null
          patient_id: number
          prescription_id: number
          service_id: number
          treatment: string
          visit_date: string
        }
        Update: {
          diagnosis?: string
          doctor_id?: number
          id?: number
          notes?: string | null
          patient_id?: number
          prescription_id?: number
          service_id?: number
          treatment?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_checkups_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_checkups_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_checkups_prescription"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_checkups_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          head_id: number
          id: number
          name: string
        }
        Insert: {
          head_id: number
          id?: number
          name: string
        }
        Update: {
          head_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_head"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensary: {
        Row: {
          discount: number
          dispense_date: string
          id: number
          list_total: number
          net_total: number
          pharmacist_id: number
          prescription_id: number
          service_id: number
        }
        Insert: {
          discount?: number
          dispense_date?: string
          id?: number
          list_total: number
          net_total: number
          pharmacist_id: number
          prescription_id: number
          service_id: number
        }
        Update: {
          discount?: number
          dispense_date?: string
          id?: number
          list_total?: number
          net_total?: number
          pharmacist_id?: number
          prescription_id?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_dispensary_pharmacist"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dispensary_prescription"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dispensary_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensed_medicine: {
        Row: {
          dispense_id: number
          id: number
          quantity: number
          stock_id: number
        }
        Insert: {
          dispense_id: number
          id?: number
          quantity: number
          stock_id: number
        }
        Update: {
          dispense_id?: number
          id?: number
          quantity?: number
          stock_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_dispensed_medicine_dispense"
            columns: ["dispense_id"]
            isOneToOne: false
            referencedRelation: "dispensary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dispensed_medicine_stock"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "drugs_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          doctor_id: number
          expected_patients: number
          from: string
          id: number
          to: string
        }
        Insert: {
          doctor_id: number
          expected_patients: number
          from: string
          id?: number
          to: string
        }
        Update: {
          doctor_id?: number
          expected_patients?: number
          from?: string
          id?: number
          to?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_doctor_schedules_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          department_id: number
          id: number
          join_date: string
          license_number: string
          specialization: string
          user_id: number
        }
        Insert: {
          department_id: number
          id?: number
          join_date?: string
          license_number: string
          specialization: string
          user_id: number
        }
        Update: {
          department_id?: number
          id?: number
          join_date?: string
          license_number?: string
          specialization?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_doctors_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drugs_inventory: {
        Row: {
          chemical_formula: string
          description: string | null
          dosage_form: string
          drug_name: string
          formula_name: string
          id: number
          strength: string
          supplier: string | null
        }
        Insert: {
          chemical_formula: string
          description?: string | null
          dosage_form: string
          drug_name: string
          formula_name: string
          id?: number
          strength: string
          supplier?: string | null
        }
        Update: {
          chemical_formula?: string
          description?: string | null
          dosage_form?: string
          drug_name?: string
          formula_name?: string
          id?: number
          strength?: string
          supplier?: string | null
        }
        Relationships: []
      }
      drugs_stock: {
        Row: {
          barcode: string
          cost_per_unit: number
          drug_id: number
          expiration_date: string
          id: number
          list_price_per_unit: number
          quantity: number
          stock_date: string
        }
        Insert: {
          barcode: string
          cost_per_unit: number
          drug_id: number
          expiration_date: string
          id?: number
          list_price_per_unit: number
          quantity: number
          stock_date?: string
        }
        Update: {
          barcode?: string
          cost_per_unit?: number
          drug_id?: number
          expiration_date?: string
          id?: number
          list_price_per_unit?: number
          quantity?: number
          stock_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_drugs_stock_drug"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          doctor_id: number
          id: number
          patient_id: number
          report_link: string | null
          results: string | null
          service_id: number
          status: Database["public"]["Enums"]["lab_test_status_enum"]
          technician_id: number
          test_date: string
          test_type: string
        }
        Insert: {
          doctor_id: number
          id?: number
          patient_id: number
          report_link?: string | null
          results?: string | null
          service_id: number
          status: Database["public"]["Enums"]["lab_test_status_enum"]
          technician_id: number
          test_date: string
          test_type: string
        }
        Update: {
          doctor_id?: number
          id?: number
          patient_id?: number
          report_link?: string | null
          results?: string | null
          service_id?: number
          status?: Database["public"]["Enums"]["lab_test_status_enum"]
          technician_id?: number
          test_date?: string
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lab_tests_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lab_tests_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lab_tests_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lab_tests_technician"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      medication: {
        Row: {
          administer_route: string
          dosage: number
          drug_id: number
          duration_in_days: number
          frequency_daily: number
          guidelines: string | null
          id: number
          prescription_id: number
          quantity: number
        }
        Insert: {
          administer_route: string
          dosage: number
          drug_id: number
          duration_in_days: number
          frequency_daily: number
          guidelines?: string | null
          id?: number
          prescription_id: number
          quantity: number
        }
        Update: {
          administer_route?: string
          dosage?: number
          drug_id?: number
          duration_in_days?: number
          frequency_daily?: number
          guidelines?: string | null
          id?: number
          prescription_id?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_medication_drug"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_prescription"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          id: number
          join_date: string
          role: string
          specialization: string | null
          user_id: number
        }
        Insert: {
          id?: number
          join_date?: string
          role: string
          specialization?: string | null
          user_id: number
        }
        Update: {
          id?: number
          join_date?: string
          role?: string
          specialization?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_operators_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          date_of_birth: string
          disability: string | null
          emergency_contact: string
          family_history: string | null
          gender: Database["public"]["Enums"]["gender_enum"]
          id: number
          medical_history: string | null
          registration_date: string
          user_id: number
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          date_of_birth: string
          disability?: string | null
          emergency_contact: string
          family_history?: string | null
          gender: Database["public"]["Enums"]["gender_enum"]
          id?: number
          medical_history?: string | null
          registration_date?: string
          user_id: number
        }
        Update: {
          address?: string | null
          allergies?: string | null
          date_of_birth?: string
          disability?: string | null
          emergency_contact?: string
          family_history?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"]
          id?: number
          medical_history?: string | null
          registration_date?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_patients_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          id: number
          other_medication: string | null
          prescription_date: string
          status: Database["public"]["Enums"]["prescription_status_enum"]
          validity: string
        }
        Insert: {
          id?: number
          other_medication?: string | null
          prescription_date?: string
          status: Database["public"]["Enums"]["prescription_status_enum"]
          validity: string
        }
        Update: {
          id?: number
          other_medication?: string | null
          prescription_date?: string
          status?: Database["public"]["Enums"]["prescription_status_enum"]
          validity?: string
        }
        Relationships: []
      }
      reception_help_center: {
        Row: {
          id: number
          issue_description: string
          issue_type: string
          patient_id: number
          reported_at: string
          resolved_at: string | null
          staff_id: number
          status: string
        }
        Insert: {
          id?: number
          issue_description: string
          issue_type: string
          patient_id: number
          reported_at?: string
          resolved_at?: string | null
          staff_id: number
          status: string
        }
        Update: {
          id?: number
          issue_description?: string
          issue_type?: string
          patient_id?: number
          reported_at?: string
          resolved_at?: string | null
          staff_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reception_help_center_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reception_help_center_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          id: number
          room_number: string
          room_type: string
          status: Database["public"]["Enums"]["room_status_enum"]
        }
        Insert: {
          capacity: number
          id?: number
          room_number: string
          room_type: string
          status: Database["public"]["Enums"]["room_status_enum"]
        }
        Update: {
          capacity?: number
          id?: number
          room_number?: string
          room_type?: string
          status?: Database["public"]["Enums"]["room_status_enum"]
        }
        Relationships: []
      }
      service: {
        Row: {
          created_at: string
          description: string | null
          id: number
          service_type: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          service_type: string
          status: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          service_type?: string
          status?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          department_id: number
          id: number
          join_date: string
          position: string
          user_id: number
        }
        Insert: {
          department_id: number
          id?: number
          join_date?: string
          position: string
          user_id: number
        }
        Update: {
          department_id?: number
          id?: number
          join_date?: string
          position?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          id: number
          roster_id: number
          status: Database["public"]["Enums"]["attendance_status_enum"]
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          id?: number
          roster_id: number
          status: Database["public"]["Enums"]["attendance_status_enum"]
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          id?: number
          roster_id?: number
          status?: Database["public"]["Enums"]["attendance_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_attendance_roster"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "staff_roster"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_duty: {
        Row: {
          created_at: string
          description: string
          end_time: string
          id: number
          name: string
          operator_id: number
          start_time: string
        }
        Insert: {
          created_at?: string
          description: string
          end_time: string
          id?: number
          name: string
          operator_id: number
          start_time: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string
          id?: number
          name?: string
          operator_id?: number
          start_time?: string
        }
        Relationships: []
      }
      staff_roster: {
        Row: {
          date: string
          duty_id: number
          id: number
          operator_id: number
          staff_id: number
          status: Database["public"]["Enums"]["staff_status_enum"]
        }
        Insert: {
          date: string
          duty_id: number
          id?: number
          operator_id: number
          staff_id: number
          status: Database["public"]["Enums"]["staff_status_enum"]
        }
        Update: {
          date?: string
          duty_id?: number
          id?: number
          operator_id?: number
          staff_id?: number
          status?: Database["public"]["Enums"]["staff_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_roster_duty"
            columns: ["duty_id"]
            isOneToOne: false
            referencedRelation: "staff_duty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_roster_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_roster_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_uid: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_enum"]
          id: number
          last_name: string
          role: string
        }
        Insert: {
          auth_uid: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_enum"]
          id?: number
          last_name: string
          role: string
        }
        Update: {
          auth_uid?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_enum"]
          id?: number
          last_name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_uid_fkey"
            columns: ["auth_uid"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_in_patients: {
        Row: {
          age: number
          allergies: string | null
          arrival_time: string
          attended: boolean
          disability: string | null
          doctor_id: number
          full_name: string
          gender: Database["public"]["Enums"]["gender_enum"]
          id: number
          medical_history: string | null
          reason: string
          staff_id: number
        }
        Insert: {
          age: number
          allergies?: string | null
          arrival_time?: string
          attended?: boolean
          disability?: string | null
          doctor_id: number
          full_name: string
          gender: Database["public"]["Enums"]["gender_enum"]
          id?: number
          medical_history?: string | null
          reason: string
          staff_id: number
        }
        Update: {
          age?: number
          allergies?: string | null
          arrival_time?: string
          attended?: boolean
          disability?: string | null
          doctor_id?: number
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_enum"]
          id?: number
          medical_history?: string | null
          reason?: string
          staff_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_walk_in_patients_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_walk_in_patients_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status_enum:
        | "Pending"
        | "Confirmed"
        | "Cancelled"
        | "Completed"
        | "Postponed"
      attendance_status_enum: "Present" | "Absent" | "Late" | "Excused"
      billing_status_enum: "Unpaid" | "Paid" | "Cancelled"
      gender_enum: "Male" | "Female" | "Other"
      lab_test_status_enum: "Pending" | "Analyzing" | "Completed" | "Cancelled"
      prescription_status_enum: "Active" | "Completed" | "Cancelled" | "Expired"
      room_status_enum: "Available" | "Occupied" | "Under_Maintenance"
      staff_status_enum: "Scheduled" | "Completed" | "Missed" | "Cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
