"use client";// currently not used as no api for blogs right now 

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";
import { Calendar, Clock, ArrowRight } from "lucide-react";

type Blog = {
  id: number | string;
  title: string;
  date: string;
  readTime: string;
  category?: string;
  image?: string;
  excerpt?: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = [
    "AI & technology",
    "Career growth",
    "Remote work",
    "Interview tips",
    "Diversity & inclusion",
  ];

  // Simulated API fetch (placeholder)
  useEffect(() => {
    async function fetchBlogs() {
      try {
        // pretend we called an API
        throw new Error("No API available yet");
      } catch {
        // temporary hardcoded blogs
        setBlogs([
          {
            id: 1,
            title:
              "Have you heard? WorkCrew, a new job portal is your best way to grow and find a Tech Job!",
            date: "January 15, 2024",
            readTime: "8 min read",
            category: "Career growth",
            image: "/images/blog/jobmatchmaker.png",
          },
          {
            id: 2,
            title:
              "The Human Algorithm: How Technology Reshapes Personal Identity",
            date: "January 15, 2024",
            readTime: "8 min read",
            category: "AI & technology",
            image: "/images/blog/humanalgo.png",
          },
          {
            id: 3,
            title:
              "Navigating the Digital Self: The Impact of Technology on Personal Identity",
            date: "January 15, 2024",
            readTime: "8 min read",
            category: "Diversity & inclusion",
            image: "/images/blog/digitalself.png",
          },
          {
            id: 4,
            title:
              "Reimagining Community: Building Connections in a Virtual World",
            date: "January 15, 2024",
            readTime: "8 min read",
            category: "Remote work",
            image: "/images/blog/virtualworld.png",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const filteredBlogs = activeTag
    ? blogs.filter((b) => b.category === activeTag)
    : blogs;

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <NewNavbar />

      {/* Hero */}
      <section className="relative">
        <div
          className="relative flex h-[274px] items-center justify-center text-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, #5A52EE 0%, #5046E6 70%, #433BC8 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.3,
            }}
          />
          <div className="relative z-10 px-4 max-w-4xl">
            <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight">
              Browse our resources
            </h1>
            <p className="mt-4 text-white/90 text-base md:text-lg">
              Explore expert takes, industry trends, and practical tips on
              recruitment, AI in HR, and building better teams — straight from
              the minds behind WorkCrew.ai.
            </p>
          </div>
        </div>
      </section>

      {/* Featured row */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6 py-12">
        <div className="md:col-span-2 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-[617px] h-[420px]">
            <Image
              src="/images/blog/ai-feature.png"
              alt="The future of AI in recruitment: beyond resume screening"
              width={617}
              height={420}
              className="object-cover w-[617px] h-[420px] rounded-2xl"
            />
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-sm text-white px-5 py-4 flex items-center justify-start rounded-lg"
              style={{ width: "613px", height: "83px" }}
            >
              <h2 className="text-base font-medium leading-snug">
                The future of AI in recruitment: beyond resume screening
              </h2>
            </div>
          </div>
        </div>

        <aside>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Other featured posts
          </h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="bg-gray-200 rounded-md flex-shrink-0 w-[67px] h-[67px]" />
                <p className="text-sm text-gray-700">
                  Have you heard? WorkCrew, a new job portal is your best way to
                  grow and find a Tech Job!
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* All articles */}
      <section className="py-20 px-6 text-center bg-white">
        <h2
          className="mb-10"
          style={{
            fontFamily: "var(--font-schibsted)",
            fontSize: 48,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: "auto",
            color: "#5A52EE",
          }}
        >
          All articles
        </h2>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-5 py-2 rounded-full text-sm border transition-all duration-200 ${
                activeTag === tag
                  ? "bg-[#5A52EE] text-white border-[#5A52EE]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tag}
              {activeTag === tag && (
                <span className="ml-2 text-white text-xs font-semibold">✕</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gray-500">Loading articles…</p>
        ) : filteredBlogs.length === 0 ? (
          <p className="text-gray-500">
            No articles match this category yet. (API not ready — showing
            placeholder content.)
          </p>
        ) : (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 text-left">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="border-b pb-10">
                <div className="flex items-center text-sm text-gray-400 gap-6 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {blog.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {blog.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-snug">
                  {blog.title}
                </h3>
                <Image
                  src={blog.image || "/images/blog/ai-feature.png"}
                  alt={blog.title}
                  width={600}
                  height={260}
                  className="rounded-xl object-cover w-full"
                />
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Subscribe — flexible height; ends 50px above footer */}
      <section className="px-6 mt-10 mb-[50px] flex justify-center">
        <div
          className="w-full max-w-[1190px] border rounded-[30px] flex flex-col items-center justify-center text-center"
          style={{
            padding: "60px 40px",
            background:
              "linear-gradient(90deg, rgba(147,129,250,0.17) 0%, rgba(169,195,247,0.10) 100%)",
            borderColor: "#D9D9D9",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-schibsted)",
              fontWeight: 500,
              fontSize: 48,
              letterSpacing: "0.03em",
              color: "#0B0B0B",
            }}
          >
            Want to stay updated?
          </h2>
          <p
            className="mt-2 mb-10"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "27px",
              letterSpacing: "0.03em",
              color: "#3A3A3A",
            }}
          >
            Get the latest insights delivered to your inbox weekly.
          </p>

          {/* Email row: fixed width 559; gap 36 */}
          <div
            className="flex flex-col sm:flex-row justify-center items-center"
            style={{ width: 559, gap: 36 }}
          >
            {/* Input: rectangular with curved edges (371×50) */}
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-4 text-[15px] text-gray-800 placeholder:text-gray-400 border border-gray-200 focus:outline-none shadow-sm"
              style={{
                width: 371,
                height: 50,
                borderRadius: 12, // curved edges (not a pill)
                background: "#FFFFFF",
              }}
            />

            {/* Button: pill 152×50 */}
            <button
              className="text-white inline-flex items-center justify-center gap-2"
              style={{
                width: 152,
                height: 50,
                borderRadius: 9999, // pill
                background:
                  "linear-gradient(90deg, #6C5CE7 0%, #3B6AF7 100%)",
                boxShadow:
                  "0 8px 22px rgba(61,79,255,0.23), inset 0 0 0 1px rgba(255,255,255,0.25)",
                fontWeight: 600,
              }}
            >
              <ArrowRight className="w-5 h-5" />
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <NewFooter />
    </main>
  );
}
