import { SupabaseClient } from '@supabase/supabase-js';

export interface UploadDocumentParams {
    student_id: string;
    file: File;
    document_type: string;
}

export const uploadDocument = async (client: SupabaseClient, { student_id, file, document_type }: UploadDocumentParams) => {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${student_id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await client.storage
        .from('internship-documents')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get public URL (or signed URL if private)
    // Assuming private bucket, we might store the path and generate signed URLs on read
    // For now, let's store the path

    // 3. Create database record
    const { data, error: dbError } = await client
        .from('documents')
        .insert({
            student_id,
            name: file.name,
            file_url: filePath, // Storing path to generate signed URL later
            document_type,
            file_size: file.size,
            mime_type: file.type,
            status: 'uploaded'
        })
        .select()
        .single();

    if (dbError) throw dbError;
    return data;
};

export const deleteDocument = async (client: SupabaseClient, documentId: string, filePath: string) => {
    // 1. Delete from storage
    const { error: storageError } = await client.storage
        .from('internship-documents')
        .remove([filePath]);

    if (storageError) throw storageError;

    // 2. Delete from database
    const { error: dbError } = await client
        .from('documents')
        .delete()
        .eq('document_id', documentId);

    if (dbError) throw dbError;
    return true;
};

export const getStudentDocuments = async (client: SupabaseClient, studentId: string) => {
    const { data, error } = await client
        .from('documents')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};
