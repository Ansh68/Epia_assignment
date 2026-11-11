"use client";

import { Patient, DraftResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  X,
  MessageSquare,
  Sparkles,
  Phone,
  Calendar,
} from "lucide-react";

interface Props {
  result: DraftResult;
  onClose: () => void;
  onApprove: (patient: Patient) => void;
}

export default function DraftModal({ result, onClose, onApprove }: Props) {
  const { draft, source, notice, patient } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                WhatsApp Draft
              </h2>
              <p className="text-xs text-slate-500">
                Review before sending to {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <Separator />

        {/* patient info strip */}
        <div className="px-5 py-3 bg-slate-50 flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Follow-up: {patient.followUpDate}
          </span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] gap-1 px-2 border-purple-200 bg-purple-50 text-purple-700 font-medium"
          >
            <Sparkles className="h-2.5 w-2.5 text-purple-600" />
            Gemini AI
          </Badge>
        </div>

        {/* draft message */}
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
            Message Preview
          </p>
          {/* WhatsApp-style bubble */}
          <div className="bg-[#dcf8c6] rounded-lg rounded-tl-none px-4 py-3 text-sm text-slate-800 leading-relaxed shadow-sm border border-[#c2e9a8] font-[system-ui]">
            {draft}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-right">
            ✓ Pending staff approval — not yet sent
          </p>
        </div>

        <Separator />

        {/* actions */}
        <div className="px-5 py-4 flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Discard
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 gap-1.5 text-xs"
            onClick={() => onApprove(patient)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve & Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );
}

