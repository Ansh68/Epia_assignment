"use client";

import { Patient } from "@/types";
import { format, parseISO, isToday, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Props {
  patients: Patient[];
  loading: boolean;
  onMarkComplete: (p: Patient) => void;
  onDelete: (p: Patient) => void;
  onGenerateDraft: (p: Patient) => void;
  generatingFor: string | null;
}

export default function PatientTable({
  patients,
  loading,
  onMarkComplete,
  onDelete,
  onGenerateDraft,
  generatingFor,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
        Loading patients...
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <Clock className="h-8 w-8 text-slate-300" />
        <p className="text-sm">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-xs font-semibold text-slate-600 w-10">#</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600">Patient</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600">Phone</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600">Consultation</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600">Follow-up</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((p, idx) => {
            const followUpDate = parseISO(p.followUpDate);
            const dueToday = isToday(followUpDate);
            const overdue =
              p.followUpStatus === "pending" &&
              isPast(followUpDate) &&
              !dueToday;

            return (
              <TableRow
                key={p.id}
                className={
                  dueToday && p.followUpStatus === "pending"
                    ? "bg-amber-50/40 hover:bg-amber-50"
                    : overdue
                    ? "bg-red-50/40 hover:bg-red-50/60"
                    : "hover:bg-slate-50"
                }
              >
                <TableCell className="text-xs text-slate-400 font-mono">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {p.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-mono">
                  {p.phone}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {format(parseISO(p.consultationDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {overdue && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    )}
                    {dueToday && p.followUpStatus === "pending" && (
                      <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        overdue
                          ? "text-red-600 font-medium"
                          : dueToday
                          ? "text-amber-700 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {format(followUpDate, "dd MMM yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={p.followUpStatus}
                    dueToday={dueToday}
                    overdue={overdue}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {p.followUpStatus === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onGenerateDraft(p)}
                          disabled={generatingFor === p.id}
                          title="Generate WhatsApp draft"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onMarkComplete(p)}
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(p)}
                      title="Delete patient"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({
  status,
  dueToday,
  overdue,
}: {
  status: string;
  dueToday: boolean;
  overdue: boolean;
}) {
  if (status === "completed") {
    return (
      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        ✓ Completed
      </Badge>
    );
  }
  if (overdue) {
    return (
      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Overdue
      </Badge>
    );
  }
  if (dueToday) {
    return (
      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        Due Today
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] text-slate-500">
      Pending
    </Badge>
  );
}

