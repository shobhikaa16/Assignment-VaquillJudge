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
  <div className="min-h-screen bg-[#0d0f16] text-[#e6f1ff]">

    {/* HEADER */}
    <header className="border-b border-[#00b7ff33] bg-[#131723] shadow-[0_0_10px_#00b7ff22]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-[#00b7ff]" />
          <span className="text-xl font-bold text-[#00b7ff]">AI Judge</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-[#e6f1ff] hover:text-[#00b7ff]"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    </header>

    {/* MAIN SECTION */}
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00b7ff] mb-4">
            Create New Case
          </h1>
          <p className="text-[#8aa2c0] text-lg">
            Enter case details and upload documents for both parties
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Case Information Card */}
          <Card className="bg-[#131723] border border-[#00b7ff33] rounded-2xl shadow-[0_0_15px_#00b7ff22]">
            <CardHeader>
              <CardTitle className="text-[#00b7ff]">Case Information</CardTitle>
              <CardDescription className="text-[#8aa2c0]">
                Provide basic details about the legal case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Case Title */}
              <div>
                <Label htmlFor="caseTitle" className="text-[#b8c7e0]">Case Title *</Label>
                <Input
                  id="caseTitle"
                  placeholder="e.g., Smith v. Johnson"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  required
                  className="mt-1 bg-[#0f1320] border border-[#00b7ff44] text-[#e6f1ff]
                  rounded-xl px-4 py-3 focus:border-[#00b7ff]
                  focus:shadow-[0_0_10px_#00b7ff] outline-none"
                />
              </div>

              {/* Case Description */}
              <div>
                <Label htmlFor="caseDescription" className="text-[#b8c7e0]">Case Description</Label>
                <Textarea
                  id="caseDescription"
                  placeholder="Brief description..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  rows={4}
                  className="mt-1 bg-[#0f1320] border border-[#00b7ff44] text-[#e6f1ff]
                  rounded-xl px-4 py-3 focus:border-[#00b7ff] 
                  focus:shadow-[0_0_10px_#00b7ff] outline-none"
                />
              </div>

            </CardContent>
          </Card>

          {/* PLAINTIFF + DEFENDANT SECTION */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Plaintiff Card */}
            <Card className="bg-[#131723] border border-[#00b7ff33] rounded-2xl shadow-[0_0_15px_#00b7ff22]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00b7ff]">
                  <div className="w-3 h-3 rounded-full bg-[#00b7ff] shadow-[0_0_8px_#00b7ff]"></div>
                  Side A - Plaintiff
                </CardTitle>
                <CardDescription className="text-[#8aa2c0]">
                  Upload plaintiff’s documents
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Plaintiff Name */}
                <div>
                  <Label htmlFor="plaintiffName" className="text-[#b8c7e0]">Party Name *</Label>
                  <Input
                    id="plaintiffName"
                    placeholder="Plaintiff name"
                    value={plaintiffName}
                    onChange={(e) => setPlaintiffName(e.target.value)}
                    required
                    className="mt-1 bg-[#0f1320] border border-[#00b7ff44] text-[#e6f1ff]
                    rounded-xl px-4 py-3 focus:border-[#00b7ff]
                    focus:shadow-[0_0_10px_#00b7ff] outline-none"
                  />
                </div>

                {/* Plaintiff File Upload */}
                <div>
                  <Label className="text-[#b8c7e0]">Upload Documents</Label>

                  <input
                    ref={plaintiffInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, "plaintiff")}
                  />

                  <div
                    className="border-2 border-dashed border-[#00b7ff44] rounded-lg p-8 text-center
                    hover:border-[#00b7ff] transition-all cursor-pointer bg-[#0f1320]"
                    onClick={() => plaintiffInputRef.current?.click()}
                  >
                    {uploadingPlaintiff ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-[#00b7ff] animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 mx-auto mb-2 text-[#8aa2c0]" />
                    )}
                    <p className="text-sm text-[#8aa2c0] mb-1">
                      {uploadingPlaintiff ? "Uploading..." : "Drop files or click to upload"}
                    </p>
                    <p className="text-xs text-[#8aa2c0]">
                      PDF, Word, Text documents
                    </p>
                  </div>

                  {plaintiffFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {plaintiffFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-[#0f1320] border border-[#00b7ff22] rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-[#00b7ff]" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-[#8aa2c0]">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id, "plaintiff")}
                            className="text-[#e6f1ff] hover:text-[#00b7ff]"
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

            {/* Defendant Card — Same Styling */}
            <Card className="bg-[#131723] border border-[#00b7ff33] rounded-2xl shadow-[0_0_15px_#00b7ff22]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00b7ff]">
                  <div className="w-3 h-3 rounded-full bg-[#00b7ff] shadow-[0_0_8px_#00b7ff]"></div>
                  Side B - Defendant
                </CardTitle>
                <CardDescription className="text-[#8aa2c0]">
                  Upload defendant’s documents
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Defendant Name */}
                <div>
                  <Label htmlFor="defendantName" className="text-[#b8c7e0]">Party Name *</Label>
                  <Input
                    id="defendantName"
                    placeholder="Defendant name"
                    value={defendantName}
                    onChange={(e) => setDefendantName(e.target.value)}
                    required
                    className="mt-1 bg-[#0f1320] border border-[#00b7ff44] text-[#e6f1ff]
                    rounded-xl px-4 py-3 focus:border-[#00b7ff]
                    focus:shadow-[0_0_10px_#00b7ff] outline-none"
                  />
                </div>

                {/* Defendant upload */}
                <div>
                  <Label className="text-[#b8c7e0]">Upload Documents</Label>

                  <input
                    ref={defendantInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, "defendant")}
                  />

                  <div
                    className="border-2 border-dashed border-[#00b7ff44] rounded-lg p-8 text-center
                    hover:border-[#00b7ff] transition-all cursor-pointer bg-[#0f1320]"
                    onClick={() => defendantInputRef.current?.click()}
                  >
                    {uploadingDefendant ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-[#00b7ff] animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 mx-auto mb-2 text-[#8aa2c0]" />
                    )}
                    <p className="text-sm text-[#8aa2c0] mb-1">
                      {uploadingDefendant ? "Uploading..." : "Drop files or click to upload"}
                    </p>
                    <p className="text-xs text-[#8aa2c0]">
                      PDF, Word, Text documents
                    </p>
                  </div>

                  {defendantFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {defendantFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-[#0f1320] border border-[#00b7ff22] rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-[#00b7ff]" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-[#8aa2c0]">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id, "defendant")}
                            className="text-[#e6f1ff] hover:text-[#00b7ff]"
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

          {/* SUBMIT BUTTON */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              className="bg-[#00b7ff] hover:bg-[#00a6e6] text-black font-semibold px-8
              rounded-xl shadow-[0_0_15px_#00b7ff]"
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
