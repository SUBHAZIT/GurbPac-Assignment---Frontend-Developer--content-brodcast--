import DashboardLayout from '@/components/shared/DashboardLayout';
import UploadForm from '@/components/teacher/UploadForm';

export default function TeacherUpload() {
  return (
    <DashboardLayout allowedRole="teacher">
      <UploadForm />
    </DashboardLayout>
  );
}
