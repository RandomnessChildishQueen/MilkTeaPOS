import Mascot from "@/assets/mascot.png";

type HeaderProps = {
  text: string;
};

export default function Header(title: HeaderProps) {
  return (
    <header className="h-20 flex items-center px-6 border-b">
      <div className="flex items-center justify-start">
        <img src={Mascot} alt="logo" className="h-16 w-auto px-2" />
        <h1 className="text-3xl text-primary-dark font-semibold font-heading px-2">
          {title.text}
        </h1>
      </div>
    </header>
  );
}
