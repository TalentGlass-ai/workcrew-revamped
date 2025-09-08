// components/ProfileChip.tsx
export default function ProfileChip() {
  return (
    <div className="wc-chip">
      <img
        src="/images/avatar-lady.png"
        alt="Profile"
        className="wc-chip-ava"
        width={45}
        height={45}
      />
      <div className="wc-chip-lines">
        <div className="wc-shimmer wc-w1"></div>
        <div className="wc-shimmer wc-w2"></div>
      </div>
    </div>
  );
}
