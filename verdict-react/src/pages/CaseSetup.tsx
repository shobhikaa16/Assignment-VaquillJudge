import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scale, Upload, FileText, ArrowRight, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/utils/pdf";
import { analyzeTextWithGeminiProxy } from "@/utils/geminiClient";


type UploadedFile = {
  id: string;
  name: string;
  size: number;
  path: string;
};

const CaseSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseTitle, setCaseTitle] = useState("");
  const [plaintiffName, setPlaintiffName] = useState("");
  const [defendantName, setDefendantName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [plaintiffFiles, setPlaintiffFiles] = useState<UploadedFile[]>([]);
  const [defendantFiles, setDefendantFiles] = useState<UploadedFile[]>([]);
  const [uploadingPlaintiff, setUploadingPlaintiff] = useState(false);
  const [uploadingDefendant, setUploadingDefendant] = useState(false);
  const plaintiffInputRef = useRef<HTMLInputElement>(null);
  const defendantInputRef = useRef<HTMLInputElement>(null);
  
  // Generate a unique case ID
  const caseId = useState(() => crypto.randomUUID())[0];

  const handleFileUpload = async (
    files: FileList | null,
    side: "plaintiff" | "defendant"
  ) => {
    if (!files || files.length === 0) return;

    const setUploading = side === "plaintiff" ? setUploadingPlaintiff : setUploadingDefendant;
    const setFiles = side === "plaintiff" ? setPlaintiffFiles : setDefendantFiles;
    const currentFiles = side === "plaintiff" ? plaintiffFiles : defendantFiles;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${caseId}/${side}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('case-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('case_documents')
          .insert({
            case_id: caseId,
            party_side: side,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
          });

        if (dbError) throw dbError;

        return {
          id: fileName,
          name: file.name,
          size: file.size,
          path: fileName,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles([...currentFiles, ...uploadedFiles]);

      toast({
        title: "Upload Successful",
        description: `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (
    fileId: string,
    side: "plaintiff" | "defendant"
  ) => {
    const setFiles = side === "plaintiff" ? setPlaintiffFiles : setDefendantFiles;
    const currentFiles = side === "plaintiff" ? plaintiffFiles : defendantFiles;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('case-documents')
        .remove([fileId]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('case_documents')
        .delete()
        .eq('file_path', fileId);

      if (dbError) throw dbError;

      setFiles(currentFiles.filter(f => f.id !== fileId));

      toast({
        title: "File Removed",
        description: "File deleted successfully.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseTitle || !plaintiffName || !defendantName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Case Created",
      description: "Proceeding to courtroom...",
    });

    // Navigate to courtroom with case data
    setTimeout(() => {
      navigate("/courtroom", {
        state: { 
          caseId,
          caseTitle, 
          plaintiffName, 
          defendantName, 
          caseDescription,
          plaintiffFiles: plaintiffFiles.length,
          defendantFiles: defendantFiles.length
        }
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-courtroom-bg">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-secondary" />
            <span className="text-xl font-bold text-primary">AI Judge</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Create New Case</h1>
            <p className="text-muted-foreground text-lg">
              Enter case details and upload relevant documents for both parties
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
                <CardDescription>Provide basic details about the legal case</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="caseTitle">Case Title *</Label>
                  <Input
                    id="caseTitle"
                    placeholder="e.g., Smith v. Johnson"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="caseDescription">Case Description</Label>
                  <Textarea
                    id="caseDescription"
                    placeholder="Brief description of the case..."
                    value={caseDescription}
                    onChange={(e) => setCaseDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-[var(--shadow-card)] border-l-4 border-l-plaintiff">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-plaintiff"></div>
                    Side A - Plaintiff
                  </CardTitle>
                  <CardDescription>Details and documents for the plaintiff</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plaintiffName">Party Name *</Label>
                    <Input
                      id="plaintiffName"
                      placeholder="Plaintiff name"
                      value={plaintiffName}
                      onChange={(e) => setPlaintiffName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Upload Documents</Label>
                    <input
                      ref={plaintiffInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, "plaintiff")}
                    />
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-plaintiff transition-colors cursor-pointer"
                      onClick={() => plaintiffInputRef.current?.click()}
                    >
                      {uploadingPlaintiff ? (
                        <Loader2 className="h-8 w-8 mx-auto mb-2 text-plaintiff animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mb-1">
                        {uploadingPlaintiff ? "Uploading..." : "Drop files here or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, or text documents
                      </p>
                    </div>
                    
                    {plaintiffFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {plaintiffFiles.map((file) => (
                          <div 
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-plaintiff flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(file.id, "plaintiff")}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-card)] border-l-4 border-l-defendant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-defendant"></div>
                    Side B - Defendant
                  </CardTitle>
                  <CardDescription>Details and documents for the defendant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defendantName">Party Name *</Label>
                    <Input
                      id="defendantName"
                      placeholder="Defendant name"
                      value={defendantName}
                      onChange={(e) => setDefendantName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Upload Documents</Label>
                    <input
                      ref={defendantInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, "defendant")}
                    />
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-defendant transition-colors cursor-pointer"
                      onClick={() => defendantInputRef.current?.click()}
                    >
                      {uploadingDefendant ? (
                        <Loader2 className="h-8 w-8 mx-auto mb-2 text-defendant animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mb-1">
                        {uploadingDefendant ? "Uploading..." : "Drop files here or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, or text documents
                      </p>
                    </div>
                    
                    {defendantFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {defendantFiles.map((file) => (
                          <div 
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-defendant flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(file.id, "defendant")}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                Proceed to Courtroom
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CaseSetup;
