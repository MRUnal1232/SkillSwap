import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function Marketplace() {
  const [mentors, setMentors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    api.get("/skills").then((res) => setSkills(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = {};
        if (search) params.skill = search;
        if (category) params.category = category;
        if (minRating) params.min_rating = minRating;
        if (availability) params.availability = availability;
        const res = await api.get("/skills/mentors", { params });
        setMentors(res.data);
      } catch {
        // silent
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, minRating, availability]);

  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => s.category))),
    [skills]
  );

  return (
    <AppShell
      title={
        <>
          The <span className="font-serif italic font-normal">marketplace</span>
        </>
      }
      subtitle="Discover mentors, learn new skills, and grow your expertise."
    >
      <div className="liquid-glass rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by skill name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-transparent border-transparent focus:border-border/60"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="md:max-w-[220px] bg-transparent border-transparent focus:border-border/60"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="md:max-w-[180px] bg-transparent border-transparent focus:border-border/60"
        >
          <option value="">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </Select>
        <Select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="md:max-w-[200px] bg-transparent border-transparent focus:border-border/60"
        >
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
        </Select>
      </div>

      {mentors.length === 0 ? (
        <div className="border border-dashed border-border/50 rounded-2xl px-6 py-20 text-center text-muted-foreground">
          No mentors found. Try different filters or check back later.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor, i) => {
            const rating = mentor.avg_rating
              ? Number(mentor.avg_rating).toFixed(1)
              : null;
            return (
              <motion.div
                key={`${mentor.id}-${mentor.skill_name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                whileHover={{ y: -3 }}
                className="group relative liquid-glass rounded-2xl p-6 flex flex-col hover:bg-white/[0.02] transition-colors"
              >
                <Badge tone="outline" className="self-start mb-5">
                  {mentor.category}
                </Badge>

                <h3 className="text-2xl md:text-[28px] font-medium tracking-[-0.5px] leading-tight text-foreground">
                  {mentor.skill_name}
                </h3>

                <div className="flex items-center gap-2 text-sm mt-3">
                  {rating ? (
                    <>
                      <Star
                        className="w-4 h-4 fill-foreground text-foreground"
                        strokeWidth={0}
                      />
                      <span className="font-medium">{rating}</span>
                      <span className="text-muted-foreground">
                        · {mentor.total_reviews} review
                        {mentor.total_reviews === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      No ratings yet
                    </span>
                  )}
                </div>

                <div className="h-px bg-border/40 my-5" />

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center font-semibold text-sm text-foreground shrink-0">
                    {mentor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[2px] text-muted-foreground">
                      Taught by
                    </p>
                    <p className="text-sm font-medium truncate">
                      {mentor.name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link to={`/profile/${mentor.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Link to={`/book/${mentor.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Book <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
