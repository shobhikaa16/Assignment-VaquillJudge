-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false);

-- Create table to track case document metadata
CREATE TABLE public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  party_side TEXT NOT NULL CHECK (party_side IN ('plaintiff', 'defendant')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert documents (no auth required for now)
CREATE POLICY "Anyone can upload case documents"
ON public.case_documents
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to view case documents by case_id
CREATE POLICY "Anyone can view case documents"
ON public.case_documents
FOR SELECT
TO public
USING (true);

-- Storage policies for case-documents bucket
-- Allow anyone to upload files
CREATE POLICY "Anyone can upload case documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'case-documents');

-- Allow anyone to read files
CREATE POLICY "Anyone can view case documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-documents');

-- Allow anyone to delete their uploaded files
CREATE POLICY "Anyone can delete case documents"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'case-documents');