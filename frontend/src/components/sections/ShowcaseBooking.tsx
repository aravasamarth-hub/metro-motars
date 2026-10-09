import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ParticleButton } from "@/components/kokonut/ParticleButton";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Phone,
  User,
  Bike,
  Sparkles,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function ShowcaseBooking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("hunter-350");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("morning");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number to schedule a test ride.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("VIP Test Ride Confirmed!", {
        description: `Showroom Concierge has reserved this slot for ${name}. We'll WhatsApp your entry gate pass.`,
        duration: 5000,
      });
      setName("");
      setPhone("");
    }, 700);
  };

  return (
    <section id="booking" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Showroom Address & Experience Info */}
        <div className="lg:col-span-5">
          <MotionReveal direction="left">
            <Badge
              variant="outline"
              className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
            >
              VIP CONCIERGE & TEST DRIVE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
              Experience the Machine Firsthand
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-8">
              Book a private test ride at our flagship Indiranagar showroom. Our team prepares the
              vehicle, warms the engine, and readies full diagnostic service logs for your review.
            </p>

            <div className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 dark:text-white font-bold text-sm">
                    Metro Motors Flagship Showroom
                  </strong>
                  <span>100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore, Karnataka 560038</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <Phone size={18} className="text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 dark:text-white font-bold text-sm">
                    Showroom Direct Hotline
                  </strong>
                  <span>+91 98800 12345 / +91 80 4123 9800 · Open 10:00 AM – 8:30 PM (7 Days)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 dark:text-white font-bold text-sm">
                    Complimentary VIP Amenities
                  </strong>
                  <span>Sanitized riding gear, dyno readout consultation, and zero-obligation valuation.</span>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>

        {/* Right Column: shadcn Form with KokonutUI ParticleButton */}
        <div className="lg:col-span-7">
          <MotionReveal direction="right" delay={0.2}>
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8 rounded-3xl">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black text-neutral-950 dark:text-white">
                    Schedule Your VIP Test Ride
                  </CardTitle>
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                <CardDescription className="text-xs text-neutral-500">
                  Instant slot reservation with automated SMS pass and vehicle preparation
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <User size={13} className="text-neutral-400" />
                        <span>Your Full Name</span>
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-neutral-50 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 text-xs py-5 rounded-xl"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Phone size={13} className="text-neutral-400" />
                        <span>WhatsApp / Mobile Number</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="+91 98800 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-neutral-50 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 text-xs py-5 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Vehicle Choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Bike size={13} className="text-neutral-400" />
                      <span>Select Preferred Vehicle</span>
                    </label>
                    <Select value={vehicle} onValueChange={setVehicle}>
                      <SelectTrigger className="bg-neutral-50 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 text-xs py-5 rounded-xl">
                        <SelectValue placeholder="Choose a certified machine" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                        <SelectItem value="hunter-350">Royal Enfield Hunter 350 (₹1,42,000)</SelectItem>
                        <SelectItem value="duke-390">KTM 390 Duke ABS Gen-3 (₹2,68,000)</SelectItem>
                        <SelectItem value="mt15">Yamaha MT-15 V2 Deluxe (₹1,28,000)</SelectItem>
                        <SelectItem value="ninja-650">Kawasaki Ninja 650 KRT (₹5,20,000)</SelectItem>
                        <SelectItem value="bmw-310">BMW G 310 GS Adventure (₹2,75,000)</SelectItem>
                        <SelectItem value="activa-6g">Honda Activa 6G Premium (₹69,000)</SelectItem>
                        <SelectItem value="custom-eval">Bring My Own Vehicle for Instant Valuation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Preferred Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Calendar size={13} className="text-neutral-400" />
                        <span>Preferred Date</span>
                      </label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-neutral-50 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 text-xs py-5 rounded-xl"
                      />
                    </div>

                    {/* Preferred Time Window */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Clock size={13} className="text-neutral-400" />
                        <span>Time Window</span>
                      </label>
                      <Select value={slot} onValueChange={setSlot}>
                        <SelectTrigger className="bg-neutral-50 dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800 text-xs py-5 rounded-xl">
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                          <SelectItem value="morning">Morning (10:30 AM – 1:00 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (1:30 PM – 4:30 PM)</SelectItem>
                          <SelectItem value="evening">Sunset / Evening (5:00 PM – 8:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit Button with KokonutUI Particle burst */}
                  <div className="pt-3">
                    <ParticleButton
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black py-6 rounded-xl shadow-xl shadow-amber-500/20 text-xs sm:text-sm uppercase tracking-wider"
                    >
                      {submitting ? "Reserving Slot…" : "Confirm VIP Slot & Generate Gate Pass"}
                    </ParticleButton>
                  </div>

                  <p className="text-[11px] text-center text-neutral-500 pt-1">
                    🔒 Zero spam guarantee · Immediate cancellation anytime · Riding license required
                  </p>
                </form>
              </CardContent>
            </Card>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseBooking;
