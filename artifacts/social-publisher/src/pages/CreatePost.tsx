import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePost } from "@/hooks/use-app-api";
import {
  Image as ImageIcon,
  Video,
  Type,
  Send,
  Sparkles,
  UploadCloud,
  X,
  Play,
  FileVideo,
  FileImage,
} from "lucide-react";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().min(1, "Caption is required"),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(["image", "video", "text"]),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  scheduledAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type MediaType = "image" | "video" | "text";

const PLATFORMS = [
  { id: "facebook",  label: "Facebook",  color: "bg-blue-600" },
  { id: "twitter",   label: "Twitter/X", color: "bg-sky-500" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500" },
  { id: "youtube",   label: "YouTube",   color: "bg-red-600" },
  { id: "tiktok",    label: "TikTok",    color: "bg-zinc-700" },
];

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { mutate: createPost, isPending } = useCreatePost();

  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { platforms: [], mediaType: "video" },
  });

  const selectedPlatforms = watch("platforms");

  const handleFileSelect = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setValue("mediaUrl", url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (mediaType === "video" && isVideo) handleFileSelect(file);
    else if (mediaType === "image" && isImage) handleFileSelect(file);
    else if (isVideo) { setMediaType("video"); setValue("mediaType", "video"); handleFileSelect(file); }
    else if (isImage) { setMediaType("image"); setValue("mediaType", "image"); handleFileSelect(file); }
  }, [mediaType]);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setValue("mediaUrl", "");
  };

  const switchType = (type: MediaType) => {
    clearFile();
    setMediaType(type);
    setValue("mediaType", type);
  };

  const triggerPicker = () => {
    if (mediaType === "video") videoInputRef.current?.click();
    else if (mediaType === "image") imageInputRef.current?.click();
  };

  const onSubmit = (data: FormValues) => {
    createPost({
      data: {
        ...data,
        platforms: data.platforms as any[],
        platformCaptions: data.platforms.map(p => ({
          platform: p as any,
          caption: data.caption,
          hashtags: [],
        })),
      }
    }, { onSuccess: () => setLocation("/posts") });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Create New Post</h1>
        <p className="text-muted-foreground">Upload your content and publish everywhere at once.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title */}
          <Card>
            <CardContent className="p-6">
              <label className="text-sm font-medium text-white mb-2 block">Post Title</label>
              <Input {...register("title")} placeholder="e.g., My New YouTube Video" className="text-base" />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
            </CardContent>
          </Card>

          {/* Media Picker */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-white mb-3 block">Content Type</label>
                {/* Type tabs */}
                <div className="flex gap-3">
                  {[
                    { type: "video" as MediaType, icon: Video, label: "Video" },
                    { type: "image" as MediaType, icon: ImageIcon, label: "Photo" },
                    { type: "text"  as MediaType, icon: Type,     label: "Text Only" },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => switchType(type)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all font-medium text-sm
                        ${mediaType === type
                          ? "border-violet-500 bg-violet-500/15 text-violet-300"
                          : "border-white/10 bg-white/3 text-muted-foreground hover:bg-white/8 hover:border-white/20"
                        }`}
                    >
                      <Icon className="w-6 h-6" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Area */}
              <AnimatePresence mode="wait">
                {mediaType !== "text" && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!selectedFile ? (
                      /* Drop Zone */
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={triggerPicker}
                        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none
                          ${isDragging
                            ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
                            : "border-white/15 hover:border-violet-400/60 hover:bg-white/4"
                          }`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                          {mediaType === "video"
                            ? <FileVideo className="w-8 h-8 text-violet-400" />
                            : <FileImage className="w-8 h-8 text-violet-400" />
                          }
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-lg mb-1">
                            {mediaType === "video" ? "Select a Video" : "Select a Photo"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Tap to open your{" "}
                            <span className="text-violet-400 font-medium">
                              {mediaType === "video" ? "gallery or camera" : "photo library"}
                            </span>
                            {" "}or drag & drop here
                          </p>
                          <p className="text-muted-foreground/60 text-xs mt-2">
                            {mediaType === "video"
                              ? "MP4, MOV, AVI, MKV supported"
                              : "JPG, PNG, GIF, WebP supported"
                            }
                          </p>
                        </div>
                        <Button type="button" variant="gradient" className="gap-2 px-6" onClick={(e) => { e.stopPropagation(); triggerPicker(); }}>
                          <UploadCloud className="w-4 h-4" />
                          {mediaType === "video" ? "Choose Video" : "Choose Photo"}
                        </Button>
                      </div>
                    ) : (
                      /* Preview */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10"
                      >
                        {mediaType === "video" ? (
                          <video
                            src={previewUrl!}
                            controls
                            className="w-full max-h-80 object-contain"
                            playsInline
                          />
                        ) : (
                          <img
                            src={previewUrl!}
                            alt="Preview"
                            className="w-full max-h-80 object-contain"
                          />
                        )}
                        {/* Overlay info */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                          {mediaType === "video"
                            ? <Play className="w-3.5 h-3.5 text-violet-400" />
                            : <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                          }
                          <span className="text-xs text-white font-medium truncate max-w-48">{selectedFile.name}</span>
                        </div>
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={clearFile}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {/* Change file */}
                        <div className="p-3 bg-black/20 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                          <button
                            type="button"
                            onClick={triggerPicker}
                            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                          >
                            Change file
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Caption */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Caption</label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-violet-400 gap-1 px-2">
                  <Sparkles className="w-3 h-3" /> AI Suggest
                </Button>
              </div>
              <textarea
                {...register("caption")}
                className="w-full h-36 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm leading-relaxed"
                placeholder="Write your caption here... add hashtags, emojis, mentions..."
              />
              {errors.caption && <p className="text-destructive text-sm mt-1">{errors.caption.message}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platform Selector */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-white mb-4">Publish To</h3>
              <div className="space-y-2">
                {PLATFORMS.map(platform => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <label
                      key={platform.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? "border-violet-500/60 bg-violet-500/10" : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white font-bold text-xs`}>
                          {platform.label[0]}
                        </div>
                        <span className="font-medium text-white text-sm">{platform.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        value={platform.id}
                        {...register("platforms")}
                        className="w-5 h-5 rounded accent-violet-500"
                      />
                    </label>
                  );
                })}
              </div>
              {errors.platforms && <p className="text-destructive text-sm mt-2">{errors.platforms.message}</p>}
            </CardContent>
          </Card>

          {/* Schedule & Publish */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-white">Publishing</h3>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Schedule (optional)</label>
                <Input type="datetime-local" {...register("scheduledAt")} className="w-full" />
              </div>
              <div className="pt-2 space-y-3">
                <Button type="submit" variant="gradient" className="w-full gap-2" disabled={isPending}>
                  {isPending
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                  {watch("scheduledAt") ? "Schedule Post" : "Publish Now"}
                </Button>
                <Button type="button" variant="outline" className="w-full text-sm">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </motion.div>
  );
}
