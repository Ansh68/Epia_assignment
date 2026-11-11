"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format, parseISO, isToday } from "date-fns";
import {
  Plus,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Calendar,
  Phone,
  Users,
  ClipboardList,
  Bell,
  Stethoscope,
} from "lucide-react";

import { api } from "@/lib/api";
import { Patient, DraftResult } from "@/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AddPatientForm from "@/components/AddPatientForm";
import DraftModal from "@/components/DraftModal";
import PatientTable from "@/components/PatientTable";

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dueToday, setDueToday] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draftResult, setDraftResult] = useState<DraftResult | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (!isManualRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const [all, due] = await Promise.all([
        api.getPatients(),
        api.getDueToday(),
      ]);
      setPatients(all);
      setDueToday(due);
      if (isManualRefresh) {
        toast.success("Data synced", {
          description: `${all.length} patient records up to date (${due.length} due today)`,
        });
      }
    } catch {
      toast.error("Sync failed", {
        description: "Could not connect to the backend server.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPatient = async (data: {
    name: string;
    phone: string;
    consultationDate: string;
    followUpDate: string;
  }) => {
    try {
      const created = await api.addPatient(data);
      toast.success("Patient added", {
        description: `${created.name} scheduled for follow-up on ${created.followUpDate}.`,
      });
      setShowAddForm(false);
      fetchData(false);
    } catch (err: unknown) {
      toast.error("Failed to add patient", {
        description: err instanceof Error ? err.message : "Validation or network error.",
      });
    }
  };

  const handleMarkComplete = async (patient: Patient) => {
    try {
      await api.markComplete(patient.id);
      toast.success("Follow-up completed", {
        description: `Consultation marked as done for ${patient.name}.`,
      });
      fetchData(false);
    } catch (err: unknown) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Failed to update status.",
      });
    }
  };

  const handleDelete = async (patient: Patient) => {
    try {
      await api.deletePatient(patient.id);
      toast.success("Patient removed", {
        description: `${patient.name} has been deleted.`,
      });
      fetchData(false);
    } catch (err: unknown) {
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Could not delete patient.",
      });
    }
  };

  const handleGenerateDraft = async (patient: Patient) => {
    setGeneratingFor(patient.id);
    const toastId = toast.loading(`Drafting message for ${patient.name}...`);
    try {
      const result = await api.generateDraft(patient.id);
      setDraftResult(result);
      toast.dismiss(toastId);
      toast.success("Draft ready for review", {
        description: "Generated personalized message with Gemini AI.",
      });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error("Generation failed", {
        description: err instanceof Error ? err.message : "Could not generate follow-up draft.",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const pendingCount = patients.filter((p) => p.followUpStatus === "pending").length;
  const completedCount = patients.filter((p) => p.followUpStatus === "completed").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 leading-none">
                  MedCare Clinic
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient Follow-up System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="gap-1.5"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Patient
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-4 w-4 text-blue-600" />}
            label="Total Patients"
            value={patients.length}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Bell className="h-4 w-4 text-amber-600" />}
            label="Due Today"
            value={dueToday.length}
            bg="bg-amber-50"
            highlight={dueToday.length > 0}
          />
          <StatCard
            icon={<ClipboardList className="h-4 w-4 text-orange-600" />}
            label="Pending"
            value={pendingCount}
            bg="bg-orange-50"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
            label="Completed"
            value={completedCount}
            bg="bg-green-50"
          />
        </div>

        {/* ── Due Today Banner ───────────────────────────────────────── */}
        {dueToday.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-semibold text-amber-900">
                  {dueToday.length} follow-up{dueToday.length !== 1 ? "s" : ""} due today
                </CardTitle>
              </div>
              <CardDescription className="text-amber-700 text-xs">
                Generate AI-powered WhatsApp drafts for review before sending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dueToday.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-amber-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
                        {p.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {p.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-amber-300 hover:bg-amber-100"
                        onClick={() => handleGenerateDraft(p)}
                        disabled={generatingFor === p.id}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {generatingFor === p.id ? "Generating..." : "Draft Message"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-green-300 hover:bg-green-50 text-green-700"
                        onClick={() => handleMarkComplete(p)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Add Patient Inline Form ─────────────────────────────────── */}
        {showAddForm && (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Add New Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddPatientForm
                onSubmit={handleAddPatient}
                onCancel={() => setShowAddForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* ── Patient Tabs ───────────────────────────────────────────── */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="all" className="text-xs">
              All Patients
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1">
                {patients.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Pending
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1">
                {pendingCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <PatientTable
              patients={patients}
              loading={loading}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDelete}
              onGenerateDraft={handleGenerateDraft}
              generatingFor={generatingFor}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <PatientTable
              patients={patients.filter((p) => p.followUpStatus === "pending")}
              loading={loading}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDelete}
              onGenerateDraft={handleGenerateDraft}
              generatingFor={generatingFor}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Draft Modal ────────────────────────────────────────────── */}
      {draftResult && (
        <DraftModal
          result={draftResult}
          onClose={() => setDraftResult(null)}
          onApprove={(patient) => {
            setDraftResult(null);
            handleMarkComplete(patient);
          }}
        />
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  bg,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`border-0 shadow-sm ${highlight ? "ring-2 ring-amber-400" : ""}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`${bg} p-2 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
