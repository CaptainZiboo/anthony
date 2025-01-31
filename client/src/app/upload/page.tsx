import UploadForm from "@/components/llm/upload";

const UploadPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-custom-blue text-center mb-6">Upload File</h1>
        <UploadForm />
      </div>
    </div>
  );
};

export default UploadPage;