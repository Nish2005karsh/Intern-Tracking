import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Upload, File, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/api/documents";
import { createAuthClient, supabase } from "@/lib/supabaseClient";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
];

export function DocumentUpload() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadMutation = useMutation({
        mutationFn: async ({ file, type }: { file: File, type: string }) => {
            const token = await getToken({ template: "supabase" });
            if (!token) throw new Error("No token");
            const client = createAuthClient(token);

            // Get student ID from profile
            const { data: profile } = await client
                .from('profiles')
                .select('id')
                .eq('clerk_id', user?.id)
                .single();

            if (!profile) throw new Error("Profile not found");

            const { data: student } = await client
                .from('students')
                .select('student_id')
                .eq('student_id', profile.id)
                .single();

            if (!student) throw new Error("Student record not found");

            return uploadDocument(client, {
                student_id: student.student_id,
                file,
                document_type: type
            });
        },
        onSuccess: () => {
            toast.success("Document uploaded successfully!");
            setFile(null);
            setDocumentType("");
            setUploadProgress(0);
            queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
        },
        onError: (error) => {
            toast.error(`Failed to upload document: ${error.message}`);
            setUploadProgress(0);
        },
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file: File) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG.");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size too large. Max 10MB allowed.");
            return false;
        }
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }
        if (!documentType) {
            toast.error("Please select a document type.");
            return;
        }

        // Simulate progress for better UX since Supabase storage upload doesn't give granular progress easily via simple client call
        // In a real app with TUS or XMLHttpRequest we could track it.
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 90) clearInterval(interval);
        }, 200);

        uploadMutation.mutate({ file, type: documentType }, {
            onSettled: () => {
                clearInterval(interval);
                setUploadProgress(100);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />

                {!file ? (
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => inputRef.current?.click()}>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF, DOC, JPG up to 10MB
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-md">
                        <div className="flex items-center gap-3">
                            <File className="h-8 w-8 text-primary" />
                            <div className="text-left">
                                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {file && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="offer_letter">Offer Letter</SelectItem>
                                <SelectItem value="completion_certificate">Completion Certificate</SelectItem>
                                <SelectItem value="weekly_report">Weekly Report</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {uploadProgress > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending || !documentType}
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Upload Document"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
