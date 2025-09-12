import FeatureSlides from "./FeatureSlides";

const slides = [
  {
    id: "resume",
    title: "Smart resume parsing",
    copy:
      "AI smartly extracts and organizes your skills, experience, and achievements from any resume format.",
    videoSrc: "/videos/Resume_parser.mp4",           // from Figma-yet to put 
    ctaHref: "#resume-parser",
  },
  {
    id: "matches",
    title: "AI job matching",
    copy:
      "Get matched with roles that truly fit your skills and goals. Quality over quantity, always.",
    videoSrc: "/videos/Job_matches.mp4",
    ctaHref: "#job-matching",
  },
  {
    id: "assess",
    title: "Structured assessments",
    copy:
      "Accurately measure strengths using data-driven, personalized evaluations.",
    videoSrc: "/videos/Assessments.mp4",
    ctaHref: "#assessments",
  },
  // “AI interviews” slide to be done 
];

export default function NewRecruitmentCompanySection() {
  return <FeatureSlides slides={slides} className="mt-16" />;
}
