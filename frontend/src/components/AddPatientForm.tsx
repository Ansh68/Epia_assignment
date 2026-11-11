"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  onSubmit: (data: {
    name: string;
    phone: string;
    consultationDate: string;
    followUpDate: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function AddPatientForm({ onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    consultationDate: today,
    followUpDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Validation error", {
        description: "Patient name must be at least 2 characters.",
      });
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Validation error", {
        description: "Phone number is required.",
      });
      return;
    }
    if (!form.followUpDate) {
      toast.error("Validation error", {
        description: "Please specify a follow-up date.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      // Toast handled by parent onSubmit
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Sarah Mitchell"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="h-9 text-sm"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-slate-700">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +1 555 123 4567"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="h-9 text-sm"
            required
          />
        </div>

        {/* Consultation Date */}
        <div className="space-y-1.5">
          <Label
            htmlFor="consultationDate"
            className="text-xs font-medium text-slate-700"
          >
            Consultation Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="consultationDate"
            type="date"
            value={form.consultationDate}
            onChange={(e) => set("consultationDate", e.target.value)}
            className="h-9 text-sm"
            required
          />
        </div>

        {/* Follow-up Date */}
        <div className="space-y-1.5">
          <Label
            htmlFor="followUpDate"
            className="text-xs font-medium text-slate-700"
          >
            Next Follow-up Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="followUpDate"
            type="date"
            value={form.followUpDate}
            onChange={(e) => set("followUpDate", e.target.value)}
            className="h-9 text-sm"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="submit"
          disabled={submitting}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs"
        >
          {submitting ? "Adding..." : "Add Patient"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

