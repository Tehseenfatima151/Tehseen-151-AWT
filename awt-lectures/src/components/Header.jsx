export default function Header({ setIsOpen }) {
  return (
    <button className="mob-btn" onClick={() => setIsOpen(prev => !prev)} aria-label="Menu toggle">
      ☰
    </button>
  );
}
