import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile, useUpdateProfile } from "@/hooks/use-app-api";
import { Save, User, Camera } from "lucide-react";
import { useEffect } from "react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio || "",
        website: profile.website || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile({ data });
  };

  if (isLoading || !profile) return <div className="p-8">Loading profile...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your public creator profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img src={profile.avatar || ""} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white/10" />
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-card hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white">{profile.displayName}</h3>
              <p className="text-sm text-muted-foreground mb-6">@{profile.displayName.toLowerCase().replace(/\s+/g, '')}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-2xl font-bold text-white">{profile.postsCount}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{(profile.followersCount / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input {...register("displayName")} className="pl-12" />
                  </div>
                  {errors.displayName && <p className="text-destructive text-sm mt-1">{errors.displayName.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Bio</label>
                  <textarea 
                    {...register("bio")} 
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Tell your audience about yourself"
                  />
                  {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Website URL</label>
                  <Input {...register("website")} placeholder="https://..." />
                  {errors.website && <p className="text-destructive text-sm mt-1">{errors.website.message}</p>}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button type="submit" variant="gradient" disabled={isPending} className="gap-2">
                    {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
