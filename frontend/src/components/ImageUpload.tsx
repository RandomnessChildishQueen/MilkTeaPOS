import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);

      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <>
      <div className="relative flex items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg bg-muted/30 border-muted-foreground/30 overflow-hidden">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="object-cover w-full h-full"
            />

            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground opacity-70">
            <ImagePlus className="w-8 h-8 mb-2" />
            <span className="text-xs">No image selected</span>
          </div>
        )}
      </div>
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? "Change Image" : "Upload Image"}
      </Button>
    </>
  );
}
