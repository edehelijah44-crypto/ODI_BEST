import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetSubscription, useUpgradeSubscription, useCancelSubscription } from "@workspace/api-client-react";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    icon: Sparkles,
    color: "text-muted-foreground",
    borderColor: "border-white/10",
    features: [
      "5 posts per month",
      "2 platforms connected",
      "Basic post editor",
      "Community support",
    ],
    limits: ["No scheduling", "No analytics", "No bulk publishing"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 9,
    period: "month",
    icon: Zap,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    badge: "Popular",
    features: [
      "30 posts per month",
      "3 platforms connected",
      "Post scheduling",
      "Custom captions per platform",
      "Email support",
    ],
    limits: ["No advanced analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    icon: Crown,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    badge: "Best Value",
    featured: true,
    features: [
      "200 posts per month",
      "5 platforms connected",
      "Advanced scheduling",
      "Full analytics dashboard",
      "Custom hashtags per platform",
      "Priority support",
      "Content calendar",
    ],
    limits: [],
  },
  {
    id: "business",
    name: "Business",
    price: 79,
    period: "month",
    icon: Building2,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    features: [
      "Unlimited posts",
      "All platforms connected",
      "Advanced analytics + exports",
      "Team collaboration (up to 5)",
      "API access",
      "White-label options",
      "Dedicated account manager",
      "SLA support",
    ],
    limits: [],
  },
];

export default function Pricing() {
  const { data: subscription } = useGetSubscription();
  const upgradeMutation = useUpgradeSubscription();
  const cancelMutation = useCancelSubscription();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    setUpgrading(planId);
    try {
      await upgradeMutation.mutateAsync({ data: { plan: planId as any } });
      window.location.reload();
    } catch {
      // handle error
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep access until the end of your billing period.")) return;
    await cancelMutation.mutateAsync({});
    window.location.reload();
  };

  const currentPlan = subscription?.plan || "free";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">Pricing</Badge>
        <h1 className="text-4xl font-bold text-white mb-4">
          Scale your reach,<br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">without the manual work</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Start free. Upgrade when you're ready to grow. Cancel anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      {subscription && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-semibold capitalize">Current plan: {currentPlan}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {currentPlan !== "free" && !subscription.cancelAtPeriodEnd && (
              <Button variant="outline" size="sm" onClick={handleCancel} className="border-white/10 text-muted-foreground hover:text-white">
                Cancel Subscription
              </Button>
            )}
            {subscription.cancelAtPeriodEnd && (
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Canceling at period end</Badge>
            )}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan, idx) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className={`relative h-full flex flex-col ${plan.borderColor} ${plan.featured ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className={plan.featured ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0" : "bg-blue-500/20 text-blue-400 border-blue-500/20"}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-0 pt-7">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${plan.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground text-sm">/{plan.period}</span>}
                    {plan.price === 0 && <span className="text-muted-foreground text-sm">/{plan.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 pt-6">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.limits?.map(l => (
                      <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground/60 line-through">
                        <span className="w-4 h-4 mt-0.5 shrink-0 text-center text-xs">✕</span>
                        {l}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" className="w-full border-white/10 text-muted-foreground cursor-default" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" className="w-full border-white/10 text-muted-foreground" disabled={currentPlan === "free"} onClick={() => handleUpgrade("free")}>
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button
                      variant={plan.featured ? "gradient" : "outline"}
                      className={`w-full gap-2 ${!plan.featured ? "border-white/10 hover:bg-white/5" : ""}`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={!!upgrading}
                    >
                      {upgrading === plan.id ? "Upgrading..." : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ / Note */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground text-sm">
          All plans include SSL security, uptime monitoring, and regular feature updates. <br />
          Payments are processed securely via Stripe. Need a custom plan?{" "}
          <a href="mailto:hello@socialconnect.app" className="text-violet-400 hover:underline">Contact us</a>.
        </p>
      </div>
    </motion.div>
  );
}
